import { google } from 'googleapis'

function getServiceAccountDrive() {
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!key) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not set')
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(key),
    scopes: ['https://www.googleapis.com/auth/drive'],
  })
  return google.drive({ version: 'v3', auth })
}

function getOAuthDrive() {
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  if (!refreshToken || !clientId || !clientSecret) throw new Error('OAuth2 Drive credentials not set')
  const oauth2 = new google.auth.OAuth2(clientId, clientSecret)
  oauth2.setCredentials({ refresh_token: refreshToken })
  return google.drive({ version: 'v3', auth: oauth2 })
}

// Folder ops → service account (no quota issue, no token expiry)
export async function createFolder(name: string, parentFolderId: string): Promise<string> {
  const res = await getServiceAccountDrive().files.create({
    supportsAllDrives: true,
    requestBody: { name, mimeType: 'application/vnd.google-apps.folder', parents: [parentFolderId] },
    fields: 'id',
  })
  return res.data.id!
}

export async function deleteFolder(folderId: string): Promise<void> {
  try {
    await getServiceAccountDrive().files.delete({ fileId: folderId, supportsAllDrives: true })
  } catch {
    console.error(`Failed to delete Drive folder ${folderId}`)
  }
}

// File uploads → OAuth2 only.
// Service account cannot reliably upload files to user-owned Drive folders
// (quota issues + permission complexity), so we rely solely on OAuth.
// If OAuth fails, the upload fails clearly so the user/admin knows to fix it.
async function uploadWithOAuth(
  action: 'create' | 'update',
  params: { name?: string; fileId?: string; mimeType: string; buffer: Buffer; folderId?: string }
): Promise<string> {
  const { Readable } = await import('stream')
  const drive = getOAuthDrive()

  console.log(`[Drive] Using OAuth — action=${action}, name=${params.name}, fileId=${params.fileId}`)
  try {
    if (action === 'update' && params.fileId) {
      const res = await drive.files.update({
        fileId: params.fileId,
        supportsAllDrives: true,
        media: { mimeType: params.mimeType, body: Readable.from(params.buffer) },
        fields: 'id',
      })
      console.log(`[Drive] OAuth update response:`, res.data)
      if (!res.data.id) throw new Error('OAuth update returned no file id')
      return res.data.id
    } else {
      const res = await drive.files.create({
        supportsAllDrives: true,
        requestBody: { name: params.name, parents: params.folderId ? [params.folderId] : undefined },
        media: { mimeType: params.mimeType, body: Readable.from(params.buffer) },
        fields: 'id',
      })
      console.log(`[Drive] OAuth create response:`, res.data)
      if (!res.data.id) throw new Error('OAuth create returned no file id')
      return res.data.id
    }
  } catch (err: unknown) {
    const msg = (err as Error)?.message ?? String(err)
    console.error(`[Drive] OAuth upload failed:`, msg)
    if (msg.includes('invalid_grant')) {
      throw new Error(
        'Google Drive authentication expired. ' +
        'The OAuth refresh token is invalid or expired. ' +
        'Please regenerate a new refresh token and update GOOGLE_DRIVE_REFRESH_TOKEN in .env.local. '
      )
    }
    throw new Error(`Google Drive upload failed: ${msg}`)
  }
}

export async function uploadFile(
  name: string,
  mimeType: string,
  buffer: Buffer,
  folderId: string
): Promise<string> {
  return uploadWithOAuth('create', { name, mimeType, buffer, folderId })
}

export async function updateFile(fileId: string, mimeType: string, buffer: Buffer): Promise<string> {
  return uploadWithOAuth('update', { fileId, mimeType, buffer })
}

export async function setPublicReader(fileId: string): Promise<void> {
  try {
    // Prefer OAuth for permission changes too
    await getOAuthDrive().permissions.create({
      fileId,
      supportsAllDrives: true,
      requestBody: { role: 'reader', type: 'anyone' },
    })
  } catch (err) {
    console.error(`Failed to set public permission on file ${fileId}:`, err)
  }
}

export function getDriveViewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`
}

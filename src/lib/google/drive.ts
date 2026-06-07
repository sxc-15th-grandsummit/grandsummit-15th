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

async function getOAuthAccessToken() {
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  if (!refreshToken || !clientId || !clientSecret) throw new Error('OAuth2 Drive credentials not set')

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret)
  oauth2.setCredentials({ refresh_token: refreshToken })

  const { token } = await oauth2.getAccessToken()
  if (!token) throw new Error('OAuth access token unavailable')

  return token
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

export async function createResumableUploadSession(params: {
  name: string
  mimeType: string
  sizeBytes: number
  folderId: string
  existingFileId?: string | null
  origin?: string | null
}): Promise<string> {
  const token = await getOAuthAccessToken()
  const isUpdate = Boolean(params.existingFileId)
  const endpoint = isUpdate
    ? `https://www.googleapis.com/upload/drive/v3/files/${params.existingFileId}?uploadType=resumable&supportsAllDrives=true`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true'

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json; charset=UTF-8',
    'X-Upload-Content-Type': params.mimeType,
    'X-Upload-Content-Length': String(params.sizeBytes),
  }
  if (params.origin) headers.Origin = params.origin

  const response = await fetch(endpoint, {
    method: isUpdate ? 'PATCH' : 'POST',
    headers,
    body: JSON.stringify({
      name: params.name,
      ...(isUpdate ? {} : { parents: [params.folderId] }),
    }),
  })

  const uploadUrl = response.headers.get('location')
  if (!response.ok || !uploadUrl) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Failed to create Drive upload session: ${detail || response.statusText}`)
  }

  return uploadUrl
}

export async function getDriveFileMetadata(fileId: string): Promise<{
  id: string
  name: string | null
  mimeType: string | null
  size: string | null
  parents: string[] | null
}> {
  const res = await getOAuthDrive().files.get({
    fileId,
    supportsAllDrives: true,
    fields: 'id,name,mimeType,size,parents',
  })

  return {
    id: res.data.id!,
    name: res.data.name ?? null,
    mimeType: res.data.mimeType ?? null,
    size: res.data.size ?? null,
    parents: res.data.parents ?? null,
  }
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

export async function getDriveFileCreatedTime(fileId: string): Promise<string | null> {
  if (fileId.startsWith('supabase:')) return null

  const res = await getOAuthDrive().files.get({
    fileId,
    supportsAllDrives: true,
    fields: 'createdTime',
  })

  return res.data.createdTime ?? null
}

export function getDriveViewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`
}

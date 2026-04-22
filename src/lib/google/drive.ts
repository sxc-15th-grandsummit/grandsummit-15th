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

// File uploads → OAuth2 (files owned by real Google account, no 15GB service account cap)
export async function uploadFile(
  name: string,
  mimeType: string,
  buffer: Buffer,
  folderId: string
): Promise<string> {
  const { Readable } = await import('stream')
  const res = await getOAuthDrive().files.create({
    supportsAllDrives: true,
    requestBody: { name, parents: [folderId] },
    media: { mimeType, body: Readable.from(buffer) },
    fields: 'id',
  })
  return res.data.id!
}

export async function updateFile(fileId: string, mimeType: string, buffer: Buffer): Promise<string> {
  const { Readable } = await import('stream')
  const res = await getOAuthDrive().files.update({
    fileId,
    supportsAllDrives: true,
    media: { mimeType, body: Readable.from(buffer) },
    fields: 'id',
  })
  return res.data.id!
}

export async function setPublicReader(fileId: string): Promise<void> {
  try {
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

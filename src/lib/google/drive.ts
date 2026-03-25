import { google } from 'googleapis'

// Crash fast if key is missing or malformed
const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!)

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccountKey,
  scopes: ['https://www.googleapis.com/auth/drive'],
})

const drive = google.drive({ version: 'v3', auth })

export async function createFolder(name: string, parentFolderId: string): Promise<string> {
  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    },
    fields: 'id',
  })
  return res.data.id!
}

export async function deleteFolder(folderId: string): Promise<void> {
  try {
    await drive.files.delete({ fileId: folderId })
  } catch {
    // Best-effort: log but don't throw
    console.error(`Failed to delete Drive folder ${folderId}`)
  }
}

export async function uploadFile(
  name: string,
  mimeType: string,
  buffer: Buffer,
  folderId: string
): Promise<string> {
  const { Readable } = await import('stream')
  const res = await drive.files.create({
    requestBody: {
      name,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: 'id',
  })
  return res.data.id!
}

export async function updateFile(
  fileId: string,
  mimeType: string,
  buffer: Buffer
): Promise<string> {
  const { Readable } = await import('stream')
  const res = await drive.files.update({
    fileId,
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: 'id',
  })
  return res.data.id!
}

export async function setPublicReader(fileId: string): Promise<void> {
  try {
    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' },
    })
  } catch (err) {
    console.error(`Failed to set public permission on file ${fileId}:`, err)
  }
}

export function getDriveViewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`
}

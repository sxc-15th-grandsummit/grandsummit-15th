import { google } from 'googleapis'

function getSheets() {
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!key) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not set')
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(key),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return google.sheets({ version: 'v4', auth })
}

export const REGISTRATION_SHEET_COLUMNS = [
  'Email',
  'Leader Email',
  'Role',
  'Team Name', 'Competition', 'Join Code',
  'Full Name', 'Student ID (NIM)', 'University / School', 'Major Program', 'Instagram Username',
  'Line ID', 'WhatsApp',
  'Proof of Payment',
  'Task i - KTM', 'Task ii - CV', 'Task iii - Repost Poster', 'Task iv - Share & Broadcast',
  'Task v - Twibbon', 'Task vi - Follow IG', 'Task vii - Follow LinkedIn',
  'Source of Information',
  'Referral Code',
  'Registration Fee',
  'Joined At',
]

export const BCC_SHEET_COLUMNS = [
  ...REGISTRATION_SHEET_COLUMNS,
  'Essay Submission',
  'Originality Statement',
  'AI Usage Declaration',
  'Preliminary Submission Status',
  'Preliminary Submitted At',
]

export async function syncSheet(
  spreadsheetId: string,
  sheetName: string,
  rows: string[][],
  columns = REGISTRATION_SHEET_COLUMNS,
): Promise<void> {
  const sheets = getSheets()

  // Ensure the sheet tab exists
  const meta = await sheets.spreadsheets.get({ spreadsheetId })
  const existingSheets = meta.data.sheets?.map(s => s.properties?.title) ?? []

  if (!existingSheets.includes(sheetName)) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: sheetName } } }],
      },
    })
  }

  // Clear then write
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${sheetName}!A:AZ`,
  })

  const values = [columns, ...rows]
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values },
  })
}

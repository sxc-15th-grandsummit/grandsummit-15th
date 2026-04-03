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

const COLUMNS = [
  'Team Name', 'Competition', 'Join Code',
  'Nama', 'NIM', 'Asal Universitas', 'Major Program', 'Instagram Username',
  'Bukti Pembayaran', 'Bukti Follow',
  'Task i - Repost Poster', 'Task ii - Share & Broadcast',
  'Task iii - Twibbon', 'Task iv - Follow IG', 'Task v - Follow LinkedIn',
  'Joined At',
]

export async function syncSheet(
  spreadsheetId: string,
  sheetName: string,
  rows: string[][]
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
    range: `${sheetName}!A:Z`,
  })

  const values = [COLUMNS, ...rows]
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values },
  })
}

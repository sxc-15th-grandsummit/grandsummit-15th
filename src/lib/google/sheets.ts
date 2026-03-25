import { google } from 'googleapis'

// Crash fast if key is missing or malformed
const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!)

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccountKey,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth })

const COLUMNS = [
  'Team Name', 'Competition', 'Join Code',
  'Nama', 'NIM', 'Asal Universitas', 'Major Program', 'Instagram Username',
  'Bukti Pembayaran Drive URL', 'Bukti Follow Drive URL', 'Joined At',
]

export async function syncSheet(
  spreadsheetId: string,
  sheetName: string,
  rows: string[][]
): Promise<void> {
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

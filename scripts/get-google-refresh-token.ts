/**
 * Script to generate a new Google OAuth refresh token for Drive uploads.
 *
 * Why: Google OAuth refresh tokens for "Testing" apps expire in 7 days.
 * When you see "invalid_grant" errors on upload, run this script.
 *
 * Usage:
 *   1. Make sure GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET are set in .env.local
 *   2. Run: npx tsx scripts/get-google-refresh-token.ts
 *   3. Open the printed URL in your browser
 *   4. Authorize the app (select the Google account that owns the Drive folders)
 *   5. You will be redirected to localhost:3000 with a "code" query param
 *   6. Copy that code and paste it back in the terminal
 *   7. The script will print the new refresh_token — copy it to .env.local
 */

import { google } from 'googleapis'
import readline from 'readline'

const SCOPES = ['https://www.googleapis.com/auth/drive']

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => rl.question(question, (ans) => { rl.close(); resolve(ans.trim()) }))
}

async function main() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error('Error: GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET must be set in environment')
    console.error('Make sure your .env.local is loaded or pass them inline:')
    console.error('  GOOGLE_OAUTH_CLIENT_ID=xxx GOOGLE_OAUTH_CLIENT_SECRET=yyy npx tsx scripts/get-google-refresh-token.ts')
    process.exit(1)
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'http://localhost:3000' // redirect URI
  )

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // force refresh token even if already authorized
  })

  console.log('\n=== Google OAuth Refresh Token Generator ===\n')
  console.log('1. Open this URL in your browser:\n')
  console.log(authUrl)
  console.log('\n2. Authorize with the Google account that owns the BCC/MCC Drive folders.')
  console.log('3. You will be redirected to localhost:3000 (may show "This site can\'t be reached").')
  console.log('4. Copy the "code" value from the URL bar (everything after ?code= and before &scope=).')
  console.log('5. Paste it below:\n')

  const code = await ask('Authorization code: ')

  if (!code) {
    console.error('No code provided. Exiting.')
    process.exit(1)
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)
    console.log('\n=== SUCCESS ===\n')
    console.log('Refresh token (copy this to .env.local):')
    console.log(tokens.refresh_token)
    console.log('\nAlso update .env.local with:')
    console.log(`GOOGLE_DRIVE_REFRESH_TOKEN=${tokens.refresh_token}`)
  } catch (err: unknown) {
    console.error('\nFailed to exchange code for tokens:', (err as Error)?.message ?? err)
    process.exit(1)
  }
}

main()

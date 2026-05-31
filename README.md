# StudentsxCEOs Grand Summit 15th

Production website and registration system for StudentsxCEOs Grand Summit 15th. The app handles public event pages, BCC and MCC registrations, participant profiles, team management, payment and task uploads, admin registration controls, and Google Sheets export.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript strict mode
- Tailwind CSS v4
- Supabase Auth and Postgres
- Google Drive and Google Sheets APIs
- Bun package manager

## Requirements

- Bun
- Supabase project with the required database schema
- Google Cloud project with Drive and Sheets API access
- Google service account for Sheets and Drive folder operations
- Google OAuth credentials for participant file uploads

## Local Setup

Install dependencies:

```bash
bun install
```

Create the local environment file:

```bash
cp .env.example .env.local
```

Fill every required variable in `.env.local`, then run the dev server:

```bash
bun run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
bun run dev
```

Starts the Next.js dev server with Turbopack.

```bash
bun run build
```

Creates a production build. Run this before deployment.

```bash
bun run start
```

Starts the built production app locally.

```bash
bun run lint
```

Runs ESLint.

```bash
bun run backfill:bcc-fees
```

Backfills BCC registration fees from existing registration/payment timestamps. Use only when the matching database columns and production environment variables are already available.

## Environment Variables

Use `.env.example` as the source of truth for required keys.

### Supabase

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL used by client and server code. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key used by browser auth/session flows. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only service role key for API route mutations. Never expose this client-side. |

### Google Drive and Sheets

| Variable | Purpose |
| --- | --- |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Single-line service account JSON string for Sheets sync and Drive folder operations. |
| `GOOGLE_SHEET_ID` | Spreadsheet ID used by admin sheet sync. |
| `BCC_DRIVE_FOLDER_ID` | Parent Drive folder for BCC team folders. |
| `MCC_DRIVE_FOLDER_ID` | Parent Drive folder for MCC team folders. |
| `GOOGLE_OAUTH_CLIENT_ID` | OAuth client ID used for participant file uploads. |
| `GOOGLE_OAUTH_CLIENT_SECRET` | OAuth client secret used for participant file uploads. |
| `GOOGLE_DRIVE_REFRESH_TOKEN` | Refresh token for the Google account that owns the Drive folders. |

The service account key must be stored as compact one-line JSON:

```bash
cat key.json | python3 -c "import json,sys; print(json.dumps(json.load(sys.stdin)))"
```

If file uploads start failing with `invalid_grant`, regenerate the refresh token or publish the OAuth consent app. The helper script is:

```bash
bun scripts/get-google-refresh-token.ts
```

### Links and Admin

| Variable | Purpose |
| --- | --- |
| `BCC_GUIDEBOOK_URL` | BCC guidebook link shown in public pages. |
| `MCC_GUIDEBOOK_URL` | MCC guidebook link shown in server-rendered public pages. |
| `NEXT_PUBLIC_MCC_GUIDEBOOK_URL` | MCC guidebook link used by client-side registration pages. |
| `ADMIN_EMAILS` | Comma-separated list of Google account emails allowed to access `/admin`. |

## Auth and Access Control

Supabase Google OAuth is used for participant login. Users must complete their profile before registration. Required profile fields are:

- `nama`
- `nim`
- `asal_universitas`
- `major_program`
- `instagram_username`
- `line_id`
- `wa_no`

Admin access is email-based through `ADMIN_EMAILS`. Admin users can view team data, toggle BCC/MCC registration status, and trigger Google Sheets sync.

## Registration Rules

- BCC teams support up to 4 members.
- MCC registrations are team-only with 2-3 members.
- Users can only join one team per competition.
- Team creation creates a Google Drive folder under the configured BCC or MCC parent folder.
- Sheet sync writes BCC and MCC team data to separate spreadsheet tabs.

## Deployment Checklist

Before deploying to production:

1. Run `bun run build`.
2. Confirm `.env.local` values are mirrored in the deployment provider.
3. Confirm `SUPABASE_SERVICE_ROLE_KEY` is only configured as a server-side secret.
4. Confirm Google Drive parent folders are shared with the service account and OAuth owner as needed.
5. Confirm `GOOGLE_SHEET_ID` points to the production spreadsheet.
6. Confirm `ADMIN_EMAILS` contains every production admin email.
7. Confirm BCC and MCC registration settings are correct in the `settings` table or through `/admin`.
8. Test Google login, profile completion, team creation, file upload, and admin sheet sync on the deployed URL.

## Production Operations

### Toggle Registration

Go to `/admin` with an authorized admin email. Use the BCC/MCC registration controls to open or close each competition.

### Sync Google Sheets

Use the sync action in `/admin`. The sync uses `GOOGLE_SHEET_ID` and writes BCC and MCC registrations into their respective tabs.

### File Uploads

Participant uploads use OAuth credentials and the configured refresh token. Folder creation uses the service account and the competition-specific Drive folder IDs.

### Database Changes

Raw SQL migrations live under `supabase/migrations/`, but migration SQL files are intentionally gitignored in this repository. Apply required database changes directly to the target Supabase project before deploying code that depends on them.

## Project Structure

```text
src/app/competition
```

Public BCC/MCC pages and registration flows.

```text
src/app/api
```

Server API routes for profile, teams, uploads, admin actions, and Sheets sync.

```text
src/lib/supabase
```

Supabase server, client, middleware, and admin helpers.

```text
src/lib/google
```

Google Drive and Sheets integrations.

```text
src/lib/sync-sheets.ts
```

Registration export pipeline for Google Sheets.

```text
scripts/
```

Operational scripts for token generation and data backfills.

## Notes

- Use Bun for all package and script commands.
- Do not commit `.env.local`, service account keys, OAuth refresh tokens, or downloaded participant files.
- Keep middleware route matching narrow so Supabase user checks do not run on every API request.

# Agent Guide

## Stack & Commands
- **Package manager:** Bun (`bun.lock` present). Prefer `bun` over npm/yarn.
- **Dev server:** `bun run dev` — uses Next.js Turbopack.
- **Lint:** `bun run lint` (runs `eslint`, not `next lint`).
- **Build:** `bun run build`.
- **No test runner** is configured.

## Architecture
- **Next.js 16 App Router**, React 19, Tailwind CSS v4 (`@tailwindcss/postcss`), TypeScript strict.
- **Path alias:** `@/*` → `./src/*`.
- **React Compiler** enabled in `next.config.ts`.

### Auth & Database
- **Supabase** handles auth (Google OAuth) and Postgres data.
- `src/lib/supabase/server.ts` exports **two** server clients:
  - `createClient()` — service role, **bypasses RLS**, cookie no-ops. Use for DB mutations in API routes.
  - `getSessionUser()` — anon key, reads cookies. Use to identify the caller.
- `src/lib/supabase/client.ts` is the browser client for client components.

### Middleware (`src/middleware.ts`)
- Matcher is **intentionally narrow**: `/profile`, `/competition/*/register`, `/admin`.
- **Do NOT add a catch-all** — the dev explicitly avoided running `supabase.auth.getUser()` on every API request.
- Route guards:
  - `/profile` → requires login.
  - `/competition/*/register` → requires login + complete profile.
  - `/admin` → requires login + email in `ADMIN_EMAILS`.

### Profile Completeness
- Users must fill `nama`, `nim`, `asal_universitas`, `major_program`, `instagram_username`, `line_id`, `wa_no` before registering.
- Check logic lives in `src/lib/profile.ts` (`isProfileComplete`).
- Incomplete users hitting competition registration are redirected to `/profile?toast=complete-profile`.

### Admin
- Admin access is **email-based** via comma-separated `ADMIN_EMAILS`.
- `src/lib/supabase/requireAdmin.ts` returns `{ ok, user } | { ok, response }` — do not throw.

## External Integrations
### Google Drive & Sheets
- **Service account** (`GOOGLE_SERVICE_ACCOUNT_KEY` as single-line JSON) is used for:
  - Drive folder creation/deletion.
  - Google Sheets sync (`src/lib/google/sheets.ts`).
- **OAuth2** (`GOOGLE_DRIVE_REFRESH_TOKEN` + client creds) is used for **file uploads** to avoid the 15 GB service account storage cap.
- `src/lib/sync-sheets.ts` syncs all team registrations to a Google Sheet (BCC and MCC tabs).

### Supabase Storage
- Some files are stored in Supabase Storage instead of Drive.
- In sheet sync, Storage file IDs are prefixed with `supabase:` and rendered as `'(supabase storage)'`.

## Database
- Raw SQL migrations live in `supabase/migrations/`.
- **Migrations are gitignored** (`/supabase/migrations/**/*.sql` in `.gitignore`) — do not commit them.
- Key tables: `profiles`, `teams`, `team_members`, `settings`.
- BCC teams allow max 4 members (migration `007_bcc_max_4_members.sql` overrides the default trigger limit of 3).

## Env Vars
Copy `.env.example` to `.env.local` (already present and gitignored). Key vars:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_SERVICE_ACCOUNT_KEY` (single-line JSON string)
- `GOOGLE_SHEET_ID`, `BCC_DRIVE_FOLDER_ID`, `MCC_DRIVE_FOLDER_ID`
- `ADMIN_EMAILS` (comma-separated)

## Style & Conventions
- Fonts: `Plus_Jakarta_Sans` (primary) and `Poppins` via `next/font/google`.
- Tailwind v4 theme tokens are defined in `src/app/globals.css` (e.g., `--color-primary-dark`, `--color-accent-teal`).
- Framer Motion is used for scroll-triggered animations; reusable `revealUp` config is in `src/constants/index.ts`.
- Page metadata (SEO / OpenGraph) is centralized in `src/app/layout.tsx`.

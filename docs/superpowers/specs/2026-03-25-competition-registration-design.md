# Competition Registration System — Design Spec
**Date:** 2026-03-25
**Project:** SXC Grand Summit 15th
**Stack:** Next.js (App Router) + Supabase (Auth, Postgres, Storage) + Google APIs (Drive, Sheets)

---

## Overview

A full-stack registration system for two competitions (BCC and MCC) built into the existing Next.js landing page. Users log in with Google, complete a profile, form or join a team, and upload payment/follow proofs. Admins can toggle registration open/close and export all data to CSV or Google Sheets.

---

## 1. Database Schema (Supabase Postgres)

### `profiles`
Created automatically on first Google login via Supabase auth trigger.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK + FK → auth.users (one profile per user, enforced by PK) |
| nama | text | nullable until is_complete |
| nim | text | nullable until is_complete |
| asal_universitas | text | nullable until is_complete |
| major_program | text | nullable until is_complete |
| instagram_username | text | nullable until is_complete |
| is_complete | boolean | default false |
| created_at | timestamp | default now() |

`POST /api/profile` is an **upsert** (`ON CONFLICT (id) DO UPDATE`) — safe to call multiple times.

### `teams`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | Team name set by leader |
| competition | text | CHECK (competition IN ('BCC', 'MCC')) |
| join_code | text, unique | Auto-generated. Format: `GS-` + 4 uppercase alphanumeric chars, excluding ambiguous chars (`0`, `O`, `I`, `1`). Retry up to 5 times on unique collision. |
| leader_id | uuid | FK → profiles |
| bukti_pembayaran_drive_id | text | Google Drive file ID (nullable) |
| bukti_follow_drive_id | text | Google Drive file ID (nullable) |
| drive_folder_id | text | Google Drive folder ID for this team's subfolder (nullable until created) |
| created_at | timestamp | default now() |

**Unique constraint:** `(name, competition)` — no two teams in the same competition may share a name. Error returned to client: `"Team name already taken for this competition"`.

### `team_members`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| team_id | uuid | FK → teams |
| profile_id | uuid | FK → profiles |
| joined_at | timestamp | default now() |

**Constraints:**
- Unique: `(team_id, profile_id)` — no duplicate members
- Max 3 members enforced at **API level** before insert AND at **database level** via a Postgres trigger that raises an exception if a 4th member would be inserted
- A user may not be in more than one team per competition — enforced at API level by checking `team_members JOIN teams WHERE profile_id = ? AND competition = ?` before any insert

### `settings`

| Column | Type | Notes |
|---|---|---|
| key | text | PK |
| value | text | |

**Seed values required on first deploy (database migration):**
```sql
INSERT INTO settings (key, value) VALUES
  ('bcc_registration_open', 'false'),
  ('mcc_registration_open', 'false');
```

If a key is missing at runtime, the application treats that competition's registration as **closed**. Default is always closed until explicitly opened by admin.

---

## 2. Row-Level Security (RLS)

All data access goes through **server-side API routes only**, using `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS. Client-side Supabase (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) is used **only** for:
- Reading the current session (`supabase.auth.getSession()`)
- Google OAuth sign-in/sign-out (`supabase.auth.signInWithOAuth()`)

**RLS policies as a safety layer (defense in depth):**
- `profiles`: users can read/update only their own row (`auth.uid() = id`)
- `teams`: authenticated users can read (for join-by-code lookup); no direct client insert/update
- `team_members`: authenticated users can read their own memberships; no direct client insert
- `settings`: read-only for all authenticated users; no client writes

---

## 3. Authentication & Profile Flow

### Google OAuth
- Supabase Auth handles Google OAuth entirely
- On first login, a Postgres trigger inserts a row into `profiles` with `is_complete = false`
- User is redirected to `/profile` to complete their details

### Profile Completion
- `POST /api/profile` — upserts Nama, NIM, Asal Universitas, Major Program, Instagram Username → sets `is_complete = true`
- If user returns to `/profile` with `is_complete = false`, the form is pre-filled with any previously saved partial data (query profile row on page load)
- If user returns to `/profile` with `is_complete = true`, the form shows current data for editing

### Route Protection (enforced in Next.js middleware at `src/middleware.ts`)
| Route | Requirement |
|---|---|
| `/profile` | Session exists |
| `/competition/[slug]/register` | Session exists + `is_complete = true` |
| `/admin` | Session exists + email in `ADMIN_EMAILS` |

Unauthenticated → redirect to `/`. Incomplete profile → redirect to `/profile`.

---

## 4. Admin Authentication

Admin auth lives in a **single shared utility function** `lib/supabase/requireAdmin.ts`:

```ts
// Returns the session user if admin, throws a Response(403) otherwise
export async function requireAdmin(request: Request): Promise<User>
```

**Every `/api/admin/*` route calls `requireAdmin(request)` as its first line.** Omitting this call in any admin route is a security defect and must be caught in code review.

The function verifies:
1. Valid Supabase session (via server client)
2. Session user email is in `ADMIN_EMAILS` env var

`ADMIN_EMAILS` format: **comma-separated string, whitespace trimmed per entry.**

Parsing:
```ts
const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) ?? []
```

Returns 403 if session is missing or email is not in the list. Never relies on client-side state.

---

## 5. Competition Page (`/competition`)

Two cards — BCC and MCC — each containing:
- Short description text
- **Download Guidebook** button → direct link to `BCC_GUIDEBOOK_URL` / `MCC_GUIDEBOOK_URL` env vars (Google Drive file share link, set manually by admin)
- **Register** button → navigates to `/competition/bcc/register` or `/competition/mcc/register`

**Slug-to-competition mapping:**
- `bcc` → `'BCC'`
- `mcc` → `'MCC'`
- Any other slug → Next.js 404

If registration is closed (settings key = `'false'` or key missing), the Register button is disabled with label "Registration Closed".

---

## 6. Registration Flow

### `/competition/[slug]/register`

On page load: query `team_members JOIN teams WHERE profile_id = session.user.id AND competition = slug_competition`. If found → redirect to team dashboard.

Otherwise show two options:

#### Create Team
1. User enters a team name
2. `POST /api/teams/create`:
   - Validates registration is open
   - Validates user has no existing team in this competition
   - Validates team name is unique within competition (unique DB constraint — return user-friendly error if violated)
   - Generates unique join code server-side (uppercase + trimmed)
   - **Drive folder creation order (with full rollback):**
     1. Insert `teams` row into DB (without `drive_folder_id`)
     2. Create Google Drive subfolder named `[COMPETITION]-[TeamName]` inside the competition parent folder
     3. Update the `teams` row with `drive_folder_id`
     4. Insert `team_members` row for leader
     - If step 2 (Drive) fails → delete `teams` row, return 500
     - If step 3 (DB update) fails → delete `teams` row + delete Drive folder (best-effort), return 500
     - If step 4 (team_member insert) fails → delete `teams` row + delete Drive folder (best-effort), return 500
     - This ensures no orphaned DB rows or Drive folders at any failure point
   - **Join code collision:** Retry up to 5 times on unique constraint violation. If all 5 attempts collide, return 500 with message `"Could not generate a unique team code, please try again"`. (With ~1M valid codes and expected team counts in the hundreds, this is extremely unlikely.)
3. Returns team data. User sees team dashboard with copyable join code.

#### Join Team
1. User enters a join code
2. `POST /api/teams/join`:
   - Server normalizes input: trim whitespace + convert to uppercase before DB lookup
   - Validates registration is open
   - Finds team by `join_code` (exact match after server-side normalization — case-insensitive from user's perspective)
   - Validates `team.competition` matches the current slug's competition value
   - Validates team has fewer than 3 members
   - Validates user is not already in a team for this competition
   - Inserts `team_members` row
3. User lands on team dashboard.

### Team Dashboard
Shown after creating/joining (and on return visits):
- Team name, competition, join code (copyable)
- Member list (up to 3): Nama + Asal Universitas per member
- Upload section:
  - **Bukti Pembayaran** (payment proof): accepts `image/*` and `application/pdf`, max 10MB
  - **Bukti Follow Instagram** (screenshot): accepts `image/*`, max 5MB
  - Both client and server validate file type and size
  - Each field has its own upload button (independent uploads)
  - Shows "Uploaded ✓" with Drive view link if already uploaded; empty state if not

---

## 7. Upload Flow (`POST /api/teams/upload`)

**Authorization:** The server resolves the uploading user's team by querying `team_members JOIN teams WHERE profile_id = session.user.id AND competition = [field_competition]`. The team ID is **never trusted from the request body** — it is always derived from the authenticated session. Returns 403 if user is not a member of a team in the specified competition.

**Steps:**
1. Validate file type and size server-side (return 400 on violation)
2. Upload file to Supabase Storage using `upload({ upsert: true })` (bucket: `uploads`, path: `[team_id]/[field_name]`). The `upsert: true` flag is required — without it, re-uploads fail with a duplicate error.
3. Read file buffer from Supabase Storage
4. Upload to Google Drive into the team's `drive_folder_id`:
   - If `bukti_pembayaran_drive_id` / `bukti_follow_drive_id` is set → call `drive.files.update` with that file ID
   - If `drive.files.update` returns **404 specifically** → fall back to `drive.files.create`, update stored ID. All other `drive.files.update` errors (403, 500, etc.) propagate immediately as upload failure — do NOT fall back to create.
   - If no existing file ID → call `drive.files.create`
5. Save returned Drive file ID to `teams.bukti_pembayaran_drive_id` or `teams.bukti_follow_drive_id` in DB
6. Set sharing permission on the uploaded file: `anyoneWithLink` + `reader` role (called after DB save — if permission call fails, log the error but do not fail the upload; the admin can manually set sharing on the Drive folder)
7. If Drive upload fails (step 4) after Storage upsert (step 2): return 500. Storage file is left in place as a recovery artifact. Show "Upload failed — please try again" in team dashboard.
8. Return Drive view URL: `https://drive.google.com/file/d/[fileId]/view`

---

## 8. API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/profile` | Session | Upsert profile data |
| POST | `/api/teams/create` | Session + complete profile | Create team, generate join code, create Drive folder |
| POST | `/api/teams/join` | Session + complete profile | Join team by join code (server normalizes code) |
| POST | `/api/teams/upload` | Session + team member (resolved from session) | Upload file to Drive, update team record |
| GET | `/api/admin/export` | Session + admin email | Stream CSV of all teams + member profiles |
| POST | `/api/admin/sync-sheets` | Session + admin email | Overwrite Google Sheet with all current data |
| POST | `/api/admin/toggle-registration` | Session + admin email | Set settings key to 'true' or 'false' |

---

## 9. Admin System (`/admin`)

**Dashboard:**
- Total teams per competition (BCC / MCC)
- Total registered members
- Registration open/close toggle per competition (calls `POST /api/admin/toggle-registration`)

**Team table:** Team Name, Competition, Join Code, Members (Nama, NIM, Universitas), Bukti Pembayaran link, Bukti Follow link, Created At

**CSV Export (`GET /api/admin/export`):**
- One row per member (teams repeated per member)
- Missing upload URLs → empty string (`""`)
- Columns (fixed order):
  ```
  Team Name, Competition, Join Code, Nama, NIM, Asal Universitas, Major Program, Instagram Username, Bukti Pembayaran Drive URL, Bukti Follow Drive URL, Joined At
  ```
- Encoding: UTF-8 with BOM for Excel compatibility
- Response header: `Content-Disposition: attachment; filename="registrations.csv"`

**Google Sheets Sync (`POST /api/admin/sync-sheets`):**
- Strategy: **clear the target range then rewrite** (not append). Prevents duplicate rows.
- Two tabs: `BCC` and `MCC`
- On each sync: write header row first, then all current data rows
- Columns mirror CSV export exactly. Missing upload URLs → empty string.
- Concurrency: concurrent admin syncs are an **accepted risk** at this scale. No locking is implemented. The last writer wins. Admins should avoid concurrent syncs.

---

## 10. Google Cloud Setup (One-Time Manual Steps)

1. Create a Google Cloud project at `console.cloud.google.com`
2. Enable **Google Drive API** and **Google Sheets API**
3. Create a **Service Account** → Create JSON key → Download the file
4. Share both competition Drive folders (`BCC` parent folder, `MCC` parent folder) with the service account email as **Editor**
5. Share the Google Sheet with the service account email as **Editor**
6. Set `GOOGLE_SERVICE_ACCOUNT_KEY` env var:
   - The value must be the **full JSON content as a single-line string**
   - The private key field must have literal `\n` escape sequences (not actual newlines)
   - Run: `cat key.json | python3 -c "import json,sys; print(json.dumps(json.load(sys.stdin)))"` to produce a safe single-line value
   - Startup validation: at app boot (in `lib/google/drive.ts` and `lib/google/sheets.ts` module initialization), call `JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!)`. If it throws, **throw the error** (crash fast) — do not catch and log. A missing or malformed key must cause the deployment to fail visibly, not silently serve a broken app.

---

## 11. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google (service account JSON as single-line string — private key uses \n escapes)
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
GOOGLE_SHEET_ID=
BCC_DRIVE_FOLDER_ID=
MCC_DRIVE_FOLDER_ID=
BCC_GUIDEBOOK_URL=
MCC_GUIDEBOOK_URL=

# Admin (comma-separated, whitespace trimmed per entry)
ADMIN_EMAILS=alice@gmail.com, bob@gmail.com
```

---

## 12. New Pages & File Structure

```
src/
├── app/
│   ├── profile/
│   │   └── page.tsx               # Profile form (pre-filled if partial data exists)
│   ├── competition/
│   │   ├── page.tsx               # BCC + MCC cards
│   │   └── [slug]/
│   │       └── register/
│   │           └── page.tsx       # Create/join team + team dashboard
│   ├── admin/
│   │   └── page.tsx               # Admin dashboard
│   └── api/
│       ├── profile/route.ts
│       ├── teams/
│       │   ├── create/route.ts
│       │   ├── join/route.ts
│       │   └── upload/route.ts
│       └── admin/
│           ├── export/route.ts
│           ├── sync-sheets/route.ts
│           └── toggle-registration/route.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser Supabase client (anon key, auth only)
│   │   ├── server.ts              # Server Supabase client (service role key)
│   │   ├── middleware.ts          # Route protection logic
│   │   └── requireAdmin.ts        # Shared admin auth utility — used as first call in every /api/admin/* handler
│   └── google/
│       ├── drive.ts               # Drive API: create folder, upload file, update file, set permissions
│       └── sheets.ts              # Sheets API: clear range, write rows
├── middleware.ts                   # Next.js middleware entry point
```

---

## 13. Out of Scope

- Team leader transfer
- Member removal from team
- Payment verification workflow for admin (admin sees proof links, verification is manual)
- Email notifications
- Team deletion
- Rate limiting on API routes

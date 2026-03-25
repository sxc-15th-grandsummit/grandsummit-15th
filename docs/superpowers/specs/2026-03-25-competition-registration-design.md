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
| id | uuid | FK → auth.users |
| nama | text | |
| nim | text | |
| asal_universitas | text | |
| major_program | text | |
| instagram_username | text | |
| is_complete | boolean | false until all fields filled |
| created_at | timestamp | |

### `teams`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | Team name set by leader |
| competition | enum | 'BCC' or 'MCC' |
| join_code | text, unique | Auto-generated e.g. GS-4X7K |
| leader_id | uuid | FK → profiles |
| bukti_pembayaran_url | text | Google Drive file URL |
| bukti_follow_url | text | Google Drive file URL |
| drive_folder_id | text | Google Drive folder ID for this team |
| created_at | timestamp | |

### `team_members`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| team_id | uuid | FK → teams |
| profile_id | uuid | FK → profiles |
| joined_at | timestamp | |

Max 3 members enforced at API level. A user can only be in one team per competition.

### `settings`

| Column | Type | Notes |
|---|---|---|
| key | text | PK. e.g. 'bcc_registration_open', 'mcc_registration_open' |
| value | text | 'true' or 'false' |

---

## 2. Authentication & Profile Flow

### Google OAuth
- Supabase Auth handles Google OAuth entirely
- On first login, a Postgres trigger inserts a row into `profiles` with `is_complete = false`
- User is redirected to `/profile` to complete their details

### Profile Completion
- `POST /api/profile` — saves Nama, NIM, Asal Universitas, Major Program, Instagram Username
- Sets `is_complete = true`
- Profile can be edited anytime from `/profile`

### Route Protection
| Route | Requirement |
|---|---|
| `/profile` | Logged in |
| `/competition/[slug]/register` | Logged in + `is_complete = true` |
| `/admin` | Logged in + email in `ADMIN_EMAILS` env var |

Incomplete profile redirects to `/profile` with a notice.

---

## 3. Competition Page

### `/competition`
Two cards — BCC and MCC — each containing:
- Short description text
- **Download Guidebook** button → redirects to Google Drive file link (env vars: `BCC_GUIDEBOOK_URL`, `MCC_GUIDEBOOK_URL`)
- **Register** button → navigates to `/competition/bcc/register` or `/competition/mcc/register`

If registration is closed (per `settings` table), the Register button is disabled with a "Registration Closed" label.

---

## 4. Registration Flow

### `/competition/[slug]/register`

If the user already has a team in this competition, redirect to team dashboard.

Otherwise, show two options:

#### Create Team
1. User enters a team name
2. `POST /api/teams/create` → validates registration is open, user has no existing team in this competition → generates unique join code (`GS-XXXX`) → creates Google Drive folder named `[COMPETITION]-[TeamName]` under competition parent folder → inserts team + team_member rows
3. User is shown their team dashboard with the join code

#### Join Team
1. User enters a join code
2. `POST /api/teams/join` → validates: code exists, competition matches the current page slug, team has fewer than 3 members, user not already in a team for this competition → inserts team_member row
3. User lands on team dashboard

### Team Dashboard
Shown after creating or joining a team (and on return visits):
- Team name, competition, join code (copyable)
- Member list (up to 3): name + university for each
- Upload section:
  - **Bukti Pembayaran** (payment proof image/PDF)
  - **Bukti Follow Instagram** (screenshot image)
  - On upload: file sent to `POST /api/teams/upload` → stored in Supabase Storage → copied to Google Drive team folder → Drive URL saved to `teams` table
  - Files can be re-uploaded (overwrite previous)

---

## 5. API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/profile` | Save/update profile data |
| POST | `/api/teams/create` | Create team, generate join code, create Drive folder |
| POST | `/api/teams/join` | Join team by join code |
| POST | `/api/teams/upload` | Upload file to Drive, update team record |
| GET | `/api/admin/export` | Stream CSV of all teams + member profiles |
| POST | `/api/admin/sync-sheets` | Write all data to Google Sheet |
| POST | `/api/admin/toggle-registration` | Toggle registration open/close per competition |

---

## 6. Admin System

### `/admin` (protected by `ADMIN_EMAILS` env var)

**Dashboard:**
- Total teams per competition (BCC / MCC)
- Total registered members
- Registration open/close toggle per competition (updates `settings` table)

**Team Table:**
All teams with: Team Name, Competition, Join Code, Members (Nama, NIM, Universitas), Bukti Pembayaran link, Bukti Follow link, Created At

**Actions:**
- **Download CSV** → `GET /api/admin/export` → CSV with all teams + member profile data, one row per member
- **Sync to Google Sheets** → `POST /api/admin/sync-sheets` → writes to a Google Sheet (one sheet tab per competition: BCC, MCC)

**Google Sheet columns (per tab):**
```
Team Name | Join Code | Nama | NIM | Asal Universitas | Major Program | Instagram | Bukti Pembayaran URL | Bukti Follow URL | Joined At
```

---

## 7. Google Cloud Setup (One-Time)

1. Create a Google Cloud project
2. Enable Drive API and Sheets API
3. Create a Service Account → download JSON credentials
4. Share the target Google Drive folder and Google Sheet with the service account email
5. Store credentials in env vars: `GOOGLE_SERVICE_ACCOUNT_KEY` (JSON string), `GOOGLE_SHEET_ID`, `BCC_DRIVE_FOLDER_ID`, `MCC_DRIVE_FOLDER_ID`

---

## 8. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google
GOOGLE_SERVICE_ACCOUNT_KEY=   # full JSON as string
GOOGLE_SHEET_ID=
BCC_DRIVE_FOLDER_ID=
MCC_DRIVE_FOLDER_ID=
BCC_GUIDEBOOK_URL=
MCC_GUIDEBOOK_URL=

# Admin
ADMIN_EMAILS=email1@gmail.com,email2@gmail.com
```

---

## 9. New Pages & File Structure

```
src/
├── app/
│   ├── profile/
│   │   └── page.tsx
│   ├── competition/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── register/
│   │           └── page.tsx
│   ├── admin/
│   │   └── page.tsx
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
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   └── google/
│       ├── drive.ts
│       └── sheets.ts
```

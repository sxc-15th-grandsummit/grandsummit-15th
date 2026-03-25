# Competition Registration System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full registration system for BCC/MCC competitions on top of the existing Next.js landing page — Google OAuth login, profile completion, team creation/joining, file uploads to Google Drive, and an admin dashboard with CSV/Sheets export.

**Architecture:** Next.js App Router with server-side API routes handling all data access via Supabase service role key. Google Drive stores uploaded proofs and team folders; Google Sheets provides a live admin export. Route protection is enforced in Next.js middleware.

**Tech Stack:** Next.js 16 (App Router), Supabase (Auth + Postgres + Storage), `@supabase/ssr`, `googleapis`, Tailwind CSS v4, TypeScript, Bun

---

## File Map

### New files to create
```
src/
├── middleware.ts                                    # Route protection entry point
├── lib/
│   ├── supabase/
│   │   ├── client.ts                               # Browser client (anon key, auth only)
│   │   ├── server.ts                               # Server client (service role key)
│   │   ├── middleware.ts                           # Session refresh + route guard logic
│   │   └── requireAdmin.ts                         # Admin auth guard for API routes
│   └── google/
│       ├── drive.ts                                # Drive API helpers
│       └── sheets.ts                               # Sheets API helpers
├── app/
│   ├── profile/
│   │   └── page.tsx                                # Profile completion form
│   ├── competition/
│   │   ├── page.tsx                                # BCC + MCC cards
│   │   └── [slug]/
│   │       └── register/
│   │           └── page.tsx                        # Create/join team + dashboard
│   ├── admin/
│   │   └── page.tsx                                # Admin dashboard
│   └── api/
│       ├── profile/
│       │   ├── route.ts                            # POST: upsert profile
│       │   └── me/
│       │       └── route.ts                        # GET: fetch own profile
│       ├── teams/
│       │   ├── create/
│       │   │   └── route.ts                        # POST: create team + Drive folder
│       │   ├── join/
│       │   │   └── route.ts                        # POST: join team by code
│       │   ├── my/
│       │   │   └── route.ts                        # GET: fetch user's current team
│       │   └── upload/
│       │       └── route.ts                        # POST: upload proof file
│       └── admin/
│           ├── export/
│           │   └── route.ts                        # GET: CSV export
│           ├── stats/
│           │   └── route.ts                        # GET: team/member counts + reg status
│           ├── sync-sheets/
│           │   └── route.ts                        # POST: write to Google Sheets
│           └── toggle-registration/
│               └── route.ts                        # POST: open/close registration
supabase/
└── migrations/
    ├── 001_schema.sql                              # Tables + constraints + triggers
    ├── 002_rls.sql                                 # Row Level Security policies
    └── 003_seed.sql                                # settings table seed values
```

### Files to modify
```
src/app/layout.tsx              # Add Supabase session provider if needed
src/components/header.tsx       # Add Login/Logout button
src/components/login-button.tsx # New client component for Google OAuth
package.json                    # Add new dependencies
.env.local                      # Add all env vars (create from .env.example)
```

---

## Task 1: Install Dependencies and Create Env File

**Files:**
- Modify: `package.json`
- Create: `.env.local`
- Create: `.env.example`

- [ ] **Step 1: Install Supabase and Google API packages**

```bash
cd /path/to/grandsummit-15th
bun add @supabase/supabase-js @supabase/ssr googleapis
```

Expected output: packages added to `node_modules` and `bun.lock` updated.

- [ ] **Step 2: Create `.env.example` with all required variables**

```bash
cat > .env.example << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google (service account JSON as single-line string)
# Run: cat key.json | python3 -c "import json,sys; print(json.dumps(json.load(sys.stdin)))"
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
GOOGLE_SHEET_ID=your-sheet-id
BCC_DRIVE_FOLDER_ID=your-bcc-folder-id
MCC_DRIVE_FOLDER_ID=your-mcc-folder-id
BCC_GUIDEBOOK_URL=https://drive.google.com/file/d/xxx/view
MCC_GUIDEBOOK_URL=https://drive.google.com/file/d/xxx/view

# Admin (comma-separated, whitespace trimmed)
ADMIN_EMAILS=admin@gmail.com
EOF
```

- [ ] **Step 3: Create `.env.local` from the example**

```bash
cp .env.example .env.local
```

Then fill in real values. (You must have a Supabase project created already — go to supabase.com, create a project, and copy the URL + keys from Project Settings → API.)

- [ ] **Step 4: Verify TypeScript still compiles**

```bash
bun run build 2>&1 | head -20
```

Expected: may have errors only about missing `@supabase` types — that is fine for now. Should NOT have build tool errors.

- [ ] **Step 5: Commit**

```bash
git add package.json bun.lock .env.example
git commit -m "feat: add supabase and googleapis dependencies"
```

---

## Task 2: Supabase Database Migrations

**Files:**
- Create: `supabase/migrations/001_schema.sql`
- Create: `supabase/migrations/002_rls.sql`
- Create: `supabase/migrations/003_seed.sql`

> **Note:** Run these SQL scripts in your Supabase dashboard → SQL Editor, in order (001, 002, 003). They are idempotent (`CREATE TABLE IF NOT EXISTS`, `CREATE OR REPLACE`).

- [ ] **Step 1: Create schema migration**

Create `supabase/migrations/001_schema.sql`:

```sql
-- Profiles table (one per auth user)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama text,
  nim text,
  asal_universitas text,
  major_program text,
  instagram_username text,
  is_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-create profile on first login
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  competition text NOT NULL CHECK (competition IN ('BCC', 'MCC')),
  join_code text NOT NULL UNIQUE,
  leader_id uuid NOT NULL REFERENCES public.profiles(id),
  bukti_pembayaran_drive_id text,
  bukti_follow_drive_id text,
  drive_folder_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name, competition)
);

-- Team members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, profile_id)
);

-- Max 3 members trigger
CREATE OR REPLACE FUNCTION public.check_team_member_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.team_members WHERE team_id = NEW.team_id) >= 3 THEN
    RAISE EXCEPTION 'Team already has the maximum of 3 members';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_team_member_limit ON public.team_members;
CREATE TRIGGER enforce_team_member_limit
  BEFORE INSERT ON public.team_members
  FOR EACH ROW EXECUTE PROCEDURE public.check_team_member_limit();

-- Settings table
CREATE TABLE IF NOT EXISTS public.settings (
  key text PRIMARY KEY,
  value text NOT NULL
);
```

- [ ] **Step 2: Create RLS migration**

Create `supabase/migrations/002_rls.sql`:

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Profiles: own row only
DROP POLICY IF EXISTS "profiles_own" ON public.profiles;
CREATE POLICY "profiles_own" ON public.profiles
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Teams: authenticated users can read (needed for join-by-code)
DROP POLICY IF EXISTS "teams_read" ON public.teams;
CREATE POLICY "teams_read" ON public.teams
  FOR SELECT USING (auth.role() = 'authenticated');

-- Team members: read own memberships
DROP POLICY IF EXISTS "team_members_read_own" ON public.team_members;
CREATE POLICY "team_members_read_own" ON public.team_members
  FOR SELECT USING (auth.uid() = profile_id);

-- Settings: read-only for authenticated
DROP POLICY IF EXISTS "settings_read" ON public.settings;
CREATE POLICY "settings_read" ON public.settings
  FOR SELECT USING (auth.role() = 'authenticated');
```

- [ ] **Step 3: Create seed migration**

Create `supabase/migrations/003_seed.sql`:

```sql
INSERT INTO public.settings (key, value) VALUES
  ('bcc_registration_open', 'false'),
  ('mcc_registration_open', 'false')
ON CONFLICT (key) DO NOTHING;
```

- [ ] **Step 4: Run migrations in Supabase dashboard**

1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the left sidebar
3. Paste and run `001_schema.sql`, then `002_rls.sql`, then `003_seed.sql` in order
4. Verify tables appear in "Table Editor": `profiles`, `teams`, `team_members`, `settings`
5. Verify `settings` has 2 rows: `bcc_registration_open` and `mcc_registration_open`, both `'false'`

- [ ] **Step 5: Enable Google OAuth in Supabase**

1. Go to Supabase dashboard → Authentication → Providers
2. Enable Google
3. Copy the "Callback URL" shown (looks like `https://xxx.supabase.co/auth/v1/callback`)
4. Go to Google Cloud Console → create a project → enable no APIs yet
5. Go to APIs & Services → Credentials → Create OAuth 2.0 Client ID (Web Application)
6. Add the Supabase callback URL to "Authorized redirect URIs"
7. Copy the Client ID and Secret back into Supabase Google provider settings
8. Add `http://localhost:3000` to "Authorized JavaScript origins" in Google Cloud

- [ ] **Step 6: Set up Supabase Storage bucket**

1. Go to Supabase dashboard → Storage
2. Create a new bucket named `uploads`
3. Set it to **private** (not public — files are accessed via service role key server-side)

- [ ] **Step 7: Commit migrations**

```bash
git add supabase/
git commit -m "feat: add database migrations and seed"
```

---

## Task 3: Supabase Library Files

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`

- [ ] **Step 1: Create browser client**

Create `src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Create server client**

Create `src/lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'

// Service role client: bypasses RLS entirely.
// Does NOT use session cookies — cookie handlers are intentionally no-ops.
export async function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return [] },
        setAll() {},
      },
    }
  )
}
```

- [ ] **Step 3: Add session user helper to server.ts**

Add this exported function to `src/lib/supabase/server.ts` (append after `createClient`):

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Service role client — bypasses RLS. No cookies needed.
export async function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll() { return [] }, setAll() {} } }
  )
}

// Gets the current session user via the anon key (reads cookies).
// Use this in API route handlers to identify who is calling.
// Returns null if not authenticated.
export async function getSessionUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
```

> **Important:** Replace `src/lib/supabase/server.ts` entirely with the code above (remove the previous `createClient` definition from Step 2 — the one above includes the corrected version). The `getSessionUser` function is what all API route handlers use to read the session. `createBrowserClient` must NEVER be imported in server-side route handlers.

- [ ] **Step 4: Create middleware session handler**

Create `src/lib/supabase/middleware.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // /profile requires a session
  if (pathname.startsWith('/profile') && !user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // /competition/[slug]/register requires session + complete profile
  if (pathname.match(/^\/competition\/[^/]+\/register/) && !user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (pathname.match(/^\/competition\/[^/]+\/register/) && user) {
    // Check profile completeness via service role
    const serviceClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('is_complete')
      .eq('id', user.id)
      .single()

    if (!profile?.is_complete) {
      return NextResponse.redirect(new URL('/profile', request.url))
    }
  }

  // /admin requires session + admin email
  if (pathname.startsWith('/admin') && !user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (pathname.startsWith('/admin') && user) {
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) ?? []
    if (!adminEmails.includes(user.email ?? '')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
bun run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: No TypeScript errors in the lib files.

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase/
git commit -m "feat: add supabase client/server/middleware lib"
```

---

## Task 4: Next.js Middleware Entry Point

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Create middleware**

Create `src/middleware.ts`:

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  // Only run middleware on the specific protected page routes.
  // Do NOT add a catch-all here — it would run supabase.auth.getUser()
  // on every API request, adding a network round-trip to each call.
  matcher: [
    '/profile',
    '/profile/:path*',
    '/competition/:slug/register',
    '/competition/:slug/register/:path*',
    '/admin',
    '/admin/:path*',
  ],
}
```

- [ ] **Step 2: Verify dev server starts**

```bash
bun run dev 2>&1 | head -10
```

Expected: Server starts on port 3000 without errors.

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add Next.js route protection middleware"
```

---

## Task 5: Google API Libraries

**Files:**
- Create: `src/lib/google/drive.ts`
- Create: `src/lib/google/sheets.ts`

> **Note:** Before this task, complete the Google Cloud setup:
> 1. Create a Google Cloud project at console.cloud.google.com
> 2. Enable Google Drive API and Google Sheets API
> 3. Create a Service Account → Create JSON key → download file
> 4. Run `cat key.json | python3 -c "import json,sys; print(json.dumps(json.load(sys.stdin)))"` → paste result into `GOOGLE_SERVICE_ACCOUNT_KEY` in `.env.local`
> 5. Create two Drive folders (BCC, MCC) in your Google Drive
> 6. Create a Google Sheet
> 7. Share all three with the service account email as Editor
> 8. Fill in `BCC_DRIVE_FOLDER_ID`, `MCC_DRIVE_FOLDER_ID`, `GOOGLE_SHEET_ID` in `.env.local`

- [ ] **Step 1: Create Drive helper**

Create `src/lib/google/drive.ts`:

```typescript
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
```

- [ ] **Step 2: Create Sheets helper**

Create `src/lib/google/sheets.ts`:

```typescript
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
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
bun run build 2>&1 | grep -E "^.*error TS" | head -20
```

Expected: No errors in `lib/google/`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/google/
git commit -m "feat: add Google Drive and Sheets API helpers"
```

---

## Task 6: requireAdmin Utility

**Files:**
- Create: `src/lib/supabase/requireAdmin.ts`

- [ ] **Step 1: Create the utility**

Create `src/lib/supabase/requireAdmin.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

type AdminResult =
  | { ok: true; user: { id: string; email: string } }
  | { ok: false; response: Response }

// Returns { ok: true, user } if the request is from an admin,
// or { ok: false, response } with a 401/403 to return immediately.
// NOTE: Intentional deviation from spec signature (spec used throw).
// Return-based pattern is used instead to avoid catching unknown exceptions
// as HTTP responses (TypeScript catches are typed as `unknown`).
export async function requireAdmin(): Promise<AdminResult> {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    return { ok: false, response: new Response('Unauthorized', { status: 401 }) }
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) ?? []
  if (!adminEmails.includes(user.email)) {
    return { ok: false, response: new Response('Forbidden', { status: 403 }) }
  }

  return { ok: true, user: { id: user.id, email: user.email } }
}
```

> **Usage pattern in every `/api/admin/*` route handler — call this as the first line:**
> ```typescript
> export async function GET() {
>   const auth = await requireAdmin()
>   if (!auth.ok) return auth.response
>   // ... rest of handler — auth.user is available here
> }
> ```

- [ ] **Step 2: Commit**

```bash
git add src/lib/supabase/requireAdmin.ts
git commit -m "feat: add requireAdmin auth utility for admin API routes"
```

---

## Task 7: Profile API Route + Profile Page

**Files:**
- Create: `src/app/api/profile/route.ts`
- Create: `src/app/profile/page.tsx`

- [ ] **Step 1: Create profile API route**

Create `src/app/api/profile/route.ts`:

```typescript
import { createClient, getSessionUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { nama, nim, asal_universitas, major_program, instagram_username } = body

  if (!nama || !nim || !asal_universitas || !major_program || !instagram_username) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      nama: nama.trim(),
      nim: nim.trim(),
      asal_universitas: asal_universitas.trim(),
      major_program: major_program.trim(),
      instagram_username: instagram_username.trim(),
      is_complete: true,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Create profile page**

Create `src/app/profile/page.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nama: '', nim: '', asal_universitas: '', major_program: '', instagram_username: '',
  })

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      const res = await fetch('/api/profile/me')
      if (res.ok) {
        const data = await res.json()
        if (data.profile) {
          setForm({
            nama: data.profile.nama ?? '',
            nim: data.profile.nim ?? '',
            asal_universitas: data.profile.asal_universitas ?? '',
            major_program: data.profile.major_program ?? '',
            instagram_username: data.profile.instagram_username ?? '',
          })
        }
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setSaving(false); return }
    router.push('/competition')
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center text-white">Loading...</div>

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#00243c] px-4 py-20">
      <div className="w-full max-w-md rounded-2xl border border-teal-700/30 bg-[#00243c]/80 p-8 backdrop-blur">
        <h1 className="mb-2 font-plus-jakarta text-2xl font-bold text-white">Complete Your Profile</h1>
        <p className="mb-6 text-sm text-teal-300">Fill in your details to continue with registration.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[
            { label: 'Full Name (Nama)', key: 'nama', placeholder: 'Your full name' },
            { label: 'Student ID (NIM)', key: 'nim', placeholder: 'Your NIM' },
            { label: 'University (Asal Universitas)', key: 'asal_universitas', placeholder: 'Your university' },
            { label: 'Major Program', key: 'major_program', placeholder: 'Your major' },
            { label: 'Instagram Username', key: 'instagram_username', placeholder: '@username' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="mb-1 block text-sm font-medium text-teal-200">{label}</label>
              <input
                type="text"
                value={form[key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                required
                className="w-full rounded-lg border border-teal-700/40 bg-white/10 px-4 py-2 text-white placeholder-white/40 focus:border-teal-400 focus:outline-none"
              />
            </div>
          ))}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="mt-2 rounded-xl bg-teal-600 py-3 font-semibold text-white transition hover:bg-teal-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Create GET /api/profile/me route (needed by profile page)**

Create `src/app/api/profile/me/route.ts`:

```typescript
import { createClient, getSessionUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return NextResponse.json({ profile })
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
bun run build 2>&1 | grep -E "error TS" | head -10
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/profile/ src/app/profile/
git commit -m "feat: add profile API route and profile page"
```

---

## Task 8: Login/Logout in Header

**Files:**
- Modify: `src/components/header.tsx`
- Create: `src/app/api/auth/callback/route.ts`

- [ ] **Step 1: Create OAuth callback route**

Create `src/app/api/auth/callback/route.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/profile'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(`${origin}/?error=auth`)
}
```

- [ ] **Step 2: Add Login/Logout button to header**

Read `src/components/header.tsx` first, then add a login button. The header already has a mobile drawer and desktop nav. Add a `LoginButton` client component at the end of the nav.

Create `src/components/login-button.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function LoginButton() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function signIn() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (user) {
    return (
      <button
        onClick={signOut}
        className="rounded-lg border border-teal-500/40 px-4 py-1.5 text-sm font-semibold text-teal-200 transition hover:bg-teal-500/20"
      >
        Logout
      </button>
    )
  }

  return (
    <button
      onClick={signIn}
      className="rounded-lg bg-teal-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-teal-500"
    >
      Login
    </button>
  )
}
```

Then in `src/components/header.tsx`, import and add `<LoginButton />` inside the desktop nav area and inside the mobile drawer.

- [ ] **Step 3: Add redirect URL to Supabase dashboard**

In Supabase → Authentication → URL Configuration:
- Add `http://localhost:3000/api/auth/callback` to "Redirect URLs"
- For production, add `https://yourdomain.com/api/auth/callback`

- [ ] **Step 4: Manually test login flow**

1. Start dev server: `bun run dev`
2. Go to `http://localhost:3000`
3. Click Login → Google OAuth flow → should redirect to `/profile`
4. Check Supabase dashboard → Table Editor → `profiles` → should see a new row with your user ID and `is_complete = false`

- [ ] **Step 5: Commit**

```bash
git add src/components/login-button.tsx src/components/header.tsx src/app/api/auth/
git commit -m "feat: add Google OAuth login/logout to header"
```

---

## Task 9: Competition Page

**Files:**
- Create: `src/app/competition/page.tsx`

- [ ] **Step 1: Create competition page**

Create `src/app/competition/page.tsx`:

```typescript
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

async function getRegistrationStatus() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', ['bcc_registration_open', 'mcc_registration_open'])

  const map = Object.fromEntries((data ?? []).map(r => [r.key, r.value]))
  return {
    bccOpen: map['bcc_registration_open'] === 'true',
    mccOpen: map['mcc_registration_open'] === 'true',
  }
}

export default async function CompetitionPage() {
  const { bccOpen, mccOpen } = await getRegistrationStatus()

  const competitions = [
    {
      slug: 'bcc',
      label: 'BCC',
      fullName: 'Business Case Competition',
      description: 'Analyze and solve real-world business challenges with your team. Compete against the brightest minds from universities across Indonesia.',
      open: bccOpen,
      guidebookUrl: process.env.BCC_GUIDEBOOK_URL ?? '#',
      color: 'from-teal-700 to-teal-900',
    },
    {
      slug: 'mcc',
      label: 'MCC',
      fullName: 'Marketing Case Competition',
      description: 'Craft innovative marketing strategies for industry-leading brands. Showcase your creativity and analytical thinking on a national stage.',
      open: mccOpen,
      guidebookUrl: process.env.MCC_GUIDEBOOK_URL ?? '#',
      color: 'from-blue-800 to-teal-900',
    },
  ]

  return (
    <main className="min-h-screen bg-[#00243c] px-4 py-24">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-center font-plus-jakarta text-4xl font-bold text-white">Competitions</h1>
        <p className="mb-12 text-center text-teal-300">Choose your competition and register your team.</p>

        <div className="grid gap-6 md:grid-cols-2">
          {competitions.map(comp => (
            <div
              key={comp.slug}
              className={`rounded-2xl bg-gradient-to-br ${comp.color} border border-teal-500/20 p-8`}
            >
              <div className="mb-1 font-plus-jakarta text-xs font-bold uppercase tracking-widest text-teal-300">
                {comp.label}
              </div>
              <h2 className="mb-3 font-plus-jakarta text-2xl font-bold text-white">{comp.fullName}</h2>
              <p className="mb-6 text-sm leading-relaxed text-white/70">{comp.description}</p>

              <div className="flex flex-col gap-3">
                <a
                  href={comp.guidebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-teal-400/40 py-2.5 text-center text-sm font-semibold text-teal-200 transition hover:bg-teal-500/20"
                >
                  Download Guidebook
                </a>

                {comp.open ? (
                  <Link
                    href={`/competition/${comp.slug}/register`}
                    className="rounded-xl bg-teal-500 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-teal-400"
                  >
                    Register
                  </Link>
                ) : (
                  <button
                    disabled
                    className="rounded-xl bg-white/10 py-2.5 text-center text-sm font-semibold text-white/40 cursor-not-allowed"
                  >
                    Registration Closed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Test in browser**

Navigate to `http://localhost:3000/competition`. Both cards should render. With seeded `'false'` values, both Register buttons should be disabled.

- [ ] **Step 3: Commit**

```bash
git add src/app/competition/page.tsx
git commit -m "feat: add competition page with BCC and MCC cards"
```

---

## Task 10: Teams API — Create

**Files:**
- Create: `src/app/api/teams/create/route.ts`

- [ ] **Step 1: Create the route**

Create `src/app/api/teams/create/route.ts`:

```typescript
import { createClient, getSessionUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createFolder, deleteFolder } from '@/lib/google/drive'

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0, O, I, 1

function generateJoinCode(): string {
  let code = 'GS-'
  for (let i = 0; i < 4; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }
  return code
}

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, competition } = body

  if (!name?.trim() || !['BCC', 'MCC'].includes(competition)) {
    return NextResponse.json({ error: 'Invalid team name or competition' }, { status: 400 })
  }

  const teamName = name.trim()
  const supabase = await createClient()

  // Check registration is open
  const { data: setting } = await supabase
    .from('settings')
    .select('value')
    .eq('key', `${competition.toLowerCase()}_registration_open`)
    .single()

  if (setting?.value !== 'true') {
    return NextResponse.json({ error: 'Registration is closed' }, { status: 403 })
  }

  // Check user not already in a team for this competition
  // NOTE: Use .filter() for nested relation columns — more reliable than .eq() with dot notation
  const { data: existingMembership } = await supabase
    .from('team_members')
    .select('id, teams!inner(competition)')
    .eq('profile_id', user.id)
    .filter('teams.competition', 'eq', competition)
    .maybeSingle()

  if (existingMembership) {
    return NextResponse.json({ error: 'You are already in a team for this competition' }, { status: 409 })
  }

  // Generate unique join code (up to 5 attempts)
  let joinCode = ''
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateJoinCode()
    const { data: existing } = await supabase
      .from('teams')
      .select('id')
      .eq('join_code', candidate)
      .maybeSingle()
    if (!existing) { joinCode = candidate; break }
  }

  if (!joinCode) {
    return NextResponse.json({ error: 'Could not generate a unique team code, please try again' }, { status: 500 })
  }

  // Step 1: Insert teams row (without drive_folder_id)
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({ name: teamName, competition, join_code: joinCode, leader_id: user.id })
    .select()
    .single()

  if (teamError) {
    if (teamError.code === '23505') {
      return NextResponse.json({ error: 'Team name already taken for this competition' }, { status: 409 })
    }
    return NextResponse.json({ error: teamError.message }, { status: 500 })
  }

  // Step 2: Create Drive folder
  const parentFolderId = competition === 'BCC'
    ? process.env.BCC_DRIVE_FOLDER_ID!
    : process.env.MCC_DRIVE_FOLDER_ID!

  let driveFolderId: string
  try {
    driveFolderId = await createFolder(`${competition}-${teamName}`, parentFolderId)
  } catch (err) {
    // Rollback: delete teams row
    await supabase.from('teams').delete().eq('id', team.id)
    console.error('Drive folder creation failed:', err)
    return NextResponse.json({ error: 'Failed to create team folder, please try again' }, { status: 500 })
  }

  // Step 3: Update teams row with drive_folder_id
  const { error: updateError } = await supabase
    .from('teams')
    .update({ drive_folder_id: driveFolderId })
    .eq('id', team.id)

  if (updateError) {
    await supabase.from('teams').delete().eq('id', team.id)
    await deleteFolder(driveFolderId)
    return NextResponse.json({ error: 'Internal error, please try again' }, { status: 500 })
  }

  // Step 4: Insert team_members row for leader
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({ team_id: team.id, profile_id: user.id })

  if (memberError) {
    await supabase.from('teams').delete().eq('id', team.id)
    await deleteFolder(driveFolderId)
    return NextResponse.json({ error: 'Internal error, please try again' }, { status: 500 })
  }

  return NextResponse.json({
    team: { ...team, drive_folder_id: driveFolderId },
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/teams/create/
git commit -m "feat: add teams create API route with Drive folder creation"
```

---

## Task 11: Teams API — Join

**Files:**
- Create: `src/app/api/teams/join/route.ts`

- [ ] **Step 1: Create the route**

Create `src/app/api/teams/join/route.ts`:

```typescript
import { createClient, getSessionUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { join_code, competition } = body

  if (!join_code || !['BCC', 'MCC'].includes(competition)) {
    return NextResponse.json({ error: 'Invalid join code or competition' }, { status: 400 })
  }

  // Normalize: trim + uppercase
  const normalizedCode = join_code.trim().toUpperCase()

  const supabase = await createClient()

  // Check registration is open
  const { data: setting } = await supabase
    .from('settings')
    .select('value')
    .eq('key', `${competition.toLowerCase()}_registration_open`)
    .single()

  if (setting?.value !== 'true') {
    return NextResponse.json({ error: 'Registration is closed' }, { status: 403 })
  }

  // Find team by join code
  const { data: team } = await supabase
    .from('teams')
    .select('*, team_members(count)')
    .eq('join_code', normalizedCode)
    .single()

  if (!team) {
    return NextResponse.json({ error: 'Team not found. Check your join code.' }, { status: 404 })
  }

  if (team.competition !== competition) {
    return NextResponse.json({ error: 'This code is for a different competition.' }, { status: 400 })
  }

  // Check member count
  const { count } = await supabase
    .from('team_members')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', team.id)

  if ((count ?? 0) >= 3) {
    return NextResponse.json({ error: 'This team is already full (3 members).' }, { status: 409 })
  }

  // Check user not already in a team for this competition
  // NOTE: Use .filter() for nested relation columns — more reliable than .eq() with dot notation
  const { data: existingMembership } = await supabase
    .from('team_members')
    .select('id, teams!inner(competition)')
    .eq('profile_id', user.id)
    .filter('teams.competition', 'eq', competition)
    .maybeSingle()

  if (existingMembership) {
    return NextResponse.json({ error: 'You are already in a team for this competition.' }, { status: 409 })
  }

  // Insert team_member
  const { error } = await supabase
    .from('team_members')
    .insert({ team_id: team.id, profile_id: user.id })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ team })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/teams/join/
git commit -m "feat: add teams join API route"
```

---

## Task 12: Teams API — Upload

**Files:**
- Create: `src/app/api/teams/upload/route.ts`

- [ ] **Step 1: Create the route**

Create `src/app/api/teams/upload/route.ts`:

```typescript
import { createClient, getSessionUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { uploadFile, updateFile, setPublicReader, getDriveViewUrl } from '@/lib/google/drive'

const ALLOWED_PAYMENT = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const ALLOWED_FOLLOW = ['image/jpeg', 'image/png', 'image/webp']
const MAX_PAYMENT_BYTES = 10 * 1024 * 1024  // 10MB
const MAX_FOLLOW_BYTES = 5 * 1024 * 1024    // 5MB

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const field = formData.get('field') as string | null  // 'bukti_pembayaran' or 'bukti_follow'
  const competition = formData.get('competition') as string | null

  if (!file || !field || !competition) {
    return NextResponse.json({ error: 'Missing file, field, or competition' }, { status: 400 })
  }

  if (!['bukti_pembayaran', 'bukti_follow'].includes(field)) {
    return NextResponse.json({ error: 'Invalid field name' }, { status: 400 })
  }

  // Validate file type and size
  const isPembayaran = field === 'bukti_pembayaran'
  const allowedTypes = isPembayaran ? ALLOWED_PAYMENT : ALLOWED_FOLLOW
  const maxBytes = isPembayaran ? MAX_PAYMENT_BYTES : MAX_FOLLOW_BYTES

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` }, { status: 400 })
  }
  if (file.size > maxBytes) {
    return NextResponse.json({ error: `File too large. Max: ${maxBytes / 1024 / 1024}MB` }, { status: 400 })
  }

  const supabase = await createClient()

  // Resolve team from session (never from body)
  // NOTE: Use .filter() for nested relation columns
  const { data: membership } = await supabase
    .from('team_members')
    .select('team_id, teams!inner(id, competition, drive_folder_id, bukti_pembayaran_drive_id, bukti_follow_drive_id)')
    .eq('profile_id', user.id)
    .filter('teams.competition', 'eq', competition)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'You are not in a team for this competition' }, { status: 403 })
  }

  const team = (membership as any).teams
  if (!team.drive_folder_id) {
    return NextResponse.json({ error: 'Team Drive folder not set up yet' }, { status: 500 })
  }

  // Upload to Supabase Storage (upsert: true)
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const storagePath = `${team.id}/${field}`

  const { error: storageError } = await supabase.storage
    .from('uploads')
    .upload(storagePath, buffer, { contentType: file.type, upsert: true })

  if (storageError) {
    return NextResponse.json({ error: 'Storage upload failed: ' + storageError.message }, { status: 500 })
  }

  // Upload to Google Drive
  const driveIdField = isPembayaran ? 'bukti_pembayaran_drive_id' : 'bukti_follow_drive_id'
  const existingDriveId: string | null = team[driveIdField]
  const fileName = `${field}_${team.id}`

  let driveFileId: string
  try {
    if (existingDriveId) {
      try {
        driveFileId = await updateFile(existingDriveId, file.type, buffer)
      } catch (err: any) {
        // Only fall back to create on 404
        if (err?.code === 404 || err?.status === 404) {
          driveFileId = await uploadFile(fileName, file.type, buffer, team.drive_folder_id)
        } else {
          throw err
        }
      }
    } else {
      driveFileId = await uploadFile(fileName, file.type, buffer, team.drive_folder_id)
    }
  } catch (err) {
    console.error('Drive upload failed:', err)
    return NextResponse.json({ error: 'Upload to Drive failed. Please try again.' }, { status: 500 })
  }

  // Save Drive file ID to DB
  const { error: updateError } = await supabase
    .from('teams')
    .update({ [driveIdField]: driveFileId })
    .eq('id', team.id)

  if (updateError) {
    console.error('DB update failed after Drive upload:', updateError, 'driveFileId:', driveFileId)
    return NextResponse.json({ error: 'Internal error saving upload reference' }, { status: 500 })
  }

  // Set public reader (non-fatal)
  await setPublicReader(driveFileId)

  return NextResponse.json({
    ok: true,
    url: getDriveViewUrl(driveFileId),
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/teams/upload/
git commit -m "feat: add file upload API route to Drive"
```

---

## Task 13: Registration Page (Create/Join + Team Dashboard)

**Files:**
- Create: `src/app/competition/[slug]/register/page.tsx`

- [ ] **Step 1: Create the page**

Create `src/app/competition/[slug]/register/page.tsx`:

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const SLUG_MAP: Record<string, string> = { bcc: 'BCC', mcc: 'MCC' }

type Member = { nama: string; asal_universitas: string }
type Team = {
  id: string; name: string; competition: string; join_code: string;
  bukti_pembayaran_drive_id: string | null; bukti_follow_drive_id: string | null;
  members: Member[]
}

export default function RegisterPage() {
  const { slug } = useParams<{ slug: string }>()
  const competition = SLUG_MAP[slug]

  if (!competition) notFound()

  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [team, setTeam] = useState<Team | null>(null)
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose')
  const [teamName, setTeamName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'idle' | 'uploading' | 'done' | 'error'>>({})
  const [copied, setCopied] = useState(false)

  const loadTeam = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/'; return }

    const res = await fetch(`/api/teams/my?competition=${competition}`)
    if (res.ok) {
      const data = await res.json()
      setTeam(data.team)
    }
    setLoading(false)
  }, [competition])

  useEffect(() => { loadTeam() }, [loadTeam])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true); setError('')
    const res = await fetch('/api/teams/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: teamName, competition }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setSubmitting(false); return }
    await loadTeam()
    setSubmitting(false)
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true); setError('')
    const res = await fetch('/api/teams/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ join_code: joinCode, competition }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setSubmitting(false); return }
    await loadTeam()
    setSubmitting(false)
  }

  async function handleUpload(field: string, file: File) {
    setUploadStatus(s => ({ ...s, [field]: 'uploading' }))
    const formData = new FormData()
    formData.append('file', file)
    formData.append('field', field)
    formData.append('competition', competition)

    const res = await fetch('/api/teams/upload', { method: 'POST', body: formData })
    if (res.ok) {
      setUploadStatus(s => ({ ...s, [field]: 'done' }))
      await loadTeam()
    } else {
      const data = await res.json()
      setError(data.error)
      setUploadStatus(s => ({ ...s, [field]: 'error' }))
    }
  }

  function copyCode() {
    if (team) {
      navigator.clipboard.writeText(team.join_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center text-white">Loading...</div>

  // Team dashboard
  if (team) return (
    <main className="min-h-screen bg-[#00243c] px-4 py-20">
      <div className="mx-auto max-w-lg">
        <div className="mb-2 text-xs font-bold uppercase tracking-widest text-teal-400">{team.competition}</div>
        <h1 className="mb-1 font-plus-jakarta text-3xl font-bold text-white">{team.name}</h1>
        <div className="mb-8 flex items-center gap-2">
          <span className="font-mono text-lg text-teal-300">{team.join_code}</span>
          <button onClick={copyCode} className="rounded px-2 py-0.5 text-xs text-teal-400 hover:bg-teal-500/20">
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Members */}
        <div className="mb-8 rounded-xl border border-teal-700/30 bg-white/5 p-5">
          <h2 className="mb-3 font-semibold text-white">Members ({team.members.length}/3)</h2>
          {team.members.map((m, i) => (
            <div key={i} className="mb-2 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
                {i + 1}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{m.nama}</div>
                <div className="text-xs text-teal-300">{m.asal_universitas}</div>
              </div>
            </div>
          ))}
          {team.members.length < 3 && (
            <p className="mt-2 text-xs text-white/40">Share your code <span className="font-mono text-teal-400">{team.join_code}</span> to invite up to {3 - team.members.length} more member(s).</p>
          )}
        </div>

        {/* Uploads */}
        <div className="flex flex-col gap-4">
          {[
            {
              field: 'bukti_pembayaran',
              label: 'Bukti Pembayaran',
              hint: 'Payment proof (image or PDF, max 10MB)',
              accept: 'image/*,application/pdf',
              driveId: team.bukti_pembayaran_drive_id,
            },
            {
              field: 'bukti_follow',
              label: 'Bukti Follow Instagram',
              hint: 'Screenshot of following @sxcgrandsummit (image, max 5MB)',
              accept: 'image/*',
              driveId: team.bukti_follow_drive_id,
            },
          ].map(({ field, label, hint, accept, driveId }) => (
            <div key={field} className="rounded-xl border border-teal-700/30 bg-white/5 p-5">
              <h3 className="mb-1 font-semibold text-white">{label}</h3>
              <p className="mb-3 text-xs text-white/50">{hint}</p>
              {driveId && (
                <a
                  href={`https://drive.google.com/file/d/${driveId}/view`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-3 block text-xs text-teal-400 hover:underline"
                >
                  ✓ Uploaded — View file
                </a>
              )}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept={accept}
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleUpload(field, file)
                  }}
                />
                <span className="inline-block rounded-lg border border-teal-500/40 px-4 py-2 text-sm text-teal-200 hover:bg-teal-500/20">
                  {uploadStatus[field] === 'uploading' ? 'Uploading...' : driveId ? 'Re-upload' : 'Choose File'}
                </span>
              </label>
              {uploadStatus[field] === 'done' && <span className="ml-3 text-xs text-green-400">Uploaded ✓</span>}
              {uploadStatus[field] === 'error' && <span className="ml-3 text-xs text-red-400">Failed — try again</span>}
            </div>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    </main>
  )

  // Create/join team
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#00243c] px-4 py-20">
      <div className="w-full max-w-md">
        <div className="mb-2 text-xs font-bold uppercase tracking-widest text-teal-400">{competition} Registration</div>
        <h1 className="mb-8 font-plus-jakarta text-3xl font-bold text-white">Join a Team</h1>

        {mode === 'choose' && (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setMode('create')}
              className="rounded-xl bg-teal-600 py-4 font-semibold text-white transition hover:bg-teal-500"
            >
              Create New Team
            </button>
            <button
              onClick={() => setMode('join')}
              className="rounded-xl border border-teal-500/40 py-4 font-semibold text-teal-200 transition hover:bg-teal-500/20"
            >
              Join Existing Team
            </button>
          </div>
        )}

        {mode === 'create' && (
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <input
              type="text"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="Team name"
              required
              className="rounded-lg border border-teal-700/40 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:border-teal-400 focus:outline-none"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={submitting} className="rounded-xl bg-teal-600 py-3 font-semibold text-white hover:bg-teal-500 disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Team'}
            </button>
            <button type="button" onClick={() => { setMode('choose'); setError('') }} className="text-sm text-white/50 hover:text-white">← Back</button>
          </form>
        )}

        {mode === 'join' && (
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <input
              type="text"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Join code (e.g. GS-AB2X)"
              required
              className="rounded-lg border border-teal-700/40 bg-white/10 px-4 py-3 font-mono text-white placeholder-white/40 focus:border-teal-400 focus:outline-none"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={submitting} className="rounded-xl bg-teal-600 py-3 font-semibold text-white hover:bg-teal-500 disabled:opacity-50">
              {submitting ? 'Joining...' : 'Join Team'}
            </button>
            <button type="button" onClick={() => { setMode('choose'); setError('') }} className="text-sm text-white/50 hover:text-white">← Back</button>
          </form>
        )}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Create GET /api/teams/my route**

Create `src/app/api/teams/my/route.ts`:

```typescript
import { createClient, getSessionUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const competition = searchParams.get('competition')
  if (!competition) return NextResponse.json({ team: null })

  const supabase = await createClient()

  // NOTE: Use .filter() for nested relation columns
  const { data: membership } = await supabase
    .from('team_members')
    .select(`
      teams!inner (
        id, name, competition, join_code,
        bukti_pembayaran_drive_id, bukti_follow_drive_id,
        team_members (
          profiles (nama, asal_universitas)
        )
      )
    `)
    .eq('profile_id', user.id)
    .filter('teams.competition', 'eq', competition)
    .single()

  if (!membership) return NextResponse.json({ team: null })

  const t = (membership as any).teams
  const members = t.team_members.map((tm: any) => tm.profiles)

  return NextResponse.json({
    team: {
      id: t.id,
      name: t.name,
      competition: t.competition,
      join_code: t.join_code,
      bukti_pembayaran_drive_id: t.bukti_pembayaran_drive_id,
      bukti_follow_drive_id: t.bukti_follow_drive_id,
      members,
    }
  })
}
```

- [ ] **Step 3: Manually test full registration flow**

1. Open `http://localhost:3000/competition`
2. Open registration (admin must first enable it via toggle — skip for now, test with DB: `UPDATE settings SET value='true' WHERE key='bcc_registration_open'`)
3. Click Register for BCC
4. Create a team → verify join code appears, Drive folder created in Google Drive
5. Open a second browser / incognito → login with a different Google account → join the team using the code
6. Upload a test image for Bukti Pembayaran → verify it appears in Google Drive

- [ ] **Step 4: Commit**

```bash
git add src/app/competition/ src/app/api/teams/my/
git commit -m "feat: add registration page with create/join/dashboard and file upload UI"
```

---

## Task 14: Admin API Routes

**Files:**
- Create: `src/app/api/admin/toggle-registration/route.ts`
- Create: `src/app/api/admin/export/route.ts`
- Create: `src/app/api/admin/sync-sheets/route.ts`

- [ ] **Step 1: Toggle registration route**

Create `src/app/api/admin/toggle-registration/route.ts`:

```typescript
import { requireAdmin } from '@/lib/supabase/requireAdmin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { competition, open } = await request.json()
  if (!['BCC', 'MCC'].includes(competition) || typeof open !== 'boolean') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const supabase = await createClient()
  const key = `${competition.toLowerCase()}_registration_open`
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value: open ? 'true' : 'false' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: CSV export route**

Create `src/app/api/admin/export/route.ts`:

```typescript
import { requireAdmin } from '@/lib/supabase/requireAdmin'
import { createClient } from '@/lib/supabase/server'
import { getDriveViewUrl } from '@/lib/google/drive'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const supabase = await createClient()
  const { data: members } = await supabase
    .from('team_members')
    .select(`
      joined_at,
      profiles (nama, nim, asal_universitas, major_program, instagram_username),
      teams (name, competition, join_code, bukti_pembayaran_drive_id, bukti_follow_drive_id)
    `)
    .order('joined_at')

  const BOM = '\uFEFF'
  // Header row: quote each cell the same way as data rows for CSV consistency
  const COLS = ['Team Name','Competition','Join Code','Nama','NIM','Asal Universitas','Major Program','Instagram Username','Bukti Pembayaran Drive URL','Bukti Follow Drive URL','Joined At']
  const header = COLS.map(c => `"${c}"`).join(',')

  const rows = (members ?? []).map((m: any) => {
    const t = m.teams
    const p = m.profiles
    const cols = [
      t.name, t.competition, t.join_code,
      p.nama, p.nim, p.asal_universitas, p.major_program, p.instagram_username,
      t.bukti_pembayaran_drive_id ? getDriveViewUrl(t.bukti_pembayaran_drive_id) : '',
      t.bukti_follow_drive_id ? getDriveViewUrl(t.bukti_follow_drive_id) : '',
      m.joined_at,
    ]
    return cols.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
  })

  const csv = BOM + [header, ...rows].join('\r\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="registrations.csv"',
    },
  })
}
```

- [ ] **Step 3: Sync Sheets route**

Create `src/app/api/admin/sync-sheets/route.ts`:

```typescript
import { requireAdmin } from '@/lib/supabase/requireAdmin'
import { createClient } from '@/lib/supabase/server'
import { syncSheet } from '@/lib/google/sheets'
import { getDriveViewUrl } from '@/lib/google/drive'
import { NextResponse } from 'next/server'

export async function POST() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const supabase = await createClient()
  const { data: members } = await supabase
    .from('team_members')
    .select(`
      joined_at,
      profiles (nama, nim, asal_universitas, major_program, instagram_username),
      teams (name, competition, join_code, bukti_pembayaran_drive_id, bukti_follow_drive_id)
    `)
    .order('joined_at')

  const bccRows: string[][] = []
  const mccRows: string[][] = []

  for (const m of members ?? []) {
    const t = (m as any).teams
    const p = (m as any).profiles
    const row = [
      t.name, t.competition, t.join_code,
      p.nama, p.nim, p.asal_universitas, p.major_program, p.instagram_username,
      t.bukti_pembayaran_drive_id ? getDriveViewUrl(t.bukti_pembayaran_drive_id) : '',
      t.bukti_follow_drive_id ? getDriveViewUrl(t.bukti_follow_drive_id) : '',
      m.joined_at,
    ]
    if (t.competition === 'BCC') bccRows.push(row)
    else mccRows.push(row)
  }

  const spreadsheetId = process.env.GOOGLE_SHEET_ID!
  await syncSheet(spreadsheetId, 'BCC', bccRows)
  await syncSheet(spreadsheetId, 'MCC', mccRows)

  return NextResponse.json({ ok: true, bccRows: bccRows.length, mccRows: mccRows.length })
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/
git commit -m "feat: add admin API routes (toggle, export CSV, sync Sheets)"
```

---

## Task 15: Admin Dashboard Page

**Files:**
- Create: `src/app/admin/page.tsx`

- [ ] **Step 1: Create admin page**

Create `src/app/admin/page.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'

type Stats = { bccTeams: number; mccTeams: number; totalMembers: number }
type RegistrationState = { bcc: boolean; mcc: boolean }

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>({ bccTeams: 0, mccTeams: 0, totalMembers: 0 })
  const [regOpen, setRegOpen] = useState<RegistrationState>({ bcc: false, mcc: false })
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => {
        setStats(data.stats)
        setRegOpen(data.regOpen)
        setLoading(false)
      })
  }, [])

  async function toggleRegistration(competition: 'BCC' | 'MCC', open: boolean) {
    await fetch('/api/admin/toggle-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ competition, open }),
    })
    setRegOpen(r => ({ ...r, [competition.toLowerCase()]: open }))
  }

  async function syncSheets() {
    setSyncing(true); setSyncResult('')
    const res = await fetch('/api/admin/sync-sheets', { method: 'POST' })
    const data = await res.json()
    setSyncResult(res.ok ? `Synced: ${data.bccRows} BCC rows, ${data.mccRows} MCC rows` : `Error: ${data.error}`)
    setSyncing(false)
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center text-white">Loading...</div>

  return (
    <main className="min-h-screen bg-[#00243c] px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 font-plus-jakarta text-3xl font-bold text-white">Admin Dashboard</h1>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[
            { label: 'BCC Teams', value: stats.bccTeams },
            { label: 'MCC Teams', value: stats.mccTeams },
            { label: 'Total Members', value: stats.totalMembers },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-teal-700/30 bg-white/5 p-5 text-center">
              <div className="text-3xl font-bold text-white">{value}</div>
              <div className="text-sm text-teal-300">{label}</div>
            </div>
          ))}
        </div>

        {/* Registration Toggles */}
        <div className="mb-8 rounded-xl border border-teal-700/30 bg-white/5 p-6">
          <h2 className="mb-4 font-semibold text-white">Registration Status</h2>
          <div className="flex flex-col gap-3">
            {(['BCC', 'MCC'] as const).map(comp => (
              <div key={comp} className="flex items-center justify-between">
                <span className="text-teal-200">{comp} Registration</span>
                <button
                  onClick={() => toggleRegistration(comp, !regOpen[comp.toLowerCase() as 'bcc' | 'mcc'])}
                  className={`rounded-full px-6 py-1.5 text-sm font-semibold transition ${
                    regOpen[comp.toLowerCase() as 'bcc' | 'mcc']
                      ? 'bg-green-600 text-white hover:bg-green-500'
                      : 'bg-red-900/50 text-red-300 hover:bg-red-900'
                  }`}
                >
                  {regOpen[comp.toLowerCase() as 'bcc' | 'mcc'] ? 'Open' : 'Closed'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Export Actions */}
        <div className="flex gap-4">
          <a
            href="/api/admin/export"
            className="rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white transition hover:bg-teal-500"
          >
            Download CSV
          </a>
          <button
            onClick={syncSheets}
            disabled={syncing}
            className="rounded-xl border border-teal-500/40 px-6 py-3 font-semibold text-teal-200 transition hover:bg-teal-500/20 disabled:opacity-50"
          >
            {syncing ? 'Syncing...' : 'Sync to Google Sheets'}
          </button>
        </div>
        {syncResult && <p className="mt-3 text-sm text-teal-300">{syncResult}</p>}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Create GET /api/admin/stats route**

Create `src/app/api/admin/stats/route.ts`:

```typescript
import { requireAdmin } from '@/lib/supabase/requireAdmin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const supabase = await createClient()

  const [{ count: bccTeams }, { count: mccTeams }, { count: totalMembers }, { data: settings }] =
    await Promise.all([
      supabase.from('teams').select('*', { count: 'exact', head: true }).eq('competition', 'BCC'),
      supabase.from('teams').select('*', { count: 'exact', head: true }).eq('competition', 'MCC'),
      supabase.from('team_members').select('*', { count: 'exact', head: true }),
      supabase.from('settings').select('key, value').in('key', ['bcc_registration_open', 'mcc_registration_open']),
    ])

  const map = Object.fromEntries((settings ?? []).map(r => [r.key, r.value]))

  return NextResponse.json({
    stats: { bccTeams: bccTeams ?? 0, mccTeams: mccTeams ?? 0, totalMembers: totalMembers ?? 0 },
    regOpen: {
      bcc: map['bcc_registration_open'] === 'true',
      mcc: map['mcc_registration_open'] === 'true',
    },
  })
}
```

- [ ] **Step 3: Test admin dashboard**

1. Add your email to `ADMIN_EMAILS` in `.env.local`
2. Navigate to `http://localhost:3000/admin`
3. Verify stats show, toggles work, CSV download works
4. After some teams exist: test Sync to Google Sheets

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/ src/app/api/admin/stats/
git commit -m "feat: add admin dashboard with stats, toggles, CSV export and Sheets sync"
```

---

## Task 16: Link Competition Button in Homepage

**Files:**
- Modify: `src/constants/index.ts`
- Modify: `src/app/_components/category-section.tsx`

> **Context:** `CategoryItem` currently only has `{ label: string }`. `CategoryCard` uses a hardcoded `href="#registration"` for all three cards. We need to add an `href` field to `CategoryItem` so only the Competition card links to `/competition` — Events and Merch keep their existing behavior.

- [ ] **Step 1: Add `href` to `CategoryItem` type and update `CATEGORY_ITEMS`**

In `src/constants/index.ts`, change:

```typescript
export type CategoryItem = {
  label: string;
};

export const CATEGORY_ITEMS: ReadonlyArray<CategoryItem> = [
  { label: "Competition" },
  { label: "Events" },
  { label: "Merch" },
];
```

To:

```typescript
export type CategoryItem = {
  label: string;
  href: string;
};

export const CATEGORY_ITEMS: ReadonlyArray<CategoryItem> = [
  { label: "Competition", href: "/competition" },
  { label: "Events", href: "#category" },
  { label: "Merch", href: "#category" },
];
```

- [ ] **Step 2: Update `CategoryCard` to use `href` from props**

In `src/app/_components/category-section.tsx`, change the component signature and the `Link` to use the `href` prop:

```typescript
function CategoryCard({ label, href }: CategoryItem) {
  return (
    <motion.article
      {...revealUp}
      className="rounded-2xl border border-white/10 px-4 py-10 text-center shadow-[inset_0_1px_0_rgba(242,242,242,0.18)] sm:px-5 sm:py-14 md:py-24"
      style={{ backgroundImage: GRADIENTS.cardPrimary }}
    >
      <h3 className="font-plus-jakarta text-lg font-semibold tracking-[0.08em] text-white sm:text-2xl md:text-xl lg:text-2xl xl:text-3xl">
        {label.toUpperCase()}
      </h3>
      <Link
        href={href}
        className="mt-5 inline-flex whitespace-nowrap rounded-full px-5 py-1 font-poppins text-xs font-semibold text-black md:mt-7 md:text-sm"
        style={{ backgroundImage: GRADIENTS.pillLight }}
      >
        Learn More
      </Link>
    </motion.article>
  );
}
```

And update the render call to pass `href`:

```typescript
{CATEGORY_ITEMS.map((category) => (
  <CategoryCard key={category.label} label={category.label} href={category.href} />
))}
```

- [ ] **Step 3: Verify navigation works**

1. Go to homepage → click "Learn More" on Competition card → should navigate to `/competition`
2. Click "Learn More" on Events card → should stay on homepage (anchor `#category`)
3. Click "Learn More" on Merch card → should stay on homepage (anchor `#category`)

- [ ] **Step 4: Commit**

```bash
git add src/constants/index.ts src/app/_components/category-section.tsx
git commit -m "feat: link competition category card to /competition page"
```

---

## Task 17: Final Verification

- [ ] **Step 1: Full build check**

```bash
bun run build 2>&1
```

Expected: Build completes with no TypeScript errors.

- [ ] **Step 2: End-to-end flow test**

Test the full user journey:
1. Homepage → click Login → Google OAuth → lands on `/profile`
2. Fill in profile → Save → lands on `/competition`
3. Enable BCC registration (Admin dashboard or direct SQL)
4. Click Register for BCC → Create Team → see join code + Drive folder in Google Drive
5. Second user: login → join team with code → see team dashboard
6. Upload Bukti Pembayaran → verify file in Google Drive team folder
7. Upload Bukti Follow → verify file in Google Drive team folder
8. Admin: `/admin` → Download CSV → verify data
9. Admin: Sync to Google Sheets → verify sheet populated

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: competition registration system complete"
```

---

## Environment Setup Checklist

Before running the app for the first time, ensure all these are done:

- [ ] Supabase project created, URL + keys in `.env.local`
- [ ] Google Cloud project created, Drive + Sheets APIs enabled
- [ ] Service account created, JSON key downloaded, added to `GOOGLE_SERVICE_ACCOUNT_KEY`
- [ ] Two Google Drive folders created (BCC parent, MCC parent), shared with service account email
- [ ] Google Sheet created, shared with service account email
- [ ] `BCC_DRIVE_FOLDER_ID`, `MCC_DRIVE_FOLDER_ID`, `GOOGLE_SHEET_ID` in `.env.local`
- [ ] Guidebook links set in `BCC_GUIDEBOOK_URL`, `MCC_GUIDEBOOK_URL`
- [ ] `ADMIN_EMAILS` set to your Google account email
- [ ] SQL migrations run in Supabase dashboard (001, 002, 003 in order)
- [ ] `uploads` Storage bucket created in Supabase (private)
- [ ] Google OAuth configured in Supabase dashboard with callback URL
- [ ] OAuth callback URL added to Google Cloud Console authorized redirect URIs

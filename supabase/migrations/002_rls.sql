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

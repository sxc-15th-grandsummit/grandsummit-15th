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

-- Store validated referral codes used for team registration promos.
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS referral_code text;

CREATE TABLE IF NOT EXISTS public.referral_codes (
  code text NOT NULL,
  competition text NOT NULL CHECK (competition IN ('BCC', 'MCC')),
  max_uses integer NOT NULL CHECK (max_uses > 0),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (code, competition)
);

INSERT INTO public.referral_codes (code, competition, max_uses, active)
VALUES
  ('MR-0015', 'BCC', 1, true),
  ('MR-0016', 'BCC', 1, true),
  ('MR-0017', 'BCC', 2, true),
  ('MR-0018', 'BCC', 1, true)
ON CONFLICT (code, competition) DO UPDATE
SET max_uses = EXCLUDED.max_uses,
    active = EXCLUDED.active;

CREATE OR REPLACE FUNCTION public.check_bcc_referral_code_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  max_uses integer;
  current_uses integer;
BEGIN
  IF NEW.referral_code IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.competition <> 'BCC' THEN
    RAISE EXCEPTION 'Referral code is only available for BCC registration';
  END IF;

  SELECT rc.max_uses
  INTO max_uses
  FROM public.referral_codes rc
  WHERE rc.code = NEW.referral_code
    AND rc.competition = NEW.competition
    AND rc.active = true;

  IF max_uses IS NULL THEN
    RAISE EXCEPTION 'Invalid referral code';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('bcc_referral:' || NEW.referral_code));

  SELECT COUNT(*)
  INTO current_uses
  FROM public.teams
  WHERE competition = 'BCC'
    AND referral_code = NEW.referral_code
    AND id <> NEW.id;

  IF current_uses >= max_uses THEN
    RAISE EXCEPTION 'Referral code usage limit has been reached';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_bcc_referral_code_limit ON public.teams;
CREATE TRIGGER enforce_bcc_referral_code_limit
  BEFORE INSERT OR UPDATE OF referral_code, competition ON public.teams
  FOR EACH ROW EXECUTE PROCEDURE public.check_bcc_referral_code_limit();

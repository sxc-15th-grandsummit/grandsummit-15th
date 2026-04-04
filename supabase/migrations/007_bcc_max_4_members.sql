-- Update team member limit: BCC allows up to 4, MCC stays at 3
CREATE OR REPLACE FUNCTION public.check_team_member_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_competition text;
  v_max int;
BEGIN
  SELECT competition INTO v_competition FROM public.teams WHERE id = NEW.team_id;
  v_max := CASE WHEN v_competition = 'BCC' THEN 4 ELSE 3 END;

  IF (SELECT COUNT(*) FROM public.team_members WHERE team_id = NEW.team_id) >= v_max THEN
    RAISE EXCEPTION 'Team already has the maximum of % members', v_max;
  END IF;
  RETURN NEW;
END;
$$;

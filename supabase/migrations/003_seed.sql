INSERT INTO public.settings (key, value) VALUES
  ('bcc_registration_open', 'false'),
  ('mcc_registration_open', 'false')
ON CONFLICT (key) DO NOTHING;

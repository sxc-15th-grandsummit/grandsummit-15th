-- Add contact fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS line_id text,
  ADD COLUMN IF NOT EXISTS wa_no text;

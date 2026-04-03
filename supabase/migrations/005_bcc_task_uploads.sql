-- BCC task upload drive IDs
ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS task_repost_drive_id      text,
  ADD COLUMN IF NOT EXISTS task_broadcast_drive_id   text,
  ADD COLUMN IF NOT EXISTS task_twibbon_drive_id     text,
  ADD COLUMN IF NOT EXISTS task_follow_ig_drive_id   text,
  ADD COLUMN IF NOT EXISTS task_follow_li_drive_id   text;

-- Add end_date to campaigns
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS end_date DATE;

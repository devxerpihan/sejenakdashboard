-- Add notes column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update schema cache if necessary (Supabase sometimes caches schema)
NOTIFY pgrst, 'reload config';


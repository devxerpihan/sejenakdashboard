-- Set default preferences for users who have null or empty preferences
UPDATE public.profiles
SET preferences = '{
  "bookingReminders": true,
  "treatmentUpdates": true,
  "promotionalOffers": true
}'::jsonb
WHERE preferences IS NULL OR preferences = '{}'::jsonb;

-- Ensure new users get these defaults (if not already handled by app logic, though trigger is better)
ALTER TABLE public.profiles 
ALTER COLUMN preferences SET DEFAULT '{
  "bookingReminders": true,
  "treatmentUpdates": true,
  "promotionalOffers": true
}'::jsonb;


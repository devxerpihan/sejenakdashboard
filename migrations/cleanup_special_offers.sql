-- Drop unnecessary columns from special_offers table with CASCADE
-- This will also drop dependent objects (like the active_special_offers view)
ALTER TABLE public.special_offers 
  DROP COLUMN IF EXISTS discount_percentage CASCADE,
  DROP COLUMN IF EXISTS discount_amount CASCADE,
  DROP COLUMN IF EXISTS valid_from CASCADE,
  DROP COLUMN IF EXISTS valid_until CASCADE,
  DROP COLUMN IF EXISTS terms_conditions CASCADE,
  DROP COLUMN IF EXISTS applicable_treatments CASCADE,
  DROP COLUMN IF EXISTS applicable_branches CASCADE,
  DROP COLUMN IF EXISTS max_uses CASCADE,
  DROP COLUMN IF EXISTS current_uses CASCADE;

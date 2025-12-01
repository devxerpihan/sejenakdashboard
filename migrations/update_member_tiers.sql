-- Migration: Update member_points tier system from old (Bronze, Silver, Gold, Platinum) to new (Grace, Signature, Elite)
-- Based on Sejenak Rewards System specification
-- 
-- New Tier System:
-- Grace: Default tier, 3% cashback, multiplier 1.0
-- Signature: 4% cashback, multiplier 1.25, requires ≥Rp3,000,000 spending in 12 months
-- Elite: 5% cashback, multiplier 1.5, requires ≥Rp7,500,000 spending in 12 months

-- Step 1: Drop the old check constraint FIRST
-- This MUST be done before updating any data, otherwise updates will fail
ALTER TABLE public.member_points
DROP CONSTRAINT IF EXISTS member_points_tier_check;

-- Step 2: Update ALL existing tier data to new tier system
-- Map old tiers to new tiers:
-- Bronze/Bliss -> Grace (default tier)
-- Silver -> Signature  
-- Gold/Platinum/VIP -> Elite
-- Any other invalid values -> Grace (default)

UPDATE public.member_points
SET tier = 'Grace'
WHERE tier IN ('Bronze', 'Bliss') OR tier IS NULL;

UPDATE public.member_points
SET tier = 'Signature'
WHERE tier = 'Silver';

UPDATE public.member_points
SET tier = 'Elite'
WHERE tier IN ('Gold', 'Platinum', 'VIP');

-- Catch any remaining invalid values (empty strings, unexpected values, etc.)
UPDATE public.member_points
SET tier = 'Grace'
WHERE tier IS NULL 
   OR tier NOT IN ('Grace', 'Signature', 'Elite')
   OR tier = '';

-- Step 3: Ensure all existing rows have valid tier values before adding constraint
-- This prevents constraint violations on existing data
UPDATE public.member_points
SET tier = 'Grace'
WHERE tier IS NULL 
   OR tier NOT IN ('Grace', 'Signature', 'Elite');

-- Step 4: Update the default tier value
ALTER TABLE public.member_points
ALTER COLUMN tier SET DEFAULT 'Grace';

-- Step 5: Update the trigger to run on both INSERT and UPDATE
-- This ensures new rows get the correct tier and tier_id automatically
-- IMPORTANT: Do this BEFORE adding the constraint so the trigger can set valid values
DROP TRIGGER IF EXISTS trigger_update_member_tier ON public.member_points;

CREATE TRIGGER trigger_update_member_tier
BEFORE INSERT OR UPDATE ON public.member_points
FOR EACH ROW
EXECUTE FUNCTION update_member_tier();

-- Step 6: Add new check constraint with new tier names
-- Note: This is added AFTER the trigger is updated and data is cleaned
-- IMPORTANT: Ensure create_member_tiers_and_function.sql has been run first!
ALTER TABLE public.member_points
ADD CONSTRAINT member_points_tier_check CHECK (
  tier IS NOT NULL AND tier = ANY (
    ARRAY[
      'Grace'::text,
      'Signature'::text,
      'Elite'::text
    ]
  )
);


-- Step 6: Update tier_id for ALL existing records based on their tier
-- This ensures all existing member_points have correct tier_id references matching their tier name
-- After updating tier names in Step 1, we need to update tier_id to match
UPDATE public.member_points mp
SET tier_id = (
  SELECT id 
  FROM public.member_tiers mt 
  WHERE mt.name = mp.tier 
    AND mt.is_active = true 
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1 
  FROM public.member_tiers mt 
  WHERE mt.name = mp.tier 
    AND mt.is_active = true
);

-- Step 7: For any records that still don't have a valid tier_id (e.g., tier doesn't match any member_tiers), set to Grace
UPDATE public.member_points mp
SET tier_id = (SELECT id FROM public.member_tiers WHERE name = 'Grace' AND is_active = true LIMIT 1),
    tier = 'Grace'
WHERE tier_id IS NULL 
   OR tier_id NOT IN (SELECT id FROM public.member_tiers WHERE is_active = true)
   OR NOT EXISTS (
     SELECT 1 
     FROM public.member_tiers mt 
     WHERE mt.name = mp.tier 
       AND mt.is_active = true
   );

-- Step 7b: Add foreign key constraint from tier_id to member_tiers.id
-- This ensures referential integrity
-- IMPORTANT: Do this AFTER all tier_id values have been updated to valid references
-- First, drop the constraint if it exists (in case it was added before)
ALTER TABLE public.member_points
DROP CONSTRAINT IF EXISTS member_points_tier_id_fkey;

-- Add the foreign key constraint
-- Using ON DELETE RESTRICT to prevent accidental deletion of tiers that are in use
ALTER TABLE public.member_points
ADD CONSTRAINT member_points_tier_id_fkey 
FOREIGN KEY (tier_id) 
REFERENCES public.member_tiers(id) 
ON DELETE RESTRICT;

-- Step 8: Update member_tiers table if it exists (optional - for reference)
-- This ensures the tier reference table also uses the new names
-- Note: Only run this if member_tiers table exists and you want to update it

-- First, check if we need to update member_tiers table
DO $$
BEGIN
  -- Update existing tier records in member_tiers if they exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'member_tiers') THEN
    -- Map old tier names to new ones
    UPDATE public.member_tiers
    SET name = 'Grace', display_name = 'Grace'
    WHERE name IN ('Bronze', 'Bliss');
    
    UPDATE public.member_tiers
    SET name = 'Signature', display_name = 'Signature'
    WHERE name = 'Silver';
    
    UPDATE public.member_tiers
    SET name = 'Elite', display_name = 'Elite'
    WHERE name IN ('Gold', 'Platinum', 'VIP');
  END IF;
END $$;

-- Step 8: Update member_levels table if it exists (optional - for reference)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'member_levels') THEN
    -- Similar mapping for member_levels if needed
    UPDATE public.member_levels
    SET name = 'Grace', display_name = 'Grace'
    WHERE name IN ('Bronze', 'Bliss');
    
    UPDATE public.member_levels
    SET name = 'Signature', display_name = 'Signature'
    WHERE name = 'Silver';
    
    UPDATE public.member_levels
    SET name = 'Elite', display_name = 'Elite'
    WHERE name IN ('Gold', 'Platinum', 'VIP');
  END IF;
END $$;

-- Verification query (commented out - uncomment to verify after migration)
-- SELECT tier, COUNT(*) as count 
-- FROM public.member_points 
-- GROUP BY tier 
-- ORDER BY tier;


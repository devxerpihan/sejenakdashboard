-- Create member_tiers table with new tier system (Grace, Signature, Elite)
-- This table defines the tier structure for the loyalty program

CREATE TABLE IF NOT EXISTS public.member_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  min_points INTEGER NOT NULL,
  display_name TEXT NOT NULL,
  color TEXT NULL,
  icon TEXT NULL,
  is_active BOOLEAN NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  CONSTRAINT member_tiers_pkey PRIMARY KEY (id),
  CONSTRAINT member_tiers_name_key UNIQUE (name)
) TABLESPACE pg_default;

-- Note: member_levels table is not used in this system
-- The function will set level_id to NULL or use tier_id as fallback

-- Insert default tiers based on new system
-- Based on loyalty and rewards.md:
-- Grace: Default tier (0 points) - 3% cashback, multiplier 1.0
-- Signature: Mid-tier (3000 points ≈ Rp3,000,000 spending) - 4% cashback, multiplier 1.25
-- Elite: Premium tier (7500 points ≈ Rp7,500,000 spending) - 5% cashback, multiplier 1.5
-- Note: 1 point = Rp1,000, so 3000 points = Rp3,000,000, 7500 points = Rp7,500,000

INSERT INTO public.member_tiers (name, min_points, display_name, color, icon, is_active, sort_order)
VALUES 
  ('Grace', 0, 'Grace', '#F5F5DC', NULL, true, 1),
  ('Signature', 3000, 'Signature', '#FFB6C1', NULL, true, 2),
  ('Elite', 7500, 'Elite', '#F7E7CE', NULL, true, 3)
ON CONFLICT (name) DO UPDATE
SET 
  min_points = EXCLUDED.min_points,
  display_name = EXCLUDED.display_name,
  color = EXCLUDED.color,
  icon = EXCLUDED.icon,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Note: No member_levels data insertion needed as the table doesn't exist

-- Create or replace the update_member_tier function
-- This function automatically updates the tier and tier_id based on total_points
-- Note: member_levels table doesn't exist, so level_id will use tier_id as fallback
CREATE OR REPLACE FUNCTION public.update_member_tier()
RETURNS TRIGGER AS $$
DECLARE
  new_tier_id UUID;
  new_tier_name TEXT;
BEGIN
  -- Always ensure we have a valid tier_id first
  -- If tier is already set and valid, ensure tier_id matches
  IF NEW.tier IS NOT NULL AND NEW.tier IN ('Grace', 'Signature', 'Elite') THEN
    SELECT id INTO new_tier_id
    FROM public.member_tiers
    WHERE name = NEW.tier 
      AND is_active = true
    LIMIT 1;
    
    IF new_tier_id IS NOT NULL THEN
      NEW.tier_id = new_tier_id;
      -- Ensure tier is exactly one of the valid values (trim and validate)
      IF NEW.tier NOT IN ('Grace', 'Signature', 'Elite') THEN
        NEW.tier = 'Grace';
        SELECT id INTO new_tier_id
        FROM public.member_tiers
        WHERE name = 'Grace' AND is_active = true
        LIMIT 1;
        NEW.tier_id = new_tier_id;
      END IF;
      RETURN NEW;
    END IF;
  END IF;

  -- Find the appropriate tier based on total_points
  SELECT id, name INTO new_tier_id, new_tier_name
  FROM public.member_tiers
  WHERE min_points <= COALESCE(NEW.total_points, 0)
    AND is_active = true
  ORDER BY min_points DESC
  LIMIT 1;

  -- If no tier found, default to Grace
  IF new_tier_id IS NULL OR new_tier_name IS NULL THEN
    SELECT id, name INTO new_tier_id, new_tier_name
    FROM public.member_tiers
    WHERE name = 'Grace' AND is_active = true
    LIMIT 1;
    
    -- If still no tier found, something is wrong - but we must set valid values
    IF new_tier_id IS NULL THEN
      -- This should never happen if member_tiers is set up correctly
      -- But we'll set safe defaults
      NEW.tier = 'Grace';
      -- tier_id must be set, but we can't set it if member_tiers doesn't exist
      -- This will cause an error, which is better than silent failure
      RAISE EXCEPTION 'member_tiers table must have Grace tier defined';
    END IF;
  END IF;

  -- Update the tier and tier_id
  -- Note: member_points table has tier_id (required), but no level or level_id columns
  NEW.tier = new_tier_name;
  NEW.tier_id = new_tier_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_member_tiers_min_points ON public.member_tiers USING btree (min_points) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_member_tiers_is_active ON public.member_tiers USING btree (is_active) TABLESPACE pg_default;

-- Create trigger for updating updated_at timestamp on member_tiers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists, then create it
DROP TRIGGER IF EXISTS trigger_update_member_tiers_updated_at ON public.member_tiers;

CREATE TRIGGER trigger_update_member_tiers_updated_at
BEFORE UPDATE ON public.member_tiers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Note: No trigger for member_levels as the table doesn't exist


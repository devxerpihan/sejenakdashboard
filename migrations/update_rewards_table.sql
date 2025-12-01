-- Update rewards table to add new columns for the reward management system
-- This migration works with the existing rewards table schema

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add method column (Point or Stamp)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'method') THEN
    ALTER TABLE public.rewards ADD COLUMN method text NULL DEFAULT 'Point';
    ALTER TABLE public.rewards ADD CONSTRAINT rewards_method_check CHECK (
      (method IS NULL OR method = ANY (ARRAY['Point'::text, 'Stamp'::text]))
    );
  END IF;

  -- Add claim_type column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'claim_type') THEN
    ALTER TABLE public.rewards ADD COLUMN claim_type text NULL DEFAULT 'Auto';
  END IF;

  -- Add auto_reward column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'auto_reward') THEN
    ALTER TABLE public.rewards ADD COLUMN auto_reward text NULL;
  END IF;

  -- Add min_point column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'min_point') THEN
    ALTER TABLE public.rewards ADD COLUMN min_point integer NULL;
    ALTER TABLE public.rewards ADD CONSTRAINT rewards_min_point_check CHECK ((min_point IS NULL OR min_point >= 0));
  END IF;

  -- Add multiplier column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'multiplier') THEN
    ALTER TABLE public.rewards ADD COLUMN multiplier text NULL;
  END IF;

  -- Add category column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'category') THEN
    ALTER TABLE public.rewards ADD COLUMN category text NULL;
  END IF;

  -- Add total_points column (maps to points_required)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'total_points') THEN
    ALTER TABLE public.rewards ADD COLUMN total_points integer NULL;
    ALTER TABLE public.rewards ADD CONSTRAINT rewards_total_points_check CHECK ((total_points IS NULL OR total_points >= 0));
    -- Populate from points_required
    UPDATE public.rewards SET total_points = points_required WHERE total_points IS NULL;
  END IF;

  -- Add quota column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'quota') THEN
    ALTER TABLE public.rewards ADD COLUMN quota integer NULL;
    ALTER TABLE public.rewards ADD CONSTRAINT rewards_quota_check CHECK ((quota IS NULL OR quota >= 0));
  END IF;

  -- Add usage_count column (calculated from reward_redemptions)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'usage_count') THEN
    ALTER TABLE public.rewards ADD COLUMN usage_count integer NOT NULL DEFAULT 0;
    ALTER TABLE public.rewards ADD CONSTRAINT rewards_usage_count_check CHECK ((usage_count >= 0));
    -- Calculate initial usage_count from redemptions
    UPDATE public.rewards r
    SET usage_count = COALESCE((
      SELECT COUNT(*) 
      FROM public.reward_redemptions rr 
      WHERE rr.reward_id = r.id AND rr.status = 'completed'
    ), 0);
  END IF;

  -- Add status column (maps to is_active)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'status') THEN
    ALTER TABLE public.rewards ADD COLUMN status text NULL;
    ALTER TABLE public.rewards ADD CONSTRAINT rewards_status_check CHECK (
      (status IS NULL OR status = ANY (ARRAY['Active'::text, 'Expired'::text]))
    );
    -- Populate from is_active
    UPDATE public.rewards SET status = CASE WHEN is_active THEN 'Active' ELSE 'Expired' END WHERE status IS NULL;
    ALTER TABLE public.rewards ALTER COLUMN status SET DEFAULT 'Active';
    ALTER TABLE public.rewards ALTER COLUMN status SET NOT NULL;
  END IF;

  -- Add expiry column (in months, calculated from expiry_date)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'expiry') THEN
    ALTER TABLE public.rewards ADD COLUMN expiry integer NULL;
    ALTER TABLE public.rewards ADD CONSTRAINT rewards_expiry_check CHECK ((expiry IS NULL OR expiry > 0));
  END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_rewards_method ON public.rewards USING btree (method) TABLESPACE pg_default WHERE method IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rewards_claim_type ON public.rewards USING btree (claim_type) TABLESPACE pg_default WHERE claim_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rewards_category ON public.rewards USING btree (category) TABLESPACE pg_default WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rewards_status ON public.rewards USING btree (status) TABLESPACE pg_default;

-- Add comments for new columns
COMMENT ON COLUMN public.rewards.method IS 'Method of redemption: Point or Stamp';
COMMENT ON COLUMN public.rewards.claim_type IS 'Type of claim: Auto, 12 month, etc.';
COMMENT ON COLUMN public.rewards.auto_reward IS 'Auto reward name if applicable';
COMMENT ON COLUMN public.rewards.min_point IS 'Minimum points required (optional)';
COMMENT ON COLUMN public.rewards.expiry IS 'Expiry in months (optional)';
COMMENT ON COLUMN public.rewards.multiplier IS 'Multiplier value (e.g., 1x, 1.25x, 1.5x)';
COMMENT ON COLUMN public.rewards.category IS 'Category of reward: Service, Discount, Product, etc.';
COMMENT ON COLUMN public.rewards.total_points IS 'Total points required for the reward';
COMMENT ON COLUMN public.rewards.quota IS 'Maximum number of redemptions allowed (NULL for unlimited)';
COMMENT ON COLUMN public.rewards.usage_count IS 'Number of times this reward has been redeemed';
COMMENT ON COLUMN public.rewards.status IS 'Status of the reward: Active or Expired';


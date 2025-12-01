-- Create rewards table
CREATE TABLE IF NOT EXISTS public.rewards (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  reward text NOT NULL,
  method text NOT NULL DEFAULT 'Point',
  required integer NOT NULL DEFAULT 0,
  claim_type text NOT NULL,
  auto_reward text NULL,
  min_point integer NULL,
  expiry integer NULL,
  multiplier text NULL,
  image_url text NULL,
  category text NULL,
  total_points integer NULL,
  quota integer NULL,
  usage_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Active',
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT rewards_pkey PRIMARY KEY (id),
  CONSTRAINT rewards_method_check CHECK (
    (method = ANY (ARRAY['Point'::text, 'Stamp'::text]))
  ),
  CONSTRAINT rewards_status_check CHECK (
    (status = ANY (ARRAY['Active'::text, 'Expired'::text]))
  ),
  CONSTRAINT rewards_required_check CHECK ((required >= 0)),
  CONSTRAINT rewards_min_point_check CHECK ((min_point IS NULL OR min_point >= 0)),
  CONSTRAINT rewards_expiry_check CHECK ((expiry IS NULL OR expiry > 0)),
  CONSTRAINT rewards_total_points_check CHECK ((total_points IS NULL OR total_points >= 0)),
  CONSTRAINT rewards_quota_check CHECK ((quota IS NULL OR quota >= 0)),
  CONSTRAINT rewards_usage_count_check CHECK ((usage_count >= 0))
) TABLESPACE pg_default;

-- Add missing columns if table already exists
DO $$ 
BEGIN
  -- Add method column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'method') THEN
    ALTER TABLE public.rewards ADD COLUMN method text NOT NULL DEFAULT 'Point';
    ALTER TABLE public.rewards ADD CONSTRAINT rewards_method_check CHECK (
      (method = ANY (ARRAY['Point'::text, 'Stamp'::text]))
    );
  END IF;

  -- Add claim_type column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'claim_type') THEN
    ALTER TABLE public.rewards ADD COLUMN claim_type text NOT NULL DEFAULT 'Auto';
  END IF;

  -- Add required column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'required') THEN
    ALTER TABLE public.rewards ADD COLUMN required integer NOT NULL DEFAULT 0;
    ALTER TABLE public.rewards ADD CONSTRAINT rewards_required_check CHECK ((required >= 0));
  END IF;

  -- Add auto_reward column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'auto_reward') THEN
    ALTER TABLE public.rewards ADD COLUMN auto_reward text NULL;
  END IF;

  -- Add min_point column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'min_point') THEN
    ALTER TABLE public.rewards ADD COLUMN min_point integer NULL;
    ALTER TABLE public.rewards ADD CONSTRAINT rewards_min_point_check CHECK ((min_point IS NULL OR min_point >= 0));
  END IF;

  -- Add expiry column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'expiry') THEN
    ALTER TABLE public.rewards ADD COLUMN expiry integer NULL;
    ALTER TABLE public.rewards ADD CONSTRAINT rewards_expiry_check CHECK ((expiry IS NULL OR expiry > 0));
  END IF;

  -- Add multiplier column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'multiplier') THEN
    ALTER TABLE public.rewards ADD COLUMN multiplier text NULL;
  END IF;

  -- Add image_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'image_url') THEN
    ALTER TABLE public.rewards ADD COLUMN image_url text NULL;
  END IF;

  -- Add category column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'category') THEN
    ALTER TABLE public.rewards ADD COLUMN category text NULL;
  END IF;

  -- Add total_points column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'total_points') THEN
    ALTER TABLE public.rewards ADD COLUMN total_points integer NULL;
    ALTER TABLE public.rewards ADD CONSTRAINT rewards_total_points_check CHECK ((total_points IS NULL OR total_points >= 0));
  END IF;

  -- Add quota column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'quota') THEN
    ALTER TABLE public.rewards ADD COLUMN quota integer NULL;
    ALTER TABLE public.rewards ADD CONSTRAINT rewards_quota_check CHECK ((quota IS NULL OR quota >= 0));
  END IF;

  -- Add usage_count column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'usage_count') THEN
    ALTER TABLE public.rewards ADD COLUMN usage_count integer NOT NULL DEFAULT 0;
    ALTER TABLE public.rewards ADD CONSTRAINT rewards_usage_count_check CHECK ((usage_count >= 0));
  END IF;

  -- Add status column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rewards' AND column_name = 'status') THEN
    ALTER TABLE public.rewards ADD COLUMN status text NOT NULL DEFAULT 'Active';
    ALTER TABLE public.rewards ADD CONSTRAINT rewards_status_check CHECK (
      (status = ANY (ARRAY['Active'::text, 'Expired'::text]))
    );
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rewards_method ON public.rewards USING btree (method) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_rewards_claim_type ON public.rewards USING btree (claim_type) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_rewards_created_at ON public.rewards USING btree (created_at) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_rewards_category ON public.rewards USING btree (category) TABLESPACE pg_default WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rewards_status ON public.rewards USING btree (status) TABLESPACE pg_default;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_rewards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_rewards_updated_at ON public.rewards;
CREATE TRIGGER trigger_update_rewards_updated_at
  BEFORE UPDATE ON public.rewards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_rewards_updated_at();

-- Add comments to table
COMMENT ON TABLE public.rewards IS 'Stores reward items that can be redeemed with points or stamps';
COMMENT ON COLUMN public.rewards.reward IS 'Name of the reward';
COMMENT ON COLUMN public.rewards.method IS 'Method of redemption: Point or Stamp';
COMMENT ON COLUMN public.rewards.required IS 'Number of points or stamps required to redeem';
COMMENT ON COLUMN public.rewards.claim_type IS 'Type of claim: Auto, 12 month, etc.';
COMMENT ON COLUMN public.rewards.auto_reward IS 'Auto reward name if applicable';
COMMENT ON COLUMN public.rewards.min_point IS 'Minimum points required (optional)';
COMMENT ON COLUMN public.rewards.expiry IS 'Expiry in months (optional)';
COMMENT ON COLUMN public.rewards.multiplier IS 'Multiplier value (e.g., 1x, 1.25x, 1.5x)';
COMMENT ON COLUMN public.rewards.image_url IS 'URL of the reward image';
COMMENT ON COLUMN public.rewards.category IS 'Category of reward: Service, Discount, Product, etc.';
COMMENT ON COLUMN public.rewards.total_points IS 'Total points required for the reward';
COMMENT ON COLUMN public.rewards.quota IS 'Maximum number of redemptions allowed (NULL for unlimited)';
COMMENT ON COLUMN public.rewards.usage_count IS 'Number of times this reward has been redeemed';
COMMENT ON COLUMN public.rewards.status IS 'Status of the reward: Active or Expired';

-- Insert initial rewards data
INSERT INTO public.rewards (
  reward,
  method,
  required,
  claim_type,
  auto_reward,
  min_point,
  expiry,
  multiplier,
  category,
  total_points,
  quota,
  usage_count,
  status
) VALUES
  (
    '10% Discount Body Ritual',
    'Point',
    100,
    'Auto',
    NULL,
    0,
    12,
    '1x',
    'Service',
    100,
    50,
    10,
    'Active'
  ),
  (
    'Extra 15% Discount Treatment',
    'Point',
    150,
    '12 month',
    NULL,
    0,
    12,
    '1x',
    'Discount',
    150,
    100,
    70,
    'Expired'
  ),
  (
    'Free Sejenak Quick Hair Wash',
    'Point',
    200,
    '12 month',
    NULL,
    0,
    12,
    '1x',
    'Service',
    200,
    10,
    0,
    'Expired'
  ),
  (
    'Shampoo',
    'Point',
    300,
    '12 month',
    NULL,
    0,
    12,
    '1x',
    'Product',
    300,
    5,
    0,
    'Expired'
  ),
  (
    'Stamp 500 points',
    'Point',
    500,
    '12 month',
    NULL,
    0,
    12,
    '1x',
    '500 points',
    500,
    5,
    0,
    'Active'
  )
ON CONFLICT (id) DO NOTHING;


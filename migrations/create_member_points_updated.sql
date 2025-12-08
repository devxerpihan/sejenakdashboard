-- Updated member_points table schema with new tier system (Grace, Signature, Elite)
-- This replaces the old schema with Bronze, Silver, Gold, Platinum

CREATE TABLE IF NOT EXISTS public.member_points (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  total_points INTEGER NULL DEFAULT 0,
  lifetime_points INTEGER NULL DEFAULT 0,
  tier TEXT NULL DEFAULT 'Grace'::text,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  level TEXT NULL,
  tier_id UUID NOT NULL,
  level_id UUID NOT NULL,
  CONSTRAINT member_points_pkey PRIMARY KEY (id),
  CONSTRAINT member_points_user_id_key UNIQUE (user_id),
  CONSTRAINT member_points_level_id_fkey FOREIGN KEY (level_id) REFERENCES member_levels (id),
  CONSTRAINT member_points_tier_id_fkey FOREIGN KEY (tier_id) REFERENCES member_tiers (id),
  CONSTRAINT member_points_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles (id) ON DELETE CASCADE,
  CONSTRAINT member_points_tier_check CHECK (
    tier = ANY (
      ARRAY[
        'Grace'::text,
        'Signature'::text,
        'Elite'::text
      ]
    )
  )
) TABLESPACE pg_default;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_member_points_user_id ON public.member_points USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_member_points_tier_id ON public.member_points USING btree (tier_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_member_points_level_id ON public.member_points USING btree (level_id) TABLESPACE pg_default;

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER trigger_update_member_tier BEFORE
UPDATE ON member_points FOR EACH ROW
EXECUTE FUNCTION update_member_tier ();





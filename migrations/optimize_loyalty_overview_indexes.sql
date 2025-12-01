-- Optimize indexes for loyalty overview queries
-- These indexes will significantly speed up the profiles and member_points queries

-- Index on profiles for role filtering (used in loyalty overview)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles USING btree (role) TABLESPACE pg_default WHERE role = 'customer';

-- Composite index on profiles for role + created_at (for new members calculation)
CREATE INDEX IF NOT EXISTS idx_profiles_role_created_at ON public.profiles USING btree (role, created_at) TABLESPACE pg_default WHERE role = 'customer';

-- Index on profiles id for faster IN queries (already has primary key, but this helps with large IN lists)
-- The primary key already provides an index, but we can add a covering index for our specific query
CREATE INDEX IF NOT EXISTS idx_profiles_id_role_created_at ON public.profiles USING btree (id, role, created_at) TABLESPACE pg_default WHERE role = 'customer';

-- Index on points_history for date range queries
CREATE INDEX IF NOT EXISTS idx_points_history_created_at ON public.points_history USING btree (created_at) TABLESPACE pg_default;

-- Composite index on points_history for type + created_at filtering
CREATE INDEX IF NOT EXISTS idx_points_history_type_created_at ON public.points_history USING btree (type, created_at) TABLESPACE pg_default;

-- Index on reward_redemptions for date range queries
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_redeemed_at ON public.reward_redemptions USING btree (redeemed_at) TABLESPACE pg_default;

-- Index on member_points for tier filtering
CREATE INDEX IF NOT EXISTS idx_member_points_tier ON public.member_points USING btree (tier) TABLESPACE pg_default;

-- Comments
COMMENT ON INDEX idx_profiles_role IS 'Index for filtering profiles by role (customer)';
COMMENT ON INDEX idx_profiles_role_created_at IS 'Composite index for filtering customers by role and creation date';
COMMENT ON INDEX idx_profiles_id_role_created_at IS 'Covering index for profiles query with id IN list, role, and created_at';
COMMENT ON INDEX idx_points_history_created_at IS 'Index for date range queries on points_history';
COMMENT ON INDEX idx_points_history_type_created_at IS 'Composite index for filtering points_history by type and date';
COMMENT ON INDEX idx_reward_redemptions_redeemed_at IS 'Index for date range queries on reward_redemptions';
COMMENT ON INDEX idx_member_points_tier IS 'Index for filtering member_points by tier';


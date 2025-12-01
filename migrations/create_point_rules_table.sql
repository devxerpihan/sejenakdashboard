-- Create point_rules table
CREATE TABLE IF NOT EXISTS public.point_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  spend_amount integer NOT NULL DEFAULT 0,
  point_earned integer NOT NULL DEFAULT 0,
  expiry integer NOT NULL DEFAULT 12,
  status text NOT NULL DEFAULT 'Active',
  welcome_point integer NULL,
  rule_type text NOT NULL DEFAULT 'general',
  category text NULL,
  days text[] NULL,
  treatments uuid[] NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT point_rules_pkey PRIMARY KEY (id),
  CONSTRAINT point_rules_status_check CHECK (
    (status = ANY (ARRAY['Active'::text, 'Inactive'::text]))
  ),
  CONSTRAINT point_rules_rule_type_check CHECK (
    (rule_type = ANY (ARRAY['general'::text, 'category'::text, 'treatment'::text, 'day'::text]))
  ),
  CONSTRAINT point_rules_spend_amount_check CHECK ((spend_amount >= 0)),
  CONSTRAINT point_rules_point_earned_check CHECK ((point_earned >= 0)),
  CONSTRAINT point_rules_expiry_check CHECK ((expiry > 0)),
  CONSTRAINT point_rules_welcome_point_check CHECK ((welcome_point IS NULL OR welcome_point >= 0))
) TABLESPACE pg_default;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_point_rules_status ON public.point_rules USING btree (status) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_point_rules_rule_type ON public.point_rules USING btree (rule_type) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_point_rules_category ON public.point_rules USING btree (category) TABLESPACE pg_default WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_point_rules_created_at ON public.point_rules USING btree (created_at) TABLESPACE pg_default;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_point_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_point_rules_updated_at ON public.point_rules;
CREATE TRIGGER trigger_update_point_rules_updated_at
  BEFORE UPDATE ON public.point_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_point_rules_updated_at();

-- Add comment to table
COMMENT ON TABLE public.point_rules IS 'Stores point earning rules for the loyalty program';
COMMENT ON COLUMN public.point_rules.spend_amount IS 'Amount in Rupiah that must be spent to earn points';
COMMENT ON COLUMN public.point_rules.point_earned IS 'Number of points earned for the spend amount';
COMMENT ON COLUMN public.point_rules.expiry IS 'Number of months before points expire';
COMMENT ON COLUMN public.point_rules.status IS 'Active or Inactive status of the rule';
COMMENT ON COLUMN public.point_rules.welcome_point IS 'Optional welcome points for new members';
COMMENT ON COLUMN public.point_rules.rule_type IS 'Type of rule: general, category, treatment, or day';
COMMENT ON COLUMN public.point_rules.category IS 'Treatment category filter (if rule_type is category)';
COMMENT ON COLUMN public.point_rules.days IS 'Array of days of week (if rule_type is day)';
COMMENT ON COLUMN public.point_rules.treatments IS 'Array of treatment IDs (if rule_type is treatment)';

-- Insert initial point rules data
INSERT INTO public.point_rules (
  spend_amount,
  point_earned,
  expiry,
  status,
  welcome_point,
  rule_type,
  category,
  days,
  treatments
) VALUES
  -- General rule: Members gain 10 points for every Rp 100,000 spent
  (
    100000,  -- spend_amount
    10,      -- point_earned
    12,      -- expiry (months)
    'Active', -- status
    10,      -- welcome_point (for new members)
    'general', -- rule_type
    NULL,    -- category
    NULL,    -- days
    NULL     -- treatments
  )
ON CONFLICT (id) DO NOTHING;


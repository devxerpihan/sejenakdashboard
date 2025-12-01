-- Create discounts table
CREATE TABLE IF NOT EXISTS public.discounts (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'percentage',
  value NUMERIC(10, 2) NOT NULL DEFAULT 0,
  eligibility TEXT NULL,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  CONSTRAINT discounts_pkey PRIMARY KEY (id),
  CONSTRAINT discounts_type_check CHECK (type IN ('nominal', 'percentage')),
  CONSTRAINT discounts_status_check CHECK (status IN ('active', 'expired', 'inactive'))
) TABLESPACE pg_default;

-- Create index on name for faster searches
CREATE INDEX IF NOT EXISTS idx_discounts_name 
  ON public.discounts(name);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_discounts_status 
  ON public.discounts(status);

-- Create trigger to update updated_at column
DROP TRIGGER IF EXISTS update_discounts_updated_at ON public.discounts;
CREATE TRIGGER update_discounts_updated_at
  BEFORE UPDATE ON public.discounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


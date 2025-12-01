-- Create promos table
CREATE TABLE IF NOT EXISTS public.promos (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'nominal',
  value NUMERIC(10, 2) NOT NULL DEFAULT 0,
  quota INTEGER NOT NULL DEFAULT 0,
  usage_count INTEGER NOT NULL DEFAULT 0,
  min_transaction NUMERIC(10, 2) NULL,
  eligibility TEXT NULL,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  CONSTRAINT promos_pkey PRIMARY KEY (id),
  CONSTRAINT promos_code_unique UNIQUE (code),
  CONSTRAINT promos_type_check CHECK (type IN ('nominal', 'percentage')),
  CONSTRAINT promos_status_check CHECK (status IN ('active', 'expired', 'inactive'))
) TABLESPACE pg_default;

-- Create index on code for faster searches
CREATE INDEX IF NOT EXISTS idx_promos_code 
  ON public.promos(code);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_promos_status 
  ON public.promos(status);

-- Create trigger to update updated_at column
DROP TRIGGER IF EXISTS update_promos_updated_at ON public.promos;
CREATE TRIGGER update_promos_updated_at
  BEFORE UPDATE ON public.promos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


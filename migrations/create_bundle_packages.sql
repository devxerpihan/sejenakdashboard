-- Create bundle_packages table
CREATE TABLE IF NOT EXISTS public.bundle_packages (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL,
  items TEXT NULL,
  pricing NUMERIC(10, 2) NOT NULL DEFAULT 0,
  branch TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  image_url TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  CONSTRAINT bundle_packages_pkey PRIMARY KEY (id),
  CONSTRAINT bundle_packages_status_check CHECK (status IN ('active', 'inactive'))
) TABLESPACE pg_default;

-- Create index on name for faster searches
CREATE INDEX IF NOT EXISTS idx_bundle_packages_name 
  ON public.bundle_packages(name);

-- Create index on branch for filtering
CREATE INDEX IF NOT EXISTS idx_bundle_packages_branch 
  ON public.bundle_packages(branch);

-- Create trigger to update updated_at column
DROP TRIGGER IF EXISTS update_bundle_packages_updated_at ON public.bundle_packages;
CREATE TRIGGER update_bundle_packages_updated_at
  BEFORE UPDATE ON public.bundle_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


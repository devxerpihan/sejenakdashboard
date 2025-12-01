-- Create treatment_pricing_variants table
CREATE TABLE IF NOT EXISTS public.treatment_pricing_variants (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  treatment_id UUID NOT NULL,
  name TEXT NOT NULL,
  weekday_price NUMERIC(10, 2) NULL,
  weekend_price NUMERIC(10, 2) NULL,
  holiday_price NUMERIC(10, 2) NULL,
  weekday_enabled BOOLEAN NOT NULL DEFAULT true,
  weekend_enabled BOOLEAN NOT NULL DEFAULT true,
  holiday_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  CONSTRAINT treatment_pricing_variants_pkey PRIMARY KEY (id),
  CONSTRAINT treatment_pricing_variants_treatment_id_fkey 
    FOREIGN KEY (treatment_id) 
    REFERENCES public.treatments(id) 
    ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create index on treatment_id for faster queries
CREATE INDEX IF NOT EXISTS idx_treatment_pricing_variants_treatment_id 
  ON public.treatment_pricing_variants(treatment_id);

-- Create trigger to update updated_at column
DROP TRIGGER IF EXISTS update_treatment_pricing_variants_updated_at ON public.treatment_pricing_variants;
CREATE TRIGGER update_treatment_pricing_variants_updated_at
  BEFORE UPDATE ON public.treatment_pricing_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


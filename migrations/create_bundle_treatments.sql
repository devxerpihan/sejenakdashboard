-- Create bundle_treatments junction table
CREATE TABLE IF NOT EXISTS public.bundle_treatments (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  bundle_package_id UUID NOT NULL,
  treatment_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  CONSTRAINT bundle_treatments_pkey PRIMARY KEY (id),
  CONSTRAINT bundle_treatments_bundle_package_id_fkey 
    FOREIGN KEY (bundle_package_id) 
    REFERENCES public.bundle_packages(id) 
    ON DELETE CASCADE,
  CONSTRAINT bundle_treatments_treatment_id_fkey 
    FOREIGN KEY (treatment_id) 
    REFERENCES public.treatments(id) 
    ON DELETE CASCADE,
  CONSTRAINT bundle_treatments_unique UNIQUE (bundle_package_id, treatment_id)
) TABLESPACE pg_default;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_bundle_treatments_bundle_package_id 
  ON public.bundle_treatments(bundle_package_id);

CREATE INDEX IF NOT EXISTS idx_bundle_treatments_treatment_id 
  ON public.bundle_treatments(treatment_id);


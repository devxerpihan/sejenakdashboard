-- Create app_settings table for storing system configurations
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key text NOT NULL,
  value jsonb NOT NULL,
  description text NULL,
  is_secret boolean DEFAULT false, -- To flag sensitive data like API keys
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT app_settings_pkey PRIMARY KEY (id),
  CONSTRAINT app_settings_key_key UNIQUE (key)
) TABLESPACE pg_default;

-- Create index on key for fast lookups
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON public.app_settings USING btree (key) TABLESPACE pg_default;

-- Trigger to update updated_at
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Policies
-- Only admins can read secret settings
CREATE POLICY "Admins can read all settings" ON public.app_settings
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('super_admin', 'admin')
    )
  );

-- Only admins can update settings
CREATE POLICY "Admins can update settings" ON public.app_settings
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('super_admin', 'admin')
    )
  );

-- Insert default SendGrid setting if not exists
INSERT INTO public.app_settings (key, value, description, is_secret)
VALUES 
  ('sendgrid_api_key', '"YOUR_SENDGRID_API_KEY"', 'API Key for SendGrid Email Service', true)
ON CONFLICT (key) DO NOTHING;


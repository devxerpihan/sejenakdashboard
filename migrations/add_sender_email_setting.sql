-- Insert default SendGrid sender email setting if not exists
INSERT INTO public.app_settings (key, value, description, is_secret)
VALUES 
  ('sendgrid_sender_email', '"noreply@sejenak.com"', 'Verified sender email for SendGrid', false)
ON CONFLICT (key) DO NOTHING;


-- Create notification_templates table for reusable broadcast content
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL, -- "Booking Reminder (1 Day Before)", "Happy Birthday", etc.
  type text NOT NULL, -- "booking_reminder", "promo", "treatment_update", "system"
  channel text NOT NULL DEFAULT 'push', -- "push", "email", "both"
  subject text NULL, -- For emails
  title text NULL, -- For push notifications
  content text NOT NULL, -- Template content with placeholders like {{customer_name}}, {{booking_time}}
  trigger_timing text NULL, -- For automated triggers: "-1 day", "-1 hour", "+1 hour" (relative to event)
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT notification_templates_pkey PRIMARY KEY (id),
  CONSTRAINT notification_templates_type_check CHECK (
    type = ANY (ARRAY['booking_reminder', 'promo', 'treatment_update', 'system'])
  ),
  CONSTRAINT notification_templates_channel_check CHECK (
    channel = ANY (ARRAY['push', 'email', 'both'])
  )
) TABLESPACE pg_default;

-- Trigger to update updated_at
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON public.notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage templates" ON public.notification_templates
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Public read templates" ON public.notification_templates
  FOR SELECT USING (true); -- Or restrict if needed

-- Insert default templates
INSERT INTO public.notification_templates (name, type, channel, title, content, trigger_timing)
VALUES 
  ('Booking Reminder (1 Day Before)', 'booking_reminder', 'push', 'Upcoming Appointment', 'Hi {{customer_name}}, you have an appointment tomorrow at {{booking_time}}. See you soon!', '-1 day'),
  ('Booking Reminder (1 Hour Before)', 'booking_reminder', 'push', 'Appointment Reminder', 'Your appointment is in 1 hour at {{booking_time}}. Please arrive on time.', '-1 hour'),
  ('Post-Appointment Feedback', 'booking_reminder', 'push', 'How was your visit?', 'Hi {{customer_name}}, thanks for visiting! How was your treatment today?', '+1 hour');


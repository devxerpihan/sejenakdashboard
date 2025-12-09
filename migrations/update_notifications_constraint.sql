-- Update notifications type check constraint to include new types while preserving existing ones
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check CHECK (
  type = ANY (ARRAY[
    -- Existing types
    'booking'::text,
    'treatment'::text,
    'dessert'::text,
    'system'::text,
    'reminder'::text,
    'member'::text,
    'loyalty'::text,
    -- New types
    'broadcast'::text,
    'booking_reminder'::text,
    'treatment_update'::text,
    'promo'::text,
    -- UI feedback types (optional but useful)
    'info'::text, 
    'success'::text, 
    'warning'::text, 
    'error'::text
  ])
);

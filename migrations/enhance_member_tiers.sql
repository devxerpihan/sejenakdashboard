-- Add missing columns to member_tiers table to support full membership details
ALTER TABLE public.member_tiers
ADD COLUMN IF NOT EXISTS multiplier NUMERIC(4, 2) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS expiry TEXT DEFAULT '12 month',
ADD COLUMN IF NOT EXISTS auto_reward TEXT,
ADD COLUMN IF NOT EXISTS cashback INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stamp_program BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS double_stamp_weekday BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS double_stamp_event BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS priority_booking BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS free_rewards TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS upgrade_requirement INTEGER,
ADD COLUMN IF NOT EXISTS maintain_requirement INTEGER,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS customer_profile TEXT;

-- Update Grace tier
UPDATE public.member_tiers
SET
  multiplier = 1.0,
  expiry = '12 month',
  auto_reward = 'Free Herbal Tea',
  cashback = 3,
  stamp_program = true,
  double_stamp_weekday = false,
  double_stamp_event = false,
  priority_booking = false,
  free_rewards = ARRAY['Free Herbal Tea setiap kunjungan'],
  upgrade_requirement = 3000000,
  maintain_requirement = NULL,
  description = 'Untuk kamu yang mulai memberi ruang bagi diri sendiri. Simbol awal perjalanan lembut menuju ketenangan.',
  customer_profile = 'Biasanya 1–2x/bulan',
  color = '#F5F5DC'
WHERE name = 'Grace';

-- Update Signature tier
UPDATE public.member_tiers
SET
  multiplier = 1.25,
  expiry = '12 month',
  auto_reward = 'Free Sejenak Quick Hairwash',
  cashback = 4,
  stamp_program = true,
  double_stamp_weekday = false,
  double_stamp_event = true,
  priority_booking = false,
  free_rewards = ARRAY['Free Sejenak Quick Hairwash 1x'],
  upgrade_requirement = 7500000,
  maintain_requirement = NULL,
  description = 'Untuk kamu yang sudah menjadikan self-care sebagai bagian dari rutinitas. Menemukan keseimbangan di tengah kesibukan.',
  customer_profile = 'Rutin 2–3x/bulan',
  color = '#FFB6C1'
WHERE name = 'Signature';

-- Update Elite tier
UPDATE public.member_tiers
SET
  multiplier = 1.5,
  expiry = '12 month',
  auto_reward = 'Exclusive Elite Ritual Box',
  cashback = 5,
  stamp_program = true,
  double_stamp_weekday = true,
  double_stamp_event = true,
  priority_booking = true,
  free_rewards = ARRAY['Exclusive Elite Ritual Box', 'Free Sejenak Ultimate Hydration Pedicure'],
  upgrade_requirement = NULL,
  maintain_requirement = 12000000,
  description = 'Untuk kamu yang hidup dalam ritme tenang, penuh keseimbangan. Ketenangan telah menjadi gaya hidupmu.',
  customer_profile = 'Rutin tiap minggu',
  color = '#F7E7CE'
WHERE name = 'Elite';


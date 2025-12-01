-- Update promos table to store eligibility as JSONB
-- Handle conversion from TEXT to JSONB, converting "All Services" or similar to {"type": "all"}
ALTER TABLE IF EXISTS public.promos 
  ALTER COLUMN eligibility TYPE JSONB USING 
    CASE 
      WHEN eligibility IS NULL THEN NULL::jsonb
      WHEN eligibility::text = 'All Services' OR eligibility::text = 'All' OR eligibility::text = '' THEN '{"type": "all"}'::jsonb
      WHEN eligibility::text LIKE '%Categories%' THEN jsonb_build_object('type', 'categories', 'categoryIds', '[]'::jsonb)
      WHEN eligibility::text LIKE '%Treatments%' THEN jsonb_build_object('type', 'treatments', 'treatmentIds', '[]'::jsonb)
      ELSE 
        CASE 
          WHEN eligibility::text ~ '^[\s]*\{' THEN eligibility::jsonb
          ELSE jsonb_build_object('type', 'all')
        END
    END;

-- Update discounts table to store eligibility as JSONB
-- Handle conversion from TEXT to JSONB, converting "All Services" or similar to {"type": "all"}
ALTER TABLE IF EXISTS public.discounts 
  ALTER COLUMN eligibility TYPE JSONB USING 
    CASE 
      WHEN eligibility IS NULL THEN NULL::jsonb
      WHEN eligibility::text = 'All Services' OR eligibility::text = 'All' OR eligibility::text = '' THEN '{"type": "all"}'::jsonb
      WHEN eligibility::text LIKE '%Categories%' THEN jsonb_build_object('type', 'categories', 'categoryIds', '[]'::jsonb)
      WHEN eligibility::text LIKE '%Treatments%' THEN jsonb_build_object('type', 'treatments', 'treatmentIds', '[]'::jsonb)
      ELSE 
        CASE 
          WHEN eligibility::text ~ '^[\s]*\{' THEN eligibility::jsonb
          ELSE jsonb_build_object('type', 'all')
        END
    END;


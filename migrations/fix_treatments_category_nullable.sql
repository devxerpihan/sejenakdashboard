-- Migration to fix treatment category constraints
-- This allows for "Uncategorized" treatments and supports custom categories created in the UI

-- 1. Remove the strict check constraint that limits categories to a hardcoded list
ALTER TABLE public.treatments DROP CONSTRAINT IF EXISTS treatments_category_check;

-- 2. Allow the category column to be NULL so treatments can be "unassigned"
ALTER TABLE public.treatments ALTER COLUMN category DROP NOT NULL;

-- 3. (Optional) Set any existing empty strings to NULL for consistency
UPDATE public.treatments SET category = NULL WHERE category = '';

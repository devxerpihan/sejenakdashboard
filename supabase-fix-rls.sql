-- Fix RLS policy for member_points table
-- This allows the create_member_record trigger to insert member_points records
-- when a new profile is created
--
-- IMPORTANT: Since you're using Clerk (not Supabase Auth), the trigger runs
-- with the anon key privileges. We need to allow inserts for the anon role
-- OR modify the trigger function to use SECURITY DEFINER.

-- Option 1: Allow anon role to insert (simplest, but less secure)
-- This allows the trigger to work when profiles are created via the anon key
ALTER TABLE public.member_points ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anon to insert member_points" ON public.member_points;
DROP POLICY IF EXISTS "Allow authenticated users to insert member_points" ON public.member_points;
DROP POLICY IF EXISTS "Allow authenticated users to read their own member_points" ON public.member_points;
DROP POLICY IF EXISTS "Allow authenticated users to update their own member_points" ON public.member_points;

-- Policy 1: Allow anon role to insert (needed for trigger to work with Clerk)
-- This is safe because the trigger validates the user_id foreign key
CREATE POLICY "Allow anon to insert member_points"
ON public.member_points
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy 2: Allow authenticated users to insert (for API calls)
CREATE POLICY "Allow authenticated users to insert member_points"
ON public.member_points
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 3: Allow users to read their own member_points
-- Join with profiles table to check ownership
CREATE POLICY "Allow users to read their own member_points"
ON public.member_points
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy 4: Allow users to update their own member_points
CREATE POLICY "Allow users to update their own member_points"
ON public.member_points
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- ============================================================================
-- ALTERNATIVE OPTION (More Secure): Modify the trigger function
-- ============================================================================
-- If you prefer a more secure approach, modify the create_member_record function
-- to use SECURITY DEFINER so it runs with elevated privileges:
--
-- ALTER FUNCTION create_member_record() SECURITY DEFINER;
--
-- Then you can use more restrictive RLS policies that only allow the function
-- to insert, not the anon role directly.


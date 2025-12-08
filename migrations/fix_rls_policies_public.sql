-- Enable RLS on storage.objects if not already enabled
-- NOTE: If you are not a superuser/owner, you might need to run these storage commands
-- in the Supabase Dashboard SQL editor instead.

-- Create policy for public read access to images bucket
-- CREATE POLICY "Public Access"
-- ON storage.objects FOR SELECT
-- USING ( bucket_id = 'images' );

-- Create policy for public uploads to images bucket (No auth check)
-- CREATE POLICY "Public Upload"
-- ON storage.objects FOR INSERT
-- WITH CHECK ( bucket_id = 'images' );

-- Create policy for public updates to images bucket (No auth check)
-- CREATE POLICY "Public Update"
-- ON storage.objects FOR UPDATE
-- USING ( bucket_id = 'images' );

-- Create policy for public deletes to images bucket (No auth check)
-- CREATE POLICY "Public Delete"
-- ON storage.objects FOR DELETE
-- USING ( bucket_id = 'images' );

-- =================================================================
-- RLS Policies for special_offers table (Public Schema)
-- =================================================================

-- Enable RLS
ALTER TABLE public.special_offers ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Enable read access for all users" ON public.special_offers
    FOR SELECT USING (true);

-- Create policy for public insert (No auth check)
CREATE POLICY "Enable insert for all users" ON public.special_offers
    FOR INSERT WITH CHECK (true);

-- Create policy for public update (No auth check)
CREATE POLICY "Enable update for all users" ON public.special_offers
    FOR UPDATE USING (true);

-- Create policy for public delete (No auth check)
CREATE POLICY "Enable delete for all users" ON public.special_offers
    FOR DELETE USING (true);


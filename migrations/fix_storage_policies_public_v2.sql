-- Enable RLS on storage.objects (Only run if you have permissions, otherwise skip)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public read access (view images)
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'images' );

-- Allow public upload access (upload images without auth)
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'images' );

-- Allow public update access
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
CREATE POLICY "Public Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'images' );

-- Allow public delete access
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;
CREATE POLICY "Public Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'images' );


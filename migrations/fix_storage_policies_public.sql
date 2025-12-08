-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public read access (view images)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'images' );

-- Allow public upload access (upload images without auth)
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'images' );

-- Allow public update access
CREATE POLICY "Public Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'images' );

-- Allow public delete access
CREATE POLICY "Public Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'images' );


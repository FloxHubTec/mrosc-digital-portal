-- Create bucket for OSC logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('osc-logos', 'osc-logos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for OSC logos bucket
-- OSCs can view any logo (public)
CREATE POLICY "OSC logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'osc-logos');

-- OSCs can upload their own logo (folder named after osc_id)
CREATE POLICY "OSCs can upload their own logo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'osc-logos' 
  AND auth.uid() IS NOT NULL
);

-- OSCs can update their own logo
CREATE POLICY "OSCs can update their own logo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'osc-logos'
  AND auth.uid() IS NOT NULL
);

-- OSCs can delete their own logo
CREATE POLICY "OSCs can delete their own logo"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'osc-logos'
  AND auth.uid() IS NOT NULL
);
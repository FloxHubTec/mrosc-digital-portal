-- Add soft delete columns to partnerships and oscs
ALTER TABLE public.partnerships 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

ALTER TABLE public.oscs 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create app_settings table for storing application-wide settings
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read app_settings
CREATE POLICY "Anyone can read app_settings" 
ON public.app_settings 
FOR SELECT 
USING (true);

-- Only admin can update app_settings
CREATE POLICY "Admin can manage app_settings" 
ON public.app_settings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin_master', 'superadmin')
  )
);

-- Create index for soft delete queries
CREATE INDEX IF NOT EXISTS idx_partnerships_deleted_at ON public.partnerships(deleted_at);
CREATE INDEX IF NOT EXISTS idx_oscs_deleted_at ON public.oscs(deleted_at);

-- Enable realtime for communications
ALTER PUBLICATION supabase_realtime ADD TABLE public.communications;

-- Add trigger for updated_at on app_settings
CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
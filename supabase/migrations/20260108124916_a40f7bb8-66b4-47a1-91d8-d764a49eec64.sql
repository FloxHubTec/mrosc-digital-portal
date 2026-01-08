-- Fix OSC unrestricted write access
-- Remove permissive policy and add restrictive policies

DROP POLICY IF EXISTS "Autenticados podem gerenciar OSCs" ON public.oscs;
DROP POLICY IF EXISTS "OSC members can update own OSC" ON public.oscs;
DROP POLICY IF EXISTS "Only admins can create OSCs" ON public.oscs;
DROP POLICY IF EXISTS "Only admins can delete OSCs" ON public.oscs;

-- OSC members can update their own OSC, admins can update any
CREATE POLICY "OSC members can update own OSC"
ON public.oscs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.osc_id = oscs.id
  )
  OR public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.osc_id = oscs.id
  )
  OR public.has_role(auth.uid(), 'admin')
);

-- Only admins can create new OSCs
CREATE POLICY "Only admins can create OSCs"
ON public.oscs
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete OSCs
CREATE POLICY "Only admins can delete OSCs"
ON public.oscs
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));
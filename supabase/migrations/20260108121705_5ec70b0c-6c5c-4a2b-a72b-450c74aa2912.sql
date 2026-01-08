-- Remover política antiga de SELECT nos support_tickets
DROP POLICY IF EXISTS "Usuários podem ver próprios tickets" ON public.support_tickets;

-- Criar nova política de SELECT restritiva
CREATE POLICY "Usuários veem próprios tickets ou admins veem todos"
ON public.support_tickets
FOR SELECT
USING (
  auth.uid() = user_id 
  OR public.has_role(auth.uid(), 'admin')
);
-- 1. Criar enum de roles se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END $$;

-- 2. Criar tabela user_roles se não existir
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- 3. Habilitar RLS na tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Criar função has_role com SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. Políticas para user_roles
CREATE POLICY "Usuários podem ver seus próprios roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Apenas admins podem gerenciar roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Remover política antiga de SELECT na profiles
DROP POLICY IF EXISTS "Profiles são visíveis para usuários autenticados" ON public.profiles;

-- 7. Criar nova política de SELECT restritiva para profiles
CREATE POLICY "Usuários veem próprio perfil ou admins veem todos"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id 
  OR public.has_role(auth.uid(), 'admin')
);
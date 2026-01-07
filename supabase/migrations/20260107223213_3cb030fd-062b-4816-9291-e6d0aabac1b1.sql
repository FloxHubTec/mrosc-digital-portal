-- ================================================
-- MROSC Digital - Configuração Completa do Banco
-- ================================================

-- 1. Atualizar tabela profiles para referenciar auth.users corretamente
-- Adicionar campos necessários para o sistema
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2. Criar trigger para criação automática de perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data ->> 'role', 'Usuário OSC')
  );
  RETURN new;
END;
$$;

-- Criar trigger (drop primeiro se existir)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================
-- 4. HABILITAR RLS EM TODAS AS TABELAS
-- ================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oscs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ================================================
-- 5. POLICIES PARA PROFILES
-- ================================================

-- Qualquer usuário autenticado pode ver perfis (para listagens)
CREATE POLICY "Profiles são visíveis para usuários autenticados"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Usuário pode atualizar próprio perfil
CREATE POLICY "Usuários podem atualizar próprio perfil"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ================================================
-- 6. POLICIES PARA OSCs
-- ================================================

-- OSCs são públicas para leitura (transparência)
CREATE POLICY "OSCs são públicas para leitura"
ON public.oscs FOR SELECT
TO anon, authenticated
USING (true);

-- Apenas autenticados podem inserir/atualizar OSCs
CREATE POLICY "Autenticados podem gerenciar OSCs"
ON public.oscs FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ================================================
-- 7. POLICIES PARA PUBLIC_CALLS (Chamamentos)
-- ================================================

-- Chamamentos públicos são visíveis para todos
CREATE POLICY "Chamamentos públicos são visíveis"
ON public.public_calls FOR SELECT
TO anon, authenticated
USING (true);

-- Apenas autenticados podem gerenciar chamamentos
CREATE POLICY "Autenticados podem gerenciar chamamentos"
ON public.public_calls FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ================================================
-- 8. POLICIES PARA PARTNERSHIPS
-- ================================================

-- Parcerias são públicas para leitura (transparência Art. 38)
CREATE POLICY "Parcerias são públicas para leitura"
ON public.partnerships FOR SELECT
TO anon, authenticated
USING (true);

-- Autenticados podem gerenciar parcerias
CREATE POLICY "Autenticados podem gerenciar parcerias"
ON public.partnerships FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ================================================
-- 9. POLICIES PARA TRANSACTIONS
-- ================================================

-- Transações são visíveis para autenticados
CREATE POLICY "Transações visíveis para autenticados"
ON public.transactions FOR SELECT
TO authenticated
USING (true);

-- Autenticados podem gerenciar transações
CREATE POLICY "Autenticados podem gerenciar transações"
ON public.transactions FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ================================================
-- 10. POLICIES PARA AUDIT_LOGS
-- ================================================

-- Logs são apenas leitura para autenticados
CREATE POLICY "Logs são visíveis para autenticados"
ON public.audit_logs FOR SELECT
TO authenticated
USING (true);

-- Apenas sistema pode inserir logs (via service role)
CREATE POLICY "Sistema pode inserir logs"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- ================================================
-- 11. STORAGE BUCKET PARA DOCUMENTOS
-- ================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents', 
  'documents', 
  false,
  52428800, -- 50MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
CREATE POLICY "Autenticados podem fazer upload de documentos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Autenticados podem ver documentos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Autenticados podem atualizar próprios documentos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents');

-- ================================================
-- 12. TABELA DE EMENDAS PARLAMENTARES
-- ================================================

CREATE TABLE IF NOT EXISTS public.amendments (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  numero TEXT NOT NULL,
  autor TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  ano INTEGER NOT NULL,
  descricao TEXT,
  tipo TEXT DEFAULT 'Impositiva' CHECK (tipo IN ('Impositiva', 'Ordinária')),
  tipo_indicacao TEXT DEFAULT 'Direta' CHECK (tipo_indicacao IN ('Direta', 'Indireta')),
  prazo_legal DATE,
  status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Vinculada', 'Executada')),
  osc_beneficiaria_id UUID REFERENCES public.oscs(id),
  partnership_id UUID REFERENCES public.partnerships(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.amendments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Emendas são públicas para leitura"
ON public.amendments FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Autenticados podem gerenciar emendas"
ON public.amendments FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ================================================
-- 13. TABELA DE COMUNICAÇÕES
-- ================================================

CREATE TABLE IF NOT EXISTS public.communications (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  sender_id UUID NOT NULL,
  recipient_id UUID,
  recipient_osc_id UUID REFERENCES public.oscs(id),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'notification' CHECK (type IN ('notification', 'message', 'alert', 'request')),
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  partnership_id UUID REFERENCES public.partnerships(id),
  send_email BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas comunicações"
ON public.communications FOR SELECT
TO authenticated
USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Usuários podem enviar comunicações"
ON public.communications FOR INSERT
TO authenticated
WITH CHECK (sender_id = auth.uid());

-- ================================================
-- 14. TABELA DE PLANOS DE TRABALHO
-- ================================================

CREATE TABLE IF NOT EXISTS public.work_plans (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  partnership_id UUID REFERENCES public.partnerships(id),
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'enviado', 'em_analise', 'aprovado', 'reprovado', 'ajuste_solicitado')),
  objetivos TEXT,
  justificativa TEXT,
  metas JSONB DEFAULT '[]'::jsonb,
  cronograma JSONB DEFAULT '[]'::jsonb,
  orcamento JSONB DEFAULT '[]'::jsonb,
  equipe JSONB DEFAULT '[]'::jsonb,
  observacoes TEXT,
  created_by UUID,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.work_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Planos visíveis para autenticados"
ON public.work_plans FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Autenticados podem gerenciar planos"
ON public.work_plans FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ================================================
-- 15. TABELA PMIS
-- ================================================

CREATE TABLE IF NOT EXISTS public.pmis (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  protocolo TEXT NOT NULL,
  osc_proponente_id UUID REFERENCES public.oscs(id),
  titulo TEXT NOT NULL,
  descricao TEXT,
  objetivo TEXT,
  area_atuacao TEXT,
  publico_alvo TEXT,
  justificativa TEXT,
  status TEXT DEFAULT 'recebido' CHECK (status IN ('recebido', 'em_analise', 'deferido', 'indeferido', 'arquivado')),
  parecer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.pmis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "PMIS visíveis para autenticados"
ON public.pmis FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Autenticados podem gerenciar PMIS"
ON public.pmis FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ================================================
-- 16. TABELA DE LEGISLAÇÃO E DOCUMENTOS
-- ================================================

CREATE TABLE IF NOT EXISTS public.legislation (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  titulo TEXT NOT NULL,
  tipo TEXT DEFAULT 'lei' CHECK (tipo IN ('lei', 'decreto', 'instrucao_normativa', 'manual', 'modelo', 'portaria')),
  numero TEXT,
  data_publicacao DATE,
  ementa TEXT,
  conteudo TEXT,
  arquivo_url TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.legislation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Legislação é pública"
ON public.legislation FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Autenticados podem gerenciar legislação"
ON public.legislation FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
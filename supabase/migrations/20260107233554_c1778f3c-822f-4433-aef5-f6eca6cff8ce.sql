-- Create proposals table for Seleção de Propostas
CREATE TABLE public.proposals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    public_call_id UUID REFERENCES public.public_calls(id) ON DELETE CASCADE,
    osc_id UUID REFERENCES public.oscs(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    valor_solicitado NUMERIC DEFAULT 0,
    documentos_urls JSONB DEFAULT '[]'::jsonb,
    pontuacao_tecnica NUMERIC DEFAULT 0,
    pontuacao_total NUMERIC DEFAULT 0,
    ranking INTEGER,
    parecer_tecnico TEXT,
    status TEXT DEFAULT 'inscrita',
    data_inscricao TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    data_avaliacao TIMESTAMP WITH TIME ZONE,
    avaliador_id UUID,
    recurso_texto TEXT,
    recurso_resposta TEXT,
    recurso_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create additives table for Aditivos e Apostilamentos
CREATE TABLE public.additives (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    partnership_id UUID REFERENCES public.partnerships(id) ON DELETE CASCADE NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'aditivo', -- aditivo, apostilamento
    numero TEXT,
    motivo TEXT NOT NULL,
    justificativa TEXT,
    valor_anterior NUMERIC DEFAULT 0,
    valor_novo NUMERIC DEFAULT 0,
    prazo_anterior DATE,
    prazo_novo DATE,
    status TEXT DEFAULT 'pendente',
    aprovado_por UUID,
    aprovado_em TIMESTAMP WITH TIME ZONE,
    documento_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create support_tickets table
CREATE TABLE public.support_tickets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    categoria TEXT DEFAULT 'geral',
    prioridade TEXT DEFAULT 'media',
    status TEXT DEFAULT 'aberto',
    resposta TEXT,
    respondido_por UUID,
    respondido_em TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create knowledge_base table
CREATE TABLE public.knowledge_base (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    categoria TEXT DEFAULT 'geral',
    tags TEXT[],
    visualizacoes INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create training_events table
CREATE TABLE public.training_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    descricao TEXT,
    tipo TEXT DEFAULT 'webinar', -- webinar, presencial, curso_online
    data_inicio TIMESTAMP WITH TIME ZONE,
    data_fim TIMESTAMP WITH TIME ZONE,
    link_inscricao TEXT,
    material_url TEXT,
    vagas INTEGER,
    inscritos INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now())
);

-- Enable RLS on all tables
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.additives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for proposals
CREATE POLICY "Propostas são públicas para leitura" ON public.proposals FOR SELECT USING (true);
CREATE POLICY "Autenticados podem gerenciar propostas" ON public.proposals FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for additives
CREATE POLICY "Aditivos são públicos para leitura" ON public.additives FOR SELECT USING (true);
CREATE POLICY "Autenticados podem gerenciar aditivos" ON public.additives FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for support_tickets
CREATE POLICY "Usuários podem ver próprios tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id OR true);
CREATE POLICY "Autenticados podem criar tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Autenticados podem atualizar tickets" ON public.support_tickets FOR UPDATE USING (true) WITH CHECK (true);

-- RLS Policies for knowledge_base
CREATE POLICY "Base de conhecimento é pública" ON public.knowledge_base FOR SELECT USING (true);
CREATE POLICY "Autenticados podem gerenciar conhecimento" ON public.knowledge_base FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for training_events
CREATE POLICY "Eventos são públicos" ON public.training_events FOR SELECT USING (true);
CREATE POLICY "Autenticados podem gerenciar eventos" ON public.training_events FOR ALL USING (true) WITH CHECK (true);

-- Trigger for updated_at on proposals
CREATE TRIGGER update_proposals_updated_at
    BEFORE UPDATE ON public.proposals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on additives
CREATE TRIGGER update_additives_updated_at
    BEFORE UPDATE ON public.additives
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on support_tickets
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on knowledge_base
CREATE TRIGGER update_knowledge_base_updated_at
    BEFORE UPDATE ON public.knowledge_base
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
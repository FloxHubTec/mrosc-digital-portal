import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SupportTicket {
  id: string;
  user_id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: string;
  status: string;
  resposta: string | null;
  respondido_por: string | null;
  respondido_em: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface KnowledgeArticle {
  id: string;
  titulo: string;
  conteudo: string;
  categoria: string;
  tags: string[] | null;
  visualizacoes: number;
  ativo: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface TrainingEvent {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: string;
  data_inicio: string | null;
  data_fim: string | null;
  link_inscricao: string | null;
  material_url: string | null;
  vagas: number | null;
  inscritos: number;
  ativo: boolean;
  created_at: string;
}

export const useSupport = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ticketsRes, articlesRes, eventsRes] = await Promise.all([
        supabase.from('support_tickets').select('*').order('created_at', { ascending: false }),
        supabase.from('knowledge_base').select('*').eq('ativo', true).order('visualizacoes', { ascending: false }),
        supabase.from('training_events').select('*').eq('ativo', true).order('data_inicio', { ascending: true }),
      ]);

      if (ticketsRes.error) throw ticketsRes.error;
      if (articlesRes.error) throw articlesRes.error;
      if (eventsRes.error) throw eventsRes.error;

      setTickets(ticketsRes.data || []);
      setArticles(articlesRes.data || []);
      setEvents(eventsRes.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Tickets
  const createTicket = async (ticket: {
    user_id: string;
    titulo: string;
    descricao: string;
    categoria?: string;
    prioridade?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert(ticket)
        .select()
        .single();

      if (error) throw error;
      await fetchAll();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const respondTicket = async (id: string, resposta: string, respondidoPor: string) => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .update({
          resposta,
          respondido_por: respondidoPor,
          respondido_em: new Date().toISOString(),
          status: 'respondido',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchAll();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const closeTicket = async (id: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: 'fechado' })
        .eq('id', id);

      if (error) throw error;
      await fetchAll();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Knowledge Base
  const createArticle = async (article: {
    titulo: string;
    conteudo: string;
    categoria?: string;
    tags?: string[];
  }) => {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .insert(article)
        .select()
        .single();

      if (error) throw error;
      await fetchAll();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const incrementViews = async (id: string) => {
    const article = articles.find(a => a.id === id);
    if (article) {
      await supabase
        .from('knowledge_base')
        .update({ visualizacoes: article.visualizacoes + 1 })
        .eq('id', id);
    }
  };

  // Training Events
  const createEvent = async (event: {
    titulo: string;
    descricao?: string;
    tipo?: string;
    data_inicio?: string;
    data_fim?: string;
    link_inscricao?: string;
    material_url?: string;
    vagas?: number;
  }) => {
    try {
      const { data, error } = await supabase
        .from('training_events')
        .insert(event)
        .select()
        .single();

      if (error) throw error;
      await fetchAll();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const inscribeEvent = async (id: string) => {
    const event = events.find(e => e.id === id);
    if (event && (!event.vagas || event.inscritos < event.vagas)) {
      await supabase
        .from('training_events')
        .update({ inscritos: event.inscritos + 1 })
        .eq('id', id);
      await fetchAll();
    }
  };

  // Stats
  const getTicketStats = () => ({
    aberto: tickets.filter(t => t.status === 'aberto').length,
    respondido: tickets.filter(t => t.status === 'respondido').length,
    fechado: tickets.filter(t => t.status === 'fechado').length,
    total: tickets.length,
  });

  const searchArticles = (term: string) => {
    if (!term) return articles;
    const lower = term.toLowerCase();
    return articles.filter(a =>
      a.titulo.toLowerCase().includes(lower) ||
      a.conteudo.toLowerCase().includes(lower) ||
      a.tags?.some(t => t.toLowerCase().includes(lower))
    );
  };

  return {
    tickets,
    articles,
    events,
    loading,
    error,
    refetch: fetchAll,
    createTicket,
    respondTicket,
    closeTicket,
    createArticle,
    incrementViews,
    createEvent,
    inscribeEvent,
    getTicketStats,
    searchArticles,
  };
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Proposal {
  id: string;
  public_call_id: string | null;
  osc_id: string | null;
  titulo: string;
  descricao: string | null;
  valor_solicitado: number;
  documentos_urls: string[];
  pontuacao_tecnica: number;
  pontuacao_total: number;
  ranking: number | null;
  parecer_tecnico: string | null;
  status: string;
  data_inscricao: string;
  data_avaliacao: string | null;
  avaliador_id: string | null;
  recurso_texto: string | null;
  recurso_resposta: string | null;
  recurso_status: string | null;
  created_at: string;
  updated_at: string | null;
  // Joined data
  osc?: { razao_social: string; cnpj: string };
  public_call?: { numero_edital: string; objeto: string };
}

export const useProposals = (publicCallId?: string) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('proposals')
        .select(`
          *,
          osc:oscs(razao_social, cnpj),
          public_call:public_calls(numero_edital, objeto)
        `)
        .order('ranking', { ascending: true, nullsFirst: false });

      if (publicCallId) {
        query = query.eq('public_call_id', publicCallId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProposals((data || []) as unknown as Proposal[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [publicCallId]);

  const createProposal = async (proposal: {
    public_call_id: string;
    osc_id: string;
    titulo: string;
    descricao?: string;
    valor_solicitado?: number;
    documentos_urls?: string[];
  }) => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .insert(proposal)
        .select()
        .single();

      if (error) throw error;
      await fetchProposals();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const updateProposal = async (id: string, updates: Partial<Proposal>) => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchProposals();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const evaluateProposal = async (id: string, pontuacao: number, parecer: string) => {
    return updateProposal(id, {
      pontuacao_tecnica: pontuacao,
      pontuacao_total: pontuacao,
      parecer_tecnico: parecer,
      status: 'avaliada',
      data_avaliacao: new Date().toISOString(),
    });
  };

  const submitRecurso = async (id: string, texto: string) => {
    return updateProposal(id, {
      recurso_texto: texto,
      recurso_status: 'pendente',
    });
  };

  const respondRecurso = async (id: string, resposta: string, deferido: boolean) => {
    return updateProposal(id, {
      recurso_resposta: resposta,
      recurso_status: deferido ? 'deferido' : 'indeferido',
    });
  };

  const calculateRankings = async (publicCallId: string) => {
    const callProposals = proposals
      .filter(p => p.public_call_id === publicCallId && p.status !== 'desclassificada')
      .sort((a, b) => b.pontuacao_total - a.pontuacao_total);

    for (let i = 0; i < callProposals.length; i++) {
      await updateProposal(callProposals[i].id, { ranking: i + 1 });
    }
    await fetchProposals();
  };

  const getStatsByStatus = () => {
    const stats = {
      inscrita: 0,
      habilitada: 0,
      inabilitada: 0,
      avaliada: 0,
      selecionada: 0,
      desclassificada: 0,
      total: proposals.length,
    };

    proposals.forEach(p => {
      const status = p.status as keyof typeof stats;
      if (status in stats) stats[status]++;
    });

    return stats;
  };

  return {
    proposals,
    loading,
    error,
    refetch: fetchProposals,
    createProposal,
    updateProposal,
    evaluateProposal,
    submitRecurso,
    respondRecurso,
    calculateRankings,
    getStatsByStatus,
  };
};

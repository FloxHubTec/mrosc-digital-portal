import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Additive {
  id: string;
  partnership_id: string;
  tipo: string;
  numero: string | null;
  motivo: string;
  justificativa: string | null;
  valor_anterior: number;
  valor_novo: number;
  prazo_anterior: string | null;
  prazo_novo: string | null;
  status: string;
  aprovado_por: string | null;
  aprovado_em: string | null;
  documento_url: string | null;
  created_at: string;
  updated_at: string | null;
  // Joined data
  partnership?: {
    numero_termo: string;
    osc: { razao_social: string };
  };
}

export const useAdditives = (partnershipId?: string) => {
  const [additives, setAdditives] = useState<Additive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdditives = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('additives')
        .select(`
          *,
          partnership:partnerships(numero_termo, osc:oscs(razao_social))
        `)
        .order('created_at', { ascending: false });

      if (partnershipId) {
        query = query.eq('partnership_id', partnershipId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAdditives((data || []) as unknown as Additive[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdditives();
  }, [partnershipId]);

  const createAdditive = async (additive: {
    partnership_id: string;
    tipo: string;
    motivo: string;
    justificativa?: string;
    valor_anterior?: number;
    valor_novo?: number;
    prazo_anterior?: string;
    prazo_novo?: string;
  }) => {
    try {
      // Generate numero
      const year = new Date().getFullYear();
      const count = additives.filter(a => a.created_at.startsWith(year.toString())).length + 1;
      const numero = `${String(count).padStart(3, '0')}/${year}`;

      const { data, error } = await supabase
        .from('additives')
        .insert({ ...additive, numero })
        .select()
        .single();

      if (error) throw error;
      await fetchAdditives();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const updateAdditive = async (id: string, updates: Partial<Additive>) => {
    try {
      const { data, error } = await supabase
        .from('additives')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchAdditives();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const approveAdditive = async (id: string, userId: string) => {
    return updateAdditive(id, {
      status: 'aprovado',
      aprovado_por: userId,
      aprovado_em: new Date().toISOString(),
    });
  };

  const rejectAdditive = async (id: string) => {
    return updateAdditive(id, { status: 'rejeitado' });
  };

  const getStatsByType = () => {
    const stats = {
      aditivo: 0,
      apostilamento: 0,
      pendente: 0,
      aprovado: 0,
      rejeitado: 0,
      total: additives.length,
    };

    additives.forEach(a => {
      if (a.tipo === 'aditivo') stats.aditivo++;
      if (a.tipo === 'apostilamento') stats.apostilamento++;
      if (a.status === 'pendente') stats.pendente++;
      if (a.status === 'aprovado') stats.aprovado++;
      if (a.status === 'rejeitado') stats.rejeitado++;
    });

    return stats;
  };

  const getValueImpact = () => {
    return additives.reduce((acc, a) => {
      return acc + (a.valor_novo - a.valor_anterior);
    }, 0);
  };

  return {
    additives,
    loading,
    error,
    refetch: fetchAdditives,
    createAdditive,
    updateAdditive,
    approveAdditive,
    rejectAdditive,
    getStatsByType,
    getValueImpact,
  };
};

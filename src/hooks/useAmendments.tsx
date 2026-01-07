import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Amendment {
  id: string;
  numero: string;
  autor: string;
  valor: number;
  ano: number;
  descricao: string | null;
  tipo: string | null;
  tipo_indicacao: string | null;
  prazo_legal: string | null;
  status: string | null;
  partnership_id: string | null;
  osc_beneficiaria_id: string | null;
  created_at: string;
  updated_at: string | null;
  osc?: {
    id: string;
    razao_social: string;
    cnpj: string;
  } | null;
  partnership?: {
    id: string;
    numero_termo: string | null;
  } | null;
}

export const useAmendments = () => {
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAmendments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('amendments')
        .select(`
          *,
          osc:oscs!osc_beneficiaria_id(id, razao_social, cnpj),
          partnership:partnerships!partnership_id(id, numero_termo)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAmendments((data as Amendment[]) || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmendments();
  }, []);

  const createAmendment = async (amendment: {
    numero: string;
    autor: string;
    valor: number;
    ano: number;
    descricao?: string;
    tipo?: string;
    tipo_indicacao?: string;
    prazo_legal?: string;
    status?: string;
    osc_beneficiaria_id?: string;
    partnership_id?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('amendments')
        .insert(amendment)
        .select()
        .single();

      if (error) throw error;
      await fetchAmendments();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const updateAmendment = async (id: string, updates: Partial<Amendment>) => {
    try {
      const { data, error } = await supabase
        .from('amendments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchAmendments();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const deleteAmendment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('amendments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchAmendments();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const getStats = () => {
    const totalAlocado = amendments.reduce((sum, a) => sum + (a.valor || 0), 0);
    const indiretas = amendments.filter(a => a.tipo_indicacao === 'Indireta').length;
    const executadas = amendments.filter(a => a.status === 'Executada').length;
    const pendentes = amendments.filter(a => a.status === 'Pendente').length;
    const vinculadas = amendments.filter(a => a.status === 'Vinculada').length;
    
    const prazosProximos = amendments.filter(a => {
      if (!a.prazo_legal) return false;
      const prazo = new Date(a.prazo_legal);
      const hoje = new Date();
      const diff = Math.ceil((prazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      return diff <= 30 && diff > 0;
    }).length;

    return { totalAlocado, indiretas, executadas, pendentes, vinculadas, prazosProximos };
  };

  return {
    amendments,
    loading,
    error,
    refetch: fetchAmendments,
    createAmendment,
    updateAmendment,
    deleteAmendment,
    getStats,
  };
};

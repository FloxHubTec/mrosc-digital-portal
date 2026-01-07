import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Legislation {
  id: string;
  titulo: string;
  numero: string | null;
  tipo: string | null;
  ementa: string | null;
  conteudo: string | null;
  data_publicacao: string | null;
  arquivo_url: string | null;
  ativo: boolean | null;
  created_at: string;
}

export const useLegislation = () => {
  const [legislation, setLegislation] = useState<Legislation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLegislation = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('legislation')
        .select('*')
        .eq('ativo', true)
        .order('data_publicacao', { ascending: false });

      if (error) throw error;
      setLegislation(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLegislation();
  }, []);

  const createLegislation = async (leg: {
    titulo: string;
    numero?: string;
    tipo?: string;
    ementa?: string;
    conteudo?: string;
    data_publicacao?: string;
    arquivo_url?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('legislation')
        .insert(leg)
        .select()
        .single();

      if (error) throw error;
      await fetchLegislation();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const updateLegislation = async (id: string, updates: Partial<Legislation>) => {
    try {
      const { data, error } = await supabase
        .from('legislation')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchLegislation();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const searchLegislation = (term: string) => {
    setSearchTerm(term);
  };

  const filteredLegislation = legislation.filter(leg => {
    if (!searchTerm) return true;
    const lowerTerm = searchTerm.toLowerCase();
    return (
      leg.titulo.toLowerCase().includes(lowerTerm) ||
      leg.numero?.toLowerCase().includes(lowerTerm) ||
      leg.ementa?.toLowerCase().includes(lowerTerm) ||
      leg.conteudo?.toLowerCase().includes(lowerTerm)
    );
  });

  const getCategorizedLegislation = () => {
    const categories: Record<string, Legislation[]> = {
      'Federal': [],
      'Municipal': [],
      'Decreto': [],
      'Portaria': [],
      'Modelo': [],
      'Manual': [],
      'Outros': [],
    };

    filteredLegislation.forEach(leg => {
      const tipo = leg.tipo?.toLowerCase() || 'outros';
      if (tipo.includes('federal')) categories['Federal'].push(leg);
      else if (tipo.includes('municipal')) categories['Municipal'].push(leg);
      else if (tipo.includes('decreto')) categories['Decreto'].push(leg);
      else if (tipo.includes('portaria')) categories['Portaria'].push(leg);
      else if (tipo.includes('modelo')) categories['Modelo'].push(leg);
      else if (tipo.includes('manual')) categories['Manual'].push(leg);
      else categories['Outros'].push(leg);
    });

    return categories;
  };

  return {
    legislation: filteredLegislation,
    allLegislation: legislation,
    loading,
    error,
    searchTerm,
    searchLegislation,
    refetch: fetchLegislation,
    createLegislation,
    updateLegislation,
    getCategorizedLegislation,
  };
};

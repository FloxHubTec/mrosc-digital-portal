import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Partnership {
  id: string;
  osc_id: string;
  numero_termo: string | null;
  tipo_origem: string | null;
  status: string | null;
  valor_repassado: number | null;
  vigencia_inicio: string | null;
  vigencia_fim: string | null;
  public_call_id: string | null;
  created_at: string;
  deleted_at?: string | null;
  // Joined data
  osc?: {
    razao_social: string;
    cnpj: string;
    logo_url: string | null;
  };
  public_call?: {
    numero_edital: string;
    objeto: string;
  };
}

export function usePartnerships(filterByUserOsc: boolean = false) {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchPartnerships = async () => {
    setLoading(true);
    setError(null);
    
    let query = supabase
      .from('partnerships')
      .select(`
        *,
        osc:oscs(razao_social, cnpj, logo_url),
        public_call:public_calls(numero_edital, objeto)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    // If filtering by user's OSC (for OSC users)
    if (filterByUserOsc && profile?.osc_id) {
      query = query.eq('osc_id', profile.osc_id);
    }
    
    const { data, error } = await query;
    
    if (error) {
      setError(error.message);
      console.error('Error fetching partnerships:', error);
    } else {
      setPartnerships(data || []);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchPartnerships();
  }, [filterByUserOsc, profile?.osc_id]);

  const createPartnership = async (partnership: {
    osc_id: string;
    numero_termo?: string;
    tipo_origem?: string;
    status?: string;
    valor_repassado?: number;
    vigencia_inicio?: string;
    vigencia_fim?: string;
    public_call_id?: string;
  }) => {
    const { data, error } = await supabase
      .from('partnerships')
      .insert([partnership])
      .select(`
        *,
        osc:oscs(razao_social, cnpj, logo_url),
        public_call:public_calls(numero_edital, objeto)
      `)
      .single();
    
    if (error) {
      console.error('Error creating partnership:', error);
      return { error };
    }
    
    setPartnerships(prev => [data, ...prev]);
    return { data, error: null };
  };

  const updatePartnership = async (id: string, updates: Partial<Partnership>) => {
    const { data, error } = await supabase
      .from('partnerships')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        osc:oscs(razao_social, cnpj, logo_url),
        public_call:public_calls(numero_edital, objeto)
      `)
      .single();
    
    if (error) {
      console.error('Error updating partnership:', error);
      return { error };
    }
    
    setPartnerships(prev => prev.map(p => p.id === id ? data : p));
    return { data, error: null };
  };

  // Soft delete - sets deleted_at instead of actually deleting
  const deletePartnership = async (id: string) => {
    const { error } = await supabase
      .from('partnerships')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting partnership:', error);
      return { error };
    }
    
    setPartnerships(prev => prev.filter(p => p.id !== id));
    return { error: null };
  };

  return {
    partnerships,
    loading,
    error,
    refetch: fetchPartnerships,
    createPartnership,
    updatePartnership,
    deletePartnership,
  };
}

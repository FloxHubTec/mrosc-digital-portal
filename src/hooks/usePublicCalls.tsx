import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PublicCall {
  id: string;
  numero_edital: string;
  objeto: string;
  status: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  valor_total: number | null;
  pdf_url: string | null;
  created_at: string;
}

export function usePublicCalls() {
  const [publicCalls, setPublicCalls] = useState<PublicCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicCalls = async () => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('public_calls')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      setError(error.message);
      console.error('Error fetching public calls:', error);
    } else {
      setPublicCalls(data || []);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchPublicCalls();
  }, []);

  const createPublicCall = async (publicCall: Omit<PublicCall, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('public_calls')
      .insert([publicCall])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating public call:', error);
      return { error };
    }
    
    setPublicCalls(prev => [data, ...prev]);
    return { data, error: null };
  };

  const updatePublicCall = async (id: string, updates: Partial<PublicCall>) => {
    const { data, error } = await supabase
      .from('public_calls')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating public call:', error);
      return { error };
    }
    
    setPublicCalls(prev => prev.map(c => c.id === id ? data : c));
    return { data, error: null };
  };

  const deletePublicCall = async (id: string) => {
    const { error } = await supabase
      .from('public_calls')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting public call:', error);
      return { error };
    }
    
    setPublicCalls(prev => prev.filter(c => c.id !== id));
    return { error: null };
  };

  return {
    publicCalls,
    loading,
    error,
    refetch: fetchPublicCalls,
    createPublicCall,
    updatePublicCall,
    deletePublicCall,
  };
}

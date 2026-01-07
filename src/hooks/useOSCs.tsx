import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface OSC {
  id: string;
  cnpj: string;
  razao_social: string;
  status_cnd: string | null;
  validade_cnd: string | null;
  logo_url: string | null;
  created_at: string;
}

export function useOSCs() {
  const [oscs, setOscs] = useState<OSC[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchOSCs = async () => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('oscs')
      .select('*')
      .order('razao_social', { ascending: true });
    
    if (error) {
      setError(error.message);
      console.error('Error fetching OSCs:', error);
    } else {
      setOscs(data || []);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchOSCs();
  }, []);

  const createOSC = async (osc: Omit<OSC, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('oscs')
      .insert([osc])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating OSC:', error);
      return { error };
    }
    
    setOscs(prev => [...prev, data]);
    return { data, error: null };
  };

  const updateOSC = async (id: string, updates: Partial<OSC>) => {
    const { data, error } = await supabase
      .from('oscs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating OSC:', error);
      return { error };
    }
    
    setOscs(prev => prev.map(o => o.id === id ? data : o));
    return { data, error: null };
  };

  const deleteOSC = async (id: string) => {
    const { error } = await supabase
      .from('oscs')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting OSC:', error);
      return { error };
    }
    
    setOscs(prev => prev.filter(o => o.id !== id));
    return { error: null };
  };

  return {
    oscs,
    loading,
    error,
    refetch: fetchOSCs,
    createOSC,
    updateOSC,
    deleteOSC,
  };
}

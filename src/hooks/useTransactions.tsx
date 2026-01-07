import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Transaction {
  id: string;
  partnership_id: string;
  data_transacao: string;
  valor: number;
  tipo: string | null;
  categoria: string | null;
  fornecedor: string | null;
  url_comprovante: string;
  status_conciliacao: string | null;
  justificativa_glosa: string | null;
  created_at: string;
}

export function useTransactions(partnershipId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    
    let query = supabase
      .from('transactions')
      .select('*')
      .order('data_transacao', { ascending: false });
    
    if (partnershipId) {
      query = query.eq('partnership_id', partnershipId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      setError(error.message);
      console.error('Error fetching transactions:', error);
    } else {
      setTransactions(data || []);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, [partnershipId]);

  const createTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating transaction:', error);
      return { error };
    }
    
    setTransactions(prev => [data, ...prev]);
    return { data, error: null };
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating transaction:', error);
      return { error };
    }
    
    setTransactions(prev => prev.map(t => t.id === id ? data : t));
    return { data, error: null };
  };

  const approveTransaction = async (id: string) => {
    return updateTransaction(id, { status_conciliacao: 'aprovado' });
  };

  const rejectTransaction = async (id: string, justificativa: string) => {
    return updateTransaction(id, { 
      status_conciliacao: 'glosado',
      justificativa_glosa: justificativa 
    });
  };

  // Totals calculation
  const totals = transactions.reduce((acc, t) => {
    if (t.tipo === 'receita') {
      acc.receitas += t.valor;
    } else if (t.tipo === 'despesa') {
      acc.despesas += t.valor;
    }
    return acc;
  }, { receitas: 0, despesas: 0, saldo: 0 });
  
  totals.saldo = totals.receitas - totals.despesas;

  return {
    transactions,
    loading,
    error,
    totals,
    refetch: fetchTransactions,
    createTransaction,
    updateTransaction,
    approveTransaction,
    rejectTransaction,
  };
}

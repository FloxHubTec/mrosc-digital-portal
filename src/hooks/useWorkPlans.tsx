import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface WorkPlanMeta {
  id: string;
  descricao: string;
  indicador: string;
  meta_quantidade: number;
  valor_unitario: number;
}

export interface WorkPlanCronograma {
  id: string;
  mes: number;
  atividade: string;
  responsavel: string;
}

export interface WorkPlanOrcamento {
  id: string;
  categoria: string;
  descricao: string;
  valor: number;
}

export interface WorkPlanEquipe {
  id: string;
  nome: string;
  cargo: string;
  carga_horaria: number;
}

export interface WorkPlan {
  id: string;
  partnership_id: string | null;
  objetivos: string | null;
  justificativa: string | null;
  observacoes: string | null;
  metas: WorkPlanMeta[];
  cronograma: WorkPlanCronograma[];
  orcamento: WorkPlanOrcamento[];
  equipe: WorkPlanEquipe[];
  status: string | null;
  version: number | null;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string | null;
}

const parseJsonArray = <T,>(json: Json | null, defaultValue: T[] = []): T[] => {
  if (!json) return defaultValue;
  if (Array.isArray(json)) return json as unknown as T[];
  return defaultValue;
};

export function useWorkPlans(partnershipId?: string) {
  const [workPlan, setWorkPlan] = useState<WorkPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkPlan = async () => {
    if (!partnershipId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('work_plans')
      .select('*')
      .eq('partnership_id', partnershipId)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      setError(error.message);
      console.error('Error fetching work plan:', error);
    } else if (data) {
      setWorkPlan({
        ...data,
        metas: parseJsonArray<WorkPlanMeta>(data.metas),
        cronograma: parseJsonArray<WorkPlanCronograma>(data.cronograma),
        orcamento: parseJsonArray<WorkPlanOrcamento>(data.orcamento),
        equipe: parseJsonArray<WorkPlanEquipe>(data.equipe),
      });
    } else {
      setWorkPlan(null);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkPlan();
  }, [partnershipId]);

  const createWorkPlan = async (workPlanData: {
    partnership_id: string;
    objetivos?: string;
    justificativa?: string;
    observacoes?: string;
    metas?: WorkPlanMeta[];
    cronograma?: WorkPlanCronograma[];
    orcamento?: WorkPlanOrcamento[];
    equipe?: WorkPlanEquipe[];
    status?: string;
  }) => {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('work_plans')
      .insert([{
        partnership_id: workPlanData.partnership_id,
        objetivos: workPlanData.objetivos,
        justificativa: workPlanData.justificativa,
        observacoes: workPlanData.observacoes,
        metas: (workPlanData.metas || []) as unknown as Json,
        cronograma: (workPlanData.cronograma || []) as unknown as Json,
        orcamento: (workPlanData.orcamento || []) as unknown as Json,
        equipe: (workPlanData.equipe || []) as unknown as Json,
        status: workPlanData.status || 'rascunho',
        created_by: userData.user?.id,
        version: 1,
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating work plan:', error);
      return { error };
    }
    
    setWorkPlan({
      ...data,
      metas: parseJsonArray<WorkPlanMeta>(data.metas),
      cronograma: parseJsonArray<WorkPlanCronograma>(data.cronograma),
      orcamento: parseJsonArray<WorkPlanOrcamento>(data.orcamento),
      equipe: parseJsonArray<WorkPlanEquipe>(data.equipe),
    });
    
    return { data, error: null };
  };

  const updateWorkPlan = async (id: string, updates: {
    objetivos?: string;
    justificativa?: string;
    observacoes?: string;
    metas?: WorkPlanMeta[];
    cronograma?: WorkPlanCronograma[];
    orcamento?: WorkPlanOrcamento[];
    equipe?: WorkPlanEquipe[];
    status?: string;
    approved_by?: string;
    approved_at?: string;
  }) => {
    const updateData: Record<string, unknown> = {};
    
    if (updates.objetivos !== undefined) updateData.objetivos = updates.objetivos;
    if (updates.justificativa !== undefined) updateData.justificativa = updates.justificativa;
    if (updates.observacoes !== undefined) updateData.observacoes = updates.observacoes;
    if (updates.metas !== undefined) updateData.metas = updates.metas as unknown as Json;
    if (updates.cronograma !== undefined) updateData.cronograma = updates.cronograma as unknown as Json;
    if (updates.orcamento !== undefined) updateData.orcamento = updates.orcamento as unknown as Json;
    if (updates.equipe !== undefined) updateData.equipe = updates.equipe as unknown as Json;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.approved_by !== undefined) updateData.approved_by = updates.approved_by;
    if (updates.approved_at !== undefined) updateData.approved_at = updates.approved_at;
    
    const { data, error } = await supabase
      .from('work_plans')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating work plan:', error);
      return { error };
    }
    
    setWorkPlan({
      ...data,
      metas: parseJsonArray<WorkPlanMeta>(data.metas),
      cronograma: parseJsonArray<WorkPlanCronograma>(data.cronograma),
      orcamento: parseJsonArray<WorkPlanOrcamento>(data.orcamento),
      equipe: parseJsonArray<WorkPlanEquipe>(data.equipe),
    });
    
    return { data, error: null };
  };

  const submitForApproval = async (id: string) => {
    return updateWorkPlan(id, { status: 'enviado' });
  };

  const approveWorkPlan = async (id: string) => {
    const { data: userData } = await supabase.auth.getUser();
    
    return updateWorkPlan(id, { 
      status: 'aprovado',
      approved_by: userData.user?.id,
      approved_at: new Date().toISOString(),
    });
  };

  return {
    workPlan,
    loading,
    error,
    refetch: fetchWorkPlan,
    createWorkPlan,
    updateWorkPlan,
    submitForApproval,
    approveWorkPlan,
  };
}

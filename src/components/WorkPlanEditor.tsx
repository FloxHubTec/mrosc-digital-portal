import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ArrowLeft, Sparkles, CheckCircle, Loader2, Send, Calendar, DollarSign, Users } from 'lucide-react';
import { useWorkPlans, WorkPlanMeta, WorkPlanCronograma, WorkPlanOrcamento } from '@/hooks/useWorkPlans';
import { usePartnerships, Partnership } from '@/hooks/usePartnerships';
import { toast } from '@/hooks/use-toast';

interface WorkPlanEditorProps {
  onBack: () => void;
  partnershipId?: string;
  partnership?: Partnership;
}

const WorkPlanEditor: React.FC<WorkPlanEditorProps> = ({ onBack, partnershipId, partnership }) => {
  const { workPlan, loading, createWorkPlan, updateWorkPlan, submitForApproval } = useWorkPlans(partnershipId);
  const [activeStep, setActiveStep] = useState(1);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [objetivos, setObjetivos] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [metas, setMetas] = useState<WorkPlanMeta[]>([]);
  const [cronograma, setCronograma] = useState<WorkPlanCronograma[]>([]);
  const [orcamento, setOrcamento] = useState<WorkPlanOrcamento[]>([]);

  // Load existing work plan data
  useEffect(() => {
    if (workPlan) {
      setObjetivos(workPlan.objetivos || '');
      setJustificativa(workPlan.justificativa || '');
      setMetas(workPlan.metas || []);
      setCronograma(workPlan.cronograma || []);
      setOrcamento(workPlan.orcamento || []);
    }
  }, [workPlan]);

  const addMeta = () => {
    setMetas([...metas, {
      id: `meta-${Date.now()}`,
      descricao: '',
      indicador: '',
      meta_quantidade: 0,
      valor_unitario: 0,
    }]);
  };

  const updateMeta = (id: string, field: keyof WorkPlanMeta, value: string | number) => {
    setMetas(metas.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeMeta = (id: string) => {
    setMetas(metas.filter(m => m.id !== id));
  };

  const addCronograma = () => {
    setCronograma([...cronograma, {
      id: `cron-${Date.now()}`,
      mes: 1,
      atividade: '',
      responsavel: '',
    }]);
  };

  const updateCronograma = (id: string, field: keyof WorkPlanCronograma, value: string | number) => {
    setCronograma(cronograma.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeCronograma = (id: string) => {
    setCronograma(cronograma.filter(c => c.id !== id));
  };

  const addOrcamento = () => {
    setOrcamento([...orcamento, {
      id: `orc-${Date.now()}`,
      categoria: '',
      descricao: '',
      valor: 0,
    }]);
  };

  const updateOrcamento = (id: string, field: keyof WorkPlanOrcamento, value: string | number) => {
    setOrcamento(orcamento.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  const removeOrcamento = (id: string) => {
    setOrcamento(orcamento.filter(o => o.id !== id));
  };

  const handleSave = async (submit: boolean = false) => {
    if (!partnershipId) {
      toast({ title: "Erro", description: "Nenhuma parceria selecionada.", variant: "destructive" });
      return;
    }
    
    setSaving(true);
    
    const planData = {
      objetivos,
      justificativa,
      metas,
      cronograma,
      orcamento,
    };
    
    let result;
    
    if (workPlan) {
      result = await updateWorkPlan(workPlan.id, {
        ...planData,
        status: submit ? 'enviado' : 'rascunho',
      });
    } else {
      result = await createWorkPlan({
        partnership_id: partnershipId,
        ...planData,
        status: submit ? 'enviado' : 'rascunho',
      });
    }
    
    setSaving(false);
    
    if (result.error) {
      toast({ title: "Erro ao salvar", description: result.error.message, variant: "destructive" });
    } else {
      toast({ 
        title: submit ? "Plano enviado para aprovação!" : "Plano salvo como rascunho!", 
        description: submit ? "Aguarde a análise do gestor." : "Você pode continuar editando depois." 
      });
      if (submit) onBack();
    }
  };

  const getTotalOrcamento = () => {
    return orcamento.reduce((sum, o) => sum + (o.valor || 0), 0);
  };

  const getTotalMetas = () => {
    return metas.reduce((sum, m) => sum + (m.meta_quantidade * m.valor_unitario), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const steps = ['1. Identificação', '2. Objeto e Justificativa', '3. Metas e Indicadores', '4. Cronograma', '5. Orçamento'];

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-4 bg-card rounded-2xl border border-border text-primary hover:bg-primary/10 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tighter">
              {workPlan ? 'Editar Plano de Trabalho' : 'Novo Plano de Trabalho'}
            </h2>
            <p className="text-muted-foreground font-medium italic text-sm">
              {partnership?.osc?.razao_social || 'Parceria'} • {partnership?.numero_termo || 'Sem número'}
            </p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button 
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-6 py-3 bg-muted text-muted-foreground rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-muted/80 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Salvar Rascunho
          </button>
          <button 
            onClick={() => handleSave(true)}
            disabled={saving || metas.length === 0}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-black text-[10px] uppercase shadow-xl flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Enviar para Aprovação
          </button>
        </div>
      </header>

      {/* Status badge */}
      {workPlan && (
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase ${
            workPlan.status === 'aprovado' ? 'bg-success/10 text-success' :
            workPlan.status === 'enviado' ? 'bg-info/10 text-info' :
            workPlan.status === 'rejeitado' ? 'bg-destructive/10 text-destructive' :
            'bg-muted text-muted-foreground'
          }`}>
            Status: {workPlan.status || 'Rascunho'}
          </span>
          <span className="text-xs text-muted-foreground">Versão {workPlan.version}</span>
        </div>
      )}

      {/* Step tabs */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {steps.map((step, i) => (
          <div 
            key={i} 
            onClick={() => setActiveStep(i + 1)} 
            className={`shrink-0 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer transition-all border-2 ${
              activeStep === i + 1 
                ? 'bg-primary text-primary-foreground border-primary shadow-xl' 
                : 'bg-card text-muted-foreground border-border hover:border-primary/30'
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      <div className="bg-card rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-border p-8 md:p-12">
        
        {/* Step 1: Identificação */}
        {activeStep === 1 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h3 className="text-xl font-black text-foreground">Dados da Parceria</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">OSC Parceira</label>
                <div className="p-5 bg-muted rounded-2xl font-bold text-foreground">
                  {partnership?.osc?.razao_social || 'N/A'}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">CNPJ</label>
                <div className="p-5 bg-muted rounded-2xl font-bold text-foreground">
                  {partnership?.osc?.cnpj || 'N/A'}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Nº do Termo</label>
                <div className="p-5 bg-muted rounded-2xl font-bold text-foreground">
                  {partnership?.numero_termo || 'A definir'}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Valor da Parceria</label>
                <div className="p-5 bg-muted rounded-2xl font-bold text-foreground">
                  R$ {(partnership?.valor_repassado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            <div className="p-6 bg-info/10 rounded-2xl border border-info/20 flex items-start gap-4">
              <CheckCircle className="text-info shrink-0" size={20} />
              <p className="text-xs text-info font-medium">
                Os dados acima são importados automaticamente da parceria. Prossiga para definir objeto, metas e orçamento.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Objeto e Justificativa */}
        {activeStep === 2 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h3 className="text-xl font-black text-foreground">Objeto e Justificativa</h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                  Objetivos do Plano de Trabalho *
                </label>
                <textarea
                  value={objetivos}
                  onChange={(e) => setObjetivos(e.target.value)}
                  placeholder="Descreva os objetivos gerais e específicos que serão alcançados..."
                  rows={4}
                  className="w-full p-5 bg-muted rounded-2xl border-none outline-none font-medium text-foreground focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                  Justificativa
                </label>
                <textarea
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  placeholder="Justifique a relevância e necessidade das ações propostas..."
                  rows={4}
                  className="w-full p-5 bg-muted rounded-2xl border-none outline-none font-medium text-foreground focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Metas e Indicadores */}
        {activeStep === 3 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-foreground">Metas e Indicadores</h3>
              <button 
                onClick={addMeta}
                className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Plus size={20} />
              </button>
            </div>
            
            {metas.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
                <Calendar className="mx-auto text-muted-foreground/30 mb-4" size={48} />
                <p className="text-muted-foreground font-medium">Nenhuma meta cadastrada.</p>
                <button 
                  onClick={addMeta}
                  className="mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm"
                >
                  Adicionar Primeira Meta
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {metas.map((meta, idx) => (
                  <div key={meta.id} className="p-6 bg-muted rounded-2xl border border-border">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-black text-sm">
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                      <span className="text-[10px] font-black uppercase text-muted-foreground">Meta {idx + 1}</span>
                      <button 
                        onClick={() => removeMeta(meta.id)}
                        className="ml-auto p-2 text-destructive/50 hover:text-destructive transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          value={meta.descricao}
                          onChange={(e) => updateMeta(meta.id, 'descricao', e.target.value)}
                          placeholder="Descrição da meta..."
                          className="w-full p-4 bg-card rounded-xl outline-none font-medium focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <input
                        type="text"
                        value={meta.indicador}
                        onChange={(e) => updateMeta(meta.id, 'indicador', e.target.value)}
                        placeholder="Indicador de resultado"
                        className="w-full p-4 bg-card rounded-xl outline-none font-medium focus:ring-2 focus:ring-primary/20"
                      />
                      <div className="flex gap-3">
                        <input
                          type="number"
                          value={meta.meta_quantidade || ''}
                          onChange={(e) => updateMeta(meta.id, 'meta_quantidade', parseFloat(e.target.value) || 0)}
                          placeholder="Qtd"
                          className="w-1/2 p-4 bg-card rounded-xl outline-none font-medium focus:ring-2 focus:ring-primary/20"
                        />
                        <input
                          type="number"
                          value={meta.valor_unitario || ''}
                          onChange={(e) => updateMeta(meta.id, 'valor_unitario', parseFloat(e.target.value) || 0)}
                          placeholder="R$ Unit."
                          step="0.01"
                          className="w-1/2 p-4 bg-card rounded-xl outline-none font-medium focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="p-4 bg-primary/10 rounded-xl text-right">
                  <span className="text-sm font-black text-primary">
                    Total Metas: R$ {getTotalMetas().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Cronograma */}
        {activeStep === 4 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-foreground">Cronograma de Execução</h3>
              <button 
                onClick={addCronograma}
                className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Plus size={20} />
              </button>
            </div>
            
            {cronograma.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
                <Calendar className="mx-auto text-muted-foreground/30 mb-4" size={48} />
                <p className="text-muted-foreground font-medium">Nenhuma atividade no cronograma.</p>
                <button 
                  onClick={addCronograma}
                  className="mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm"
                >
                  Adicionar Atividade
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cronograma.map((item) => (
                  <div key={item.id} className="p-6 bg-muted rounded-2xl border border-border flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <select
                      value={item.mes}
                      onChange={(e) => updateCronograma(item.id, 'mes', parseInt(e.target.value))}
                      className="px-4 py-3 bg-card rounded-xl outline-none font-bold w-full md:w-32"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i} value={i + 1}>Mês {i + 1}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={item.atividade}
                      onChange={(e) => updateCronograma(item.id, 'atividade', e.target.value)}
                      placeholder="Descrição da atividade"
                      className="flex-1 p-4 bg-card rounded-xl outline-none font-medium focus:ring-2 focus:ring-primary/20"
                    />
                    <input
                      type="text"
                      value={item.responsavel}
                      onChange={(e) => updateCronograma(item.id, 'responsavel', e.target.value)}
                      placeholder="Responsável"
                      className="w-full md:w-48 p-4 bg-card rounded-xl outline-none font-medium focus:ring-2 focus:ring-primary/20"
                    />
                    <button 
                      onClick={() => removeCronograma(item.id)}
                      className="p-2 text-destructive/50 hover:text-destructive transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 5: Orçamento */}
        {activeStep === 5 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-foreground">Detalhamento Orçamentário</h3>
              <button 
                onClick={addOrcamento}
                className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Plus size={20} />
              </button>
            </div>
            
            {orcamento.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
                <DollarSign className="mx-auto text-muted-foreground/30 mb-4" size={48} />
                <p className="text-muted-foreground font-medium">Nenhum item orçamentário.</p>
                <button 
                  onClick={addOrcamento}
                  className="mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm"
                >
                  Adicionar Item
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orcamento.map((item) => (
                  <div key={item.id} className="p-6 bg-muted rounded-2xl border border-border flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <select
                      value={item.categoria}
                      onChange={(e) => updateOrcamento(item.id, 'categoria', e.target.value)}
                      className="px-4 py-3 bg-card rounded-xl outline-none font-bold w-full md:w-48"
                    >
                      <option value="">Categoria...</option>
                      <option value="Recursos Humanos">Recursos Humanos</option>
                      <option value="Custeio">Custeio</option>
                      <option value="Material de Consumo">Material de Consumo</option>
                      <option value="Serviços de Terceiros">Serviços de Terceiros</option>
                      <option value="Equipamentos">Equipamentos</option>
                    </select>
                    <input
                      type="text"
                      value={item.descricao}
                      onChange={(e) => updateOrcamento(item.id, 'descricao', e.target.value)}
                      placeholder="Descrição do item"
                      className="flex-1 p-4 bg-card rounded-xl outline-none font-medium focus:ring-2 focus:ring-primary/20"
                    />
                    <input
                      type="number"
                      value={item.valor || ''}
                      onChange={(e) => updateOrcamento(item.id, 'valor', parseFloat(e.target.value) || 0)}
                      placeholder="R$ Valor"
                      step="0.01"
                      className="w-full md:w-36 p-4 bg-card rounded-xl outline-none font-medium focus:ring-2 focus:ring-primary/20"
                    />
                    <button 
                      onClick={() => removeOrcamento(item.id)}
                      className="p-2 text-destructive/50 hover:text-destructive transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <div className="p-4 bg-primary/10 rounded-xl flex justify-between items-center">
                  <span className="text-sm font-bold text-muted-foreground">
                    Valor da Parceria: R$ {(partnership?.valor_repassado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-sm font-black text-primary">
                    Total Orçado: R$ {getTotalOrcamento().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkPlanEditor;

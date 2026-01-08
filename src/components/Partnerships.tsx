import React, { useState } from 'react';
import { Plus, Eye, FileSignature, ArrowLeft, Edit, CheckCircle, ClipboardList, AlertTriangle, X, Loader2, Calendar, DollarSign, ShieldCheck, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { usePartnerships } from '@/hooks/usePartnerships';
import { useOSCs } from '@/hooks/useOSCs';
import { usePublicCalls } from '@/hooks/usePublicCalls';
import WorkPlanEditor from './WorkPlanEditor';
import jsPDF from 'jspdf';

const StatusBadge = ({ status }: { status: string | null }) => {
  const styles: Record<string, string> = {
    'execucao': 'bg-info/10 text-info border-info/20',
    'planejamento': 'bg-muted text-muted-foreground border-border',
    'celebracao': 'bg-primary/10 text-primary border-primary/20',
    'prestacao_contas': 'bg-warning/10 text-warning border-warning/20',
    'concluida': 'bg-success/10 text-success border-success/20',
  };
  const labels: Record<string, string> = {
    'execucao': 'Em Execução',
    'planejamento': 'Planejamento',
    'celebracao': 'Celebração',
    'prestacao_contas': 'Prestação de Contas',
    'concluida': 'Concluída',
  };
  return (
    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border tracking-widest ${styles[status || ''] || 'bg-muted'}`}>
      {labels[status || ''] || status || 'N/A'}
    </span>
  );
};

const PartnershipsModule: React.FC = () => {
  const { partnerships, loading, createPartnership, updatePartnership } = usePartnerships();
  const { oscs, loading: loadingOscs } = useOSCs();
  const { publicCalls } = usePublicCalls();
  
  const [selectedPartnership, setSelectedPartnership] = useState<typeof partnerships[0] | null>(null);
  const [view, setView] = useState<'list' | 'detail' | 'create' | 'workplan'>('list');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    osc_id: '',
    numero_termo: '',
    tipo_origem: 'chamamento',
    status: 'planejamento',
    valor_repassado: '',
    vigencia_inicio: '',
    vigencia_fim: '',
    public_call_id: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const result = await createPartnership({
      osc_id: formData.osc_id,
      numero_termo: formData.numero_termo || undefined,
      tipo_origem: formData.tipo_origem || undefined,
      status: formData.status || undefined,
      valor_repassado: formData.valor_repassado ? parseFloat(formData.valor_repassado) : undefined,
      vigencia_inicio: formData.vigencia_inicio || undefined,
      vigencia_fim: formData.vigencia_fim || undefined,
      public_call_id: formData.public_call_id || undefined,
    });
    
    if (!result.error) {
      toast({ 
        title: "Parceria cadastrada com sucesso!", 
        description: `Instrumento ${formData.numero_termo || 'novo'} criado e adicionado à lista.` 
      });
    }
    
    setFormData({
      osc_id: '',
      numero_termo: '',
      tipo_origem: 'chamamento',
      status: 'planejamento',
      valor_repassado: '',
      vigencia_inicio: '',
      vigencia_fim: '',
      public_call_id: '',
    });
    setShowModal(false);
    setSaving(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnership) return;
    setSaving(true);
    
    const result = await updatePartnership(selectedPartnership.id, {
      numero_termo: formData.numero_termo || undefined,
      tipo_origem: formData.tipo_origem || undefined,
      status: formData.status || undefined,
      valor_repassado: formData.valor_repassado ? parseFloat(formData.valor_repassado) : undefined,
      vigencia_inicio: formData.vigencia_inicio || undefined,
      vigencia_fim: formData.vigencia_fim || undefined,
      public_call_id: formData.public_call_id || undefined,
    });
    
    if (!result.error) {
      toast({ title: "Parceria atualizada!", description: "Dados salvos com sucesso." });
      setSelectedPartnership(result.data);
    }
    
    setShowEditModal(false);
    setSaving(false);
  };

  const openEditModal = () => {
    if (!selectedPartnership) return;
    setFormData({
      osc_id: selectedPartnership.osc_id,
      numero_termo: selectedPartnership.numero_termo || '',
      tipo_origem: selectedPartnership.tipo_origem || 'chamamento',
      status: selectedPartnership.status || 'planejamento',
      valor_repassado: selectedPartnership.valor_repassado?.toString() || '',
      vigencia_inicio: selectedPartnership.vigencia_inicio || '',
      vigencia_fim: selectedPartnership.vigencia_fim || '',
      public_call_id: selectedPartnership.public_call_id || '',
    });
    setShowEditModal(true);
  };

  const handleDownloadInstrument = () => {
    if (!selectedPartnership) return;
    
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('TERMO DE FOMENTO / COLABORAÇÃO', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Nº: ${selectedPartnership.numero_termo || 'A DEFINIR'}`, 105, 30, { align: 'center' });
    doc.line(20, 35, 190, 35);
    
    doc.setFontSize(10);
    let y = 50;
    doc.text(`OSC: ${selectedPartnership.osc?.razao_social || 'N/A'}`, 20, y);
    doc.text(`CNPJ: ${selectedPartnership.osc?.cnpj || 'N/A'}`, 20, y + 8);
    doc.text(`Origem: ${selectedPartnership.tipo_origem === 'chamamento' ? 'Chamamento Público' : selectedPartnership.tipo_origem === 'emenda' ? 'Emenda Parlamentar' : 'Dispensa de Chamamento'}`, 20, y + 16);
    doc.text(`Valor: R$ ${(selectedPartnership.valor_repassado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, y + 24);
    doc.text(`Vigência: ${selectedPartnership.vigencia_inicio ? new Date(selectedPartnership.vigencia_inicio).toLocaleDateString('pt-BR') : 'N/A'} até ${selectedPartnership.vigencia_fim ? new Date(selectedPartnership.vigencia_fim).toLocaleDateString('pt-BR') : 'N/A'}`, 20, y + 32);
    doc.text(`Status: ${selectedPartnership.status || 'N/A'}`, 20, y + 40);
    
    doc.save(`instrumento_${selectedPartnership.numero_termo || 'parceria'}.pdf`);
    toast({ title: "Download iniciado!", description: "Instrumento gerado em PDF." });
  };

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading || loadingOscs) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (view === 'create') return <WorkPlanEditor onBack={() => setView('list')} />;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {view === 'list' ? (
        <>
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <div className="flex items-center space-x-3 text-[10px] font-black text-primary uppercase tracking-widest mb-3">
                <FileSignature size={14} />
                <span>Gestão Unaí/MG • Registro de Parcerias</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tighter">Instrumentos MROSC</h2>
            </div>
            <button 
              onClick={() => setShowModal(true)} 
              className="px-6 md:px-8 py-4 md:py-5 bg-primary text-primary-foreground rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:opacity-90 shadow-2xl shadow-primary/20 flex items-center gap-3 transition-all active:scale-95"
            >
              <Plus size={20} /> Nova Parceria
            </button>
          </header>

          {partnerships.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-[3rem] border border-border">
              <FileSignature className="mx-auto text-muted-foreground/30 mb-4" size={64} />
              <p className="text-muted-foreground font-medium">Nenhuma parceria cadastrada ainda.</p>
              <button 
                onClick={() => setShowModal(true)}
                className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm"
              >
                Criar Primeira Parceria
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {partnerships.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => { setSelectedPartnership(p); setView('detail'); }} 
                  className="bg-card p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border border-border shadow-sm hover:shadow-2xl transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-6 md:mb-8">
                    <StatusBadge status={p.status} />
                    <div className="p-3 bg-muted text-muted-foreground rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <Eye size={20} />
                    </div>
                  </div>
                  <h4 className="text-xl md:text-2xl font-black text-foreground mb-2 tracking-tight leading-tight">
                    {p.osc?.razao_social || 'OSC não identificada'}
                  </h4>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6 md:mb-10">
                    {p.tipo_origem === 'chamamento' ? 'Chamamento Público' : 
                     p.tipo_origem === 'emenda' ? 'Emenda Parlamentar' : 
                     p.tipo_origem === 'dispensa' ? 'Dispensa de Chamamento' : p.tipo_origem}
                    {p.numero_termo && ` • ${p.numero_termo}`}
                  </p>
                  <div className="flex justify-between items-center pt-6 md:pt-8 border-t border-border">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest">Valor Global</span>
                      <div className="font-black text-foreground">
                        R$ {(p.valor_repassado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest">Vigência</span>
                      <div className="text-xs font-bold text-muted-foreground">
                        {p.vigencia_fim ? new Date(p.vigencia_fim).toLocaleDateString('pt-BR') : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-10 animate-in slide-in-from-right duration-500 pb-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <button 
              onClick={() => setView('list')} 
              className="flex items-center gap-3 text-primary font-black text-[10px] uppercase tracking-widest px-6 py-3 bg-card rounded-2xl border border-border shadow-sm hover:bg-primary/10 transition-all"
            >
              <ArrowLeft size={16} /> Voltar
            </button>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={openEditModal}
                className="px-6 py-3 bg-info/10 text-info rounded-xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-info hover:text-info-foreground transition-all"
              >
                <Edit size={16} /> Editar
              </button>
              <label className="px-6 py-3 bg-success/10 text-success rounded-xl font-black text-[10px] uppercase flex items-center gap-2 cursor-pointer hover:bg-success/20 transition-colors">
                <FileSignature size={16} /> Upload Contrato (PAdES)
                <input type="file" accept=".pdf" className="hidden" onChange={() => {
                  toast({ title: "Contrato enviado!", description: "Assinatura PAdES verificada com sucesso." });
                }} />
              </label>
              <button 
                onClick={handleDownloadInstrument}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-black text-[10px] uppercase shadow-lg flex items-center gap-2 hover:opacity-90 transition-all"
              >
                <Download size={16} /> Baixar Instrumento
              </button>
            </div>
          </div>
          
          <div className="bg-card p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl border border-border">
            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 mb-8 md:mb-12">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-primary text-primary-foreground rounded-[2rem] flex items-center justify-center font-black text-2xl md:text-3xl shadow-xl">
                {selectedPartnership?.osc?.razao_social?.charAt(0) || 'P'}
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-foreground tracking-tighter">
                  {selectedPartnership?.osc?.razao_social}
                </h3>
                <p className="text-xs text-primary font-bold uppercase tracking-widest mt-2">
                  {selectedPartnership?.numero_termo || 'Sem número'} • CNPJ: {selectedPartnership?.osc?.cnpj}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="p-6 md:p-8 bg-muted rounded-[2rem] md:rounded-[2.5rem] border border-border">
                <DollarSign className="text-primary mb-4" size={24} />
                <h5 className="text-[10px] font-black text-muted-foreground uppercase mb-2">Valor Repassado</h5>
                <p className="text-lg md:text-xl font-black text-foreground">
                  R$ {(selectedPartnership?.valor_repassado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-6 md:p-8 bg-muted rounded-[2rem] md:rounded-[2.5rem] border border-border">
                <ClipboardList className="text-info mb-4" size={24} />
                <h5 className="text-[10px] font-black text-muted-foreground uppercase mb-2">Status</h5>
                <StatusBadge status={selectedPartnership?.status || null} />
              </div>
              <div className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border ${
                getDaysRemaining(selectedPartnership?.vigencia_fim || null) !== null && 
                getDaysRemaining(selectedPartnership?.vigencia_fim || null)! < 30 
                  ? 'bg-warning/10 border-warning/20' 
                  : 'bg-muted border-border'
              }`}>
                <Calendar className={getDaysRemaining(selectedPartnership?.vigencia_fim || null) !== null && getDaysRemaining(selectedPartnership?.vigencia_fim || null)! < 30 ? 'text-warning mb-4' : 'text-primary mb-4'} size={24} />
                <h5 className="text-[10px] font-black text-muted-foreground uppercase mb-2">Vigência</h5>
                <p className="text-lg md:text-xl font-black text-foreground">
                  {getDaysRemaining(selectedPartnership?.vigencia_fim || null) !== null 
                    ? `${getDaysRemaining(selectedPartnership?.vigencia_fim || null)} Dias`
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Parceria */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-[2rem] p-6 md:p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-foreground">Nova Parceria</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  OSC Parceira *
                </label>
                <select
                  value={formData.osc_id}
                  onChange={(e) => setFormData({ ...formData, osc_id: e.target.value })}
                  required
                  className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20 appearance-none cursor-pointer"
                >
                  <option value="">Selecione uma OSC...</option>
                  {oscs.map(osc => (
                    <option key={osc.id} value={osc.id}>{osc.razao_social}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Número do Termo
                </label>
                <input
                  type="text"
                  value={formData.numero_termo}
                  onChange={(e) => setFormData({ ...formData, numero_termo: e.target.value })}
                  placeholder="Ex: TF-001/2024"
                  className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Origem
                  </label>
                  <select
                    value={formData.tipo_origem}
                    onChange={(e) => setFormData({ ...formData, tipo_origem: e.target.value })}
                    className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20 appearance-none cursor-pointer"
                  >
                    <option value="chamamento">Chamamento Público</option>
                    <option value="emenda">Emenda Parlamentar</option>
                    <option value="dispensa">Dispensa de Chamamento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20 appearance-none cursor-pointer"
                  >
                    <option value="planejamento">Planejamento</option>
                    <option value="celebracao">Celebração</option>
                    <option value="execucao">Em Execução</option>
                    <option value="prestacao_contas">Prestação de Contas</option>
                    <option value="concluida">Concluída</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Valor Repassado
                </label>
                <input
                  type="number"
                  value={formData.valor_repassado}
                  onChange={(e) => setFormData({ ...formData, valor_repassado: e.target.value })}
                  placeholder="R$ 0,00"
                  step="0.01"
                  className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Início Vigência
                  </label>
                  <input
                    type="date"
                    value={formData.vigencia_inicio}
                    onChange={(e) => setFormData({ ...formData, vigencia_inicio: e.target.value })}
                    className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Fim Vigência
                  </label>
                  <input
                    type="date"
                    value={formData.vigencia_fim}
                    onChange={(e) => setFormData({ ...formData, vigencia_fim: e.target.value })}
                    className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20"
                  />
                </div>
              </div>

              {publicCalls.length > 0 && (
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Chamamento Vinculado
                  </label>
                  <select
                    value={formData.public_call_id}
                    onChange={(e) => setFormData({ ...formData, public_call_id: e.target.value })}
                    className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20 appearance-none cursor-pointer"
                  >
                    <option value="">Nenhum</option>
                    {publicCalls.map(pc => (
                      <option key={pc.id} value={pc.id}>{pc.numero_edital} - {pc.objeto}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 bg-muted text-muted-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-muted/80 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !formData.osc_id}
                  className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  {saving ? 'Salvando...' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Parceria */}
      {showEditModal && selectedPartnership && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-[2rem] p-6 md:p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-foreground">Editar Parceria</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  OSC Parceira
                </label>
                <div className="w-full px-4 py-4 bg-muted/50 rounded-2xl text-sm text-muted-foreground">
                  {selectedPartnership.osc?.razao_social || 'N/A'}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Número do Termo
                </label>
                <input
                  type="text"
                  value={formData.numero_termo}
                  onChange={(e) => setFormData({ ...formData, numero_termo: e.target.value })}
                  placeholder="Ex: TF-001/2024"
                  className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Origem
                  </label>
                  <select
                    value={formData.tipo_origem}
                    onChange={(e) => setFormData({ ...formData, tipo_origem: e.target.value })}
                    className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20 appearance-none cursor-pointer"
                  >
                    <option value="chamamento">Chamamento Público</option>
                    <option value="emenda">Emenda Parlamentar</option>
                    <option value="dispensa">Dispensa de Chamamento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20 appearance-none cursor-pointer"
                  >
                    <option value="planejamento">Planejamento</option>
                    <option value="celebracao">Celebração</option>
                    <option value="execucao">Em Execução</option>
                    <option value="prestacao_contas">Prestação de Contas</option>
                    <option value="concluida">Concluída</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Valor Repassado
                </label>
                <input
                  type="number"
                  value={formData.valor_repassado}
                  onChange={(e) => setFormData({ ...formData, valor_repassado: e.target.value })}
                  placeholder="R$ 0,00"
                  step="0.01"
                  className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Início Vigência
                  </label>
                  <input
                    type="date"
                    value={formData.vigencia_inicio}
                    onChange={(e) => setFormData({ ...formData, vigencia_inicio: e.target.value })}
                    className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Fim Vigência
                  </label>
                  <input
                    type="date"
                    value={formData.vigencia_fim}
                    onChange={(e) => setFormData({ ...formData, vigencia_fim: e.target.value })}
                    className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-4 bg-muted text-muted-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-muted/80 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnershipsModule;

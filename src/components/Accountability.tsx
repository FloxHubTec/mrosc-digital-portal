import React, { useState, useRef } from 'react';
import { ClipboardList, Camera, CheckCircle2, XCircle, CreditCard, Plus, Upload, Loader2, X, AlertTriangle, FileText, DollarSign } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { usePartnerships } from '@/hooks/usePartnerships';
import { supabase } from '@/integrations/supabase/client';

const AccountabilityModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'REO' | 'REFF'>('REO');
  const [selectedPartnershipId, setSelectedPartnershipId] = useState<string>('');
  const { partnerships, loading: loadingPartnerships } = usePartnerships();
  const { transactions, loading, totals, createTransaction, approveTransaction, rejectTransaction, refetch } = useTransactions(selectedPartnershipId || undefined);
  
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    data_transacao: '',
    valor: '',
    tipo: 'despesa',
    categoria: '',
    fornecedor: '',
  });
  const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `comprovantes/${fileName}`;
    
    const { error } = await supabase.storage
      .from('documents')
      .upload(filePath, file);
    
    if (error) {
      console.error('Error uploading file:', error);
      setUploading(false);
      return;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);
    
    setUploadedFile({ url: publicUrl, name: file.name });
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnershipId || !uploadedFile) return;
    
    setSaving(true);
    
    await createTransaction({
      partnership_id: selectedPartnershipId,
      data_transacao: formData.data_transacao,
      valor: parseFloat(formData.valor),
      tipo: formData.tipo,
      categoria: formData.categoria || null,
      fornecedor: formData.fornecedor || null,
      url_comprovante: uploadedFile.url,
      status_conciliacao: 'pendente',
      justificativa_glosa: null,
    });
    
    setFormData({ data_transacao: '', valor: '', tipo: 'despesa', categoria: '', fornecedor: '' });
    setUploadedFile(null);
    setShowModal(false);
    setSaving(false);
  };

  const handleApprove = async (id: string) => {
    await approveTransaction(id);
  };

  const handleReject = async () => {
    if (!showRejectModal || !rejectReason) return;
    await rejectTransaction(showRejectModal, rejectReason);
    setShowRejectModal(null);
    setRejectReason('');
  };

  const getStatusStyle = (status: string | null) => {
    switch (status) {
      case 'aprovado': return 'bg-success/10 text-success';
      case 'glosado': return 'bg-destructive/10 text-destructive';
      case 'pendente': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const categorias = [
    'Recursos Humanos',
    'Custeio',
    'Material de Consumo',
    'Serviços de Terceiros',
    'Equipamentos',
    'Outros',
  ];

  if (loadingPartnerships) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-primary uppercase tracking-widest mb-3">
            <ClipboardList size={14} />
            <span>Processamento Integral POC Item 33</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter">Compliance de Contas</h2>
          <p className="text-muted-foreground font-medium italic">Monitoramento eletrônico de Objeto e Financeiro (REO/REFF).</p>
        </div>
        
        {selectedPartnershipId && (
          <button 
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-xl flex items-center space-x-2 transition-all active:scale-95"
          >
            <Plus size={18} />
            <span>Nova Transação</span>
          </button>
        )}
      </header>

      {/* Seletor de Parceria */}
      <div className="bg-card p-6 rounded-3xl border border-border">
        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">
          Selecionar Parceria
        </label>
        <select
          value={selectedPartnershipId}
          onChange={(e) => setSelectedPartnershipId(e.target.value)}
          className="w-full md:w-96 px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20 appearance-none cursor-pointer"
        >
          <option value="">Selecione uma parceria...</option>
          {partnerships.map(p => (
            <option key={p.id} value={p.id}>
              {p.osc?.razao_social} - {p.numero_termo || 'Sem número'}
            </option>
          ))}
        </select>
      </div>

      {selectedPartnershipId && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-card p-6 rounded-3xl border border-border flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Receitas</p>
                <h4 className="text-xl font-black text-success">
                  R$ {totals.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h4>
              </div>
              <div className="p-3 bg-success/10 text-success rounded-2xl">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="bg-card p-6 rounded-3xl border border-border flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Despesas</p>
                <h4 className="text-xl font-black text-destructive">
                  R$ {totals.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h4>
              </div>
              <div className="p-3 bg-destructive/10 text-destructive rounded-2xl">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="bg-card p-6 rounded-3xl border border-border flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Saldo</p>
                <h4 className={`text-xl font-black ${totals.saldo >= 0 ? 'text-success' : 'text-destructive'}`}>
                  R$ {totals.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h4>
              </div>
              <div className={`p-3 rounded-2xl ${totals.saldo >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                <CreditCard size={20} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-card p-2 rounded-3xl shadow-sm border border-border w-fit">
            <button 
              onClick={() => setActiveTab('REO')}
              className={`px-6 md:px-8 py-3 md:py-4 rounded-2xl text-xs font-black uppercase transition-all ${activeTab === 'REO' ? 'bg-primary text-primary-foreground shadow-xl' : 'text-muted-foreground hover:text-primary'}`}
            >
              REO (Execução Objeto)
            </button>
            <button 
              onClick={() => setActiveTab('REFF')}
              className={`px-6 md:px-8 py-3 md:py-4 rounded-2xl text-xs font-black uppercase transition-all ${activeTab === 'REFF' ? 'bg-primary text-primary-foreground shadow-xl' : 'text-muted-foreground hover:text-primary'}`}
            >
              REFF (Financeiro)
            </button>
          </div>

          <div className="bg-card rounded-[2.5rem] md:rounded-[4rem] shadow-2xl border border-border overflow-hidden">
            {activeTab === 'REO' ? (
              <div className="p-8 md:p-12 space-y-8 md:space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  <div className="p-8 md:p-10 border-2 border-dashed border-border rounded-[2rem] md:rounded-[3rem] bg-muted/50 flex flex-col items-center text-center">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                      <Camera size={28} />
                    </div>
                    <h4 className="text-lg md:text-xl font-black text-foreground mb-2">Evidências Fotográficas</h4>
                    <p className="text-xs text-muted-foreground font-medium mb-6">Insira fotos do evento, listas de presença e relatórios de atividades.</p>
                    <button className="px-6 md:px-8 py-3 md:py-4 bg-primary text-primary-foreground rounded-2xl font-black text-[10px] uppercase">
                      Upload de Arquivos
                    </button>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-lg md:text-xl font-black text-foreground">Metas da Parceria</h4>
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="mx-auto mb-3 opacity-30" size={40} />
                      <p className="text-sm">Metas serão exibidas após configuração do Plano de Trabalho.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-16">
                    <CreditCard className="mx-auto text-muted-foreground/30 mb-4" size={48} />
                    <p className="text-muted-foreground">Nenhuma transação registrada ainda.</p>
                  </div>
                ) : (
                  <table className="w-full text-left min-w-[700px]">
                    <thead className="bg-sidebar-background text-sidebar-foreground/70 text-[10px] font-black uppercase tracking-widest">
                      <tr>
                        <th className="px-6 md:px-8 py-5 md:py-7">Data / Descrição</th>
                        <th className="px-6 md:px-8 py-5 md:py-7">Categoria</th>
                        <th className="px-6 md:px-8 py-5 md:py-7">Valor</th>
                        <th className="px-6 md:px-8 py-5 md:py-7">Status</th>
                        <th className="px-6 md:px-8 py-5 md:py-7 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {transactions.map((t) => (
                        <tr key={t.id} className="hover:bg-muted transition-colors">
                          <td className="px-6 md:px-8 py-6 md:py-8">
                            <div className="font-black text-foreground">{t.fornecedor || 'Sem descrição'}</div>
                            <div className="text-[10px] font-bold text-muted-foreground">
                              {new Date(t.data_transacao).toLocaleDateString('pt-BR')}
                            </div>
                          </td>
                          <td className="px-6 md:px-8 py-6 md:py-8">
                            <span className="px-3 py-1 bg-muted text-muted-foreground rounded-lg text-[9px] font-black uppercase">
                              {t.categoria || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 md:px-8 py-6 md:py-8">
                            <span className={`font-black ${t.tipo === 'receita' ? 'text-success' : 'text-destructive'}`}>
                              {t.tipo === 'receita' ? '+' : '-'} R$ {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="px-6 md:px-8 py-6 md:py-8">
                            <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase ${getStatusStyle(t.status_conciliacao)}`}>
                              {t.status_conciliacao === 'aprovado' ? 'Aprovado' : 
                               t.status_conciliacao === 'glosado' ? 'Glosado' : 'Pendente'}
                            </span>
                            {t.justificativa_glosa && (
                              <p className="text-[10px] text-muted-foreground mt-1 max-w-[150px] truncate" title={t.justificativa_glosa}>
                                {t.justificativa_glosa}
                              </p>
                            )}
                          </td>
                          <td className="px-6 md:px-8 py-6 md:py-8 text-right">
                            {t.status_conciliacao === 'pendente' && (
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => setShowRejectModal(t.id)}
                                  className="p-3 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive hover:text-destructive-foreground transition-all" 
                                  title="Glosar Despesa"
                                >
                                  <XCircle size={18} />
                                </button>
                                <button 
                                  onClick={() => handleApprove(t.id)}
                                  className="p-3 bg-success/10 text-success rounded-xl hover:bg-success hover:text-success-foreground transition-all"
                                  title="Aprovar"
                                >
                                  <CheckCircle2 size={18} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {!selectedPartnershipId && (
        <div className="text-center py-20 bg-card rounded-[3rem] border border-border">
          <ClipboardList className="mx-auto text-muted-foreground/30 mb-4" size={64} />
          <p className="text-muted-foreground font-medium">Selecione uma parceria para visualizar as prestações de contas.</p>
        </div>
      )}

      {/* Modal Nova Transação */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-[2rem] p-6 md:p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-foreground">Nova Transação</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={formData.data_transacao}
                    onChange={(e) => setFormData({ ...formData, data_transacao: e.target.value })}
                    required
                    className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Tipo *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20 appearance-none cursor-pointer"
                  >
                    <option value="despesa">Despesa</option>
                    <option value="receita">Receita</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Valor *
                </label>
                <input
                  type="number"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  placeholder="R$ 0,00"
                  step="0.01"
                  required
                  className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Categoria
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20 appearance-none cursor-pointer"
                >
                  <option value="">Selecione...</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Fornecedor / Descrição
                </label>
                <input
                  type="text"
                  value={formData.fornecedor}
                  onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                  placeholder="Nome do fornecedor ou descrição"
                  className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Comprovante *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
                {uploadedFile ? (
                  <div className="flex items-center gap-3 p-4 bg-success/10 rounded-2xl border border-success/20">
                    <CheckCircle2 className="text-success" size={20} />
                    <span className="text-sm font-medium text-foreground flex-1 truncate">{uploadedFile.name}</span>
                    <button 
                      type="button"
                      onClick={() => setUploadedFile(null)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full p-6 border-2 border-dashed border-border rounded-2xl flex flex-col items-center gap-2 hover:border-primary/50 transition-colors"
                  >
                    {uploading ? (
                      <Loader2 className="animate-spin text-primary" size={24} />
                    ) : (
                      <Upload className="text-muted-foreground" size={24} />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {uploading ? 'Enviando...' : 'Clique para enviar PDF, JPG ou PNG'}
                    </span>
                  </button>
                )}
              </div>

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
                  disabled={saving || !uploadedFile}
                  className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  {saving ? 'Salvando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Glosar */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-[2rem] p-6 md:p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                <AlertTriangle className="text-warning" size={20} />
                Glosar Despesa
              </h3>
              <button onClick={() => setShowRejectModal(null)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Informe a justificativa para glosar esta despesa. A OSC será notificada.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Justificativa da glosa..."
                rows={4}
                className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20 resize-none"
              />
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(null)}
                  className="flex-1 py-4 bg-muted text-muted-foreground rounded-2xl font-black text-xs uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                  className="flex-1 py-4 bg-destructive text-destructive-foreground rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg disabled:opacity-50"
                >
                  Confirmar Glosa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountabilityModule;

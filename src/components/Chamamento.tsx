import React, { useState } from 'react';
import { Megaphone, Plus, Search, FileText, Filter, ChevronRight, Clock, X, Loader2, CheckCircle } from 'lucide-react';
import { usePublicCalls } from '@/hooks/usePublicCalls';

const ChamamentoModule: React.FC = () => {
  const { publicCalls, loading, createPublicCall } = usePublicCalls();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    numero_edital: '',
    objeto: '',
    status: 'aberto',
    data_inicio: '',
    data_fim: '',
    valor_total: '',
  });

  const filteredCalls = publicCalls.filter(c => 
    c.numero_edital.toLowerCase().includes(search.toLowerCase()) ||
    c.objeto.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    await createPublicCall({
      numero_edital: formData.numero_edital,
      objeto: formData.objeto,
      status: formData.status,
      data_inicio: formData.data_inicio || null,
      data_fim: formData.data_fim || null,
      valor_total: formData.valor_total ? parseFloat(formData.valor_total) : null,
      pdf_url: null,
    });
    
    setFormData({ numero_edital: '', objeto: '', status: 'aberto', data_inicio: '', data_fim: '', valor_total: '' });
    setShowModal(false);
    setSaving(false);
  };

  const getStatusStyle = (status: string | null) => {
    switch (status) {
      case 'aberto': return 'bg-success/10 text-success border-success/20';
      case 'em_julgamento': return 'bg-warning/10 text-warning border-warning/20';
      case 'homologado': return 'bg-info/10 text-info border-info/20';
      case 'suspenso': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusLabel = (status: string | null) => {
    const labels: Record<string, string> = {
      'aberto': 'Aberto',
      'em_julgamento': 'Em Julgamento',
      'homologado': 'Homologado',
      'suspenso': 'Suspenso',
      'encerrado': 'Encerrado',
    };
    return labels[status || ''] || status || 'N/A';
  };

  const stats = [
    { label: 'Editais Ativos', value: publicCalls.filter(c => c.status === 'aberto').length.toString().padStart(2, '0') },
    { label: 'Em Análise', value: publicCalls.filter(c => c.status === 'em_julgamento').length.toString().padStart(2, '0') },
    { label: 'Homologados', value: publicCalls.filter(c => c.status === 'homologado').length.toString().padStart(2, '0') },
  ];

  if (loading) {
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
            <Megaphone size={14} />
            <span>Processos de Seleção Pública (POC Item 26)</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter">Chamamentos e Editais</h2>
          <p className="text-muted-foreground font-medium">Gestão do fluxo seletivo conforme Art. 23 da Lei 13.019/14.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-xl shadow-primary/20 flex items-center space-x-2 transition-all active:scale-95"
        >
          <Plus size={18} />
          <span>Novo Edital</span>
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {stats.map((item, i) => (
          <div key={i} className="bg-card p-6 rounded-3xl border border-border shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item.label}</p>
              <h4 className="text-2xl font-black text-foreground">{item.value}</h4>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <FileText size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-muted/50 border border-border overflow-hidden">
        <div className="p-4 md:p-8 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/20">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar edital..." 
              className="pl-12 pr-6 py-3 bg-card border border-border rounded-2xl text-xs outline-none focus:ring-4 focus:ring-primary/10 w-full md:w-64"
            />
          </div>
          <button className="p-3 text-muted-foreground hover:text-primary transition-colors"><Filter size={18} /></button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-muted/50 text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-4 md:px-8 py-6">Nº Edital</th>
                <th className="px-4 md:px-8 py-6">Objeto da Seleção</th>
                <th className="px-4 md:px-8 py-6">Status</th>
                <th className="px-4 md:px-8 py-6">Prazo Final</th>
                <th className="px-4 md:px-8 py-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCalls.map((c) => (
                <tr key={c.id} className="group hover:bg-primary/5 transition-all cursor-pointer">
                  <td className="px-4 md:px-8 py-6 md:py-7">
                    <div className="font-black text-primary text-sm">{c.numero_edital}</div>
                  </td>
                  <td className="px-4 md:px-8 py-6 md:py-7">
                    <p className="text-xs font-medium text-muted-foreground max-w-xs leading-relaxed">{c.objeto}</p>
                  </td>
                  <td className="px-4 md:px-8 py-6 md:py-7">
                    <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase border ${getStatusStyle(c.status)}`}>
                      {getStatusLabel(c.status)}
                    </span>
                  </td>
                  <td className="px-4 md:px-8 py-6 md:py-7">
                    <div className="flex items-center space-x-2 text-xs font-bold text-foreground">
                      <Clock size={14} className="text-muted-foreground" />
                      <span>{c.data_fim ? new Date(c.data_fim).toLocaleDateString('pt-BR') : 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-8 py-6 md:py-7 text-right">
                    <button className="p-3 bg-muted text-muted-foreground rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCalls.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-muted-foreground">
                    {search ? 'Nenhum edital encontrado.' : 'Nenhum chamamento cadastrado ainda.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-[2rem] p-6 md:p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-foreground">Novo Chamamento</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Número do Edital *
                </label>
                <input
                  type="text"
                  value={formData.numero_edital}
                  onChange={(e) => setFormData({ ...formData, numero_edital: e.target.value })}
                  placeholder="Ex: 001/2024"
                  required
                  className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Objeto *
                </label>
                <textarea
                  value={formData.objeto}
                  onChange={(e) => setFormData({ ...formData, objeto: e.target.value })}
                  placeholder="Descrição do objeto do chamamento..."
                  required
                  rows={3}
                  className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={formData.data_fim}
                    onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                    className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Valor Total
                </label>
                <input
                  type="number"
                  value={formData.valor_total}
                  onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
                  placeholder="R$ 0,00"
                  step="0.01"
                  className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 bg-muted text-muted-foreground rounded-2xl font-black text-xs uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  {saving ? 'Salvando...' : 'Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChamamentoModule;

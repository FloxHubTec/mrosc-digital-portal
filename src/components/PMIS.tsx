import React, { useState } from 'react';
import { Briefcase, Plus, Clock, Eye, X, Loader2, CheckCircle, Search, Filter, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface PMIS {
  id: string;
  title: string;
  osc: string;
  date: string;
  status: 'Análise' | 'Decidido' | 'Publicado' | 'Rejeitado';
  descricao?: string;
  objetivo?: string;
  area?: string;
  publico?: string;
  justificativa?: string;
}

const PMISModule: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPMIS, setSelectedPMIS] = useState<PMIS | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  
  const [items, setItems] = useState<PMIS[]>([
    { id: '1', title: 'Educação para Jovens em Risco', osc: 'OSC Vida Nova', date: '20/10/2023', status: 'Análise', descricao: 'Programa educacional para jovens em situação de vulnerabilidade', objetivo: 'Reduzir evasão escolar', area: 'Educação', publico: 'Jovens de 14 a 18 anos', justificativa: 'Alto índice de evasão escolar na região' },
    { id: '2', title: 'Horta Comunitária Zona Sul', osc: 'Verde Cidade', date: '15/10/2023', status: 'Decidido', descricao: 'Implantação de horta comunitária', objetivo: 'Promover segurança alimentar', area: 'Meio Ambiente', publico: 'Famílias de baixa renda', justificativa: 'Necessidade de acesso a alimentos saudáveis' },
    { id: '3', title: 'Apoio a Idosos Abandonados', osc: 'Assoc. Terceira Idade', date: '10/10/2023', status: 'Publicado', descricao: 'Programa de acolhimento a idosos', objetivo: 'Proporcionar qualidade de vida', area: 'Assistência Social', publico: 'Idosos acima de 60 anos', justificativa: 'Aumento do abandono de idosos' },
  ]);

  const [formData, setFormData] = useState({
    title: '',
    osc: '',
    descricao: '',
    objetivo: '',
    area: '',
    publico: '',
    justificativa: '',
  });

  const statusOptions = [
    { value: '', label: 'Todos os Status' },
    { value: 'Análise', label: 'Em Análise' },
    { value: 'Decidido', label: 'Decidido' },
    { value: 'Publicado', label: 'Publicado' },
    { value: 'Rejeitado', label: 'Rejeitado' },
  ];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          item.osc.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !filterStatus || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.osc) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setSaving(true);
    
    // Simulando salvamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newPMIS: PMIS = {
      id: Date.now().toString(),
      title: formData.title,
      osc: formData.osc,
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'Análise',
      descricao: formData.descricao,
      objetivo: formData.objetivo,
      area: formData.area,
      publico: formData.publico,
      justificativa: formData.justificativa,
    };
    
    setItems([newPMIS, ...items]);
    setFormData({ title: '', osc: '', descricao: '', objetivo: '', area: '', publico: '', justificativa: '' });
    setShowModal(false);
    setSaving(false);
    toast.success('PMIS cadastrada com sucesso!');
  };

  const handleView = (pmis: PMIS) => {
    setSelectedPMIS(pmis);
    setShowViewModal(true);
  };

  const handleUpdateStatus = (newStatus: 'Análise' | 'Decidido' | 'Publicado' | 'Rejeitado') => {
    if (!selectedPMIS) return;
    
    setItems(items.map(item => 
      item.id === selectedPMIS.id ? { ...item, status: newStatus } : item
    ));
    setSelectedPMIS({ ...selectedPMIS, status: newStatus });
    toast.success(`Status atualizado para: ${newStatus}`);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Análise': return 'bg-warning/10 text-warning border-warning/20';
      case 'Decidido': return 'bg-info/10 text-info border-info/20';
      case 'Publicado': return 'bg-success/10 text-success border-success/20';
      case 'Rejeitado': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-primary uppercase tracking-widest mb-3">
            <Briefcase size={14} />
            <span>Participação Social e Iniciativa OSC</span>
          </div>
          <h2 className="text-4xl font-black text-foreground tracking-tighter">PMIS</h2>
          <p className="text-muted-foreground font-medium">Procedimento de Manifestação de Interesse Social (Art. 18 Lei 13.019/14).</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-xl flex items-center space-x-2 transition-all active:scale-95"
        >
          <Plus size={18} />
          <span>Cadastrar PMIS</span>
        </button>
      </header>

      <div className="bg-card rounded-[2.5rem] shadow-xl border border-border overflow-hidden">
        <div className="p-8 bg-muted border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                type="text" 
                placeholder="Pesquisar manifestação..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-6 py-3 bg-card border border-border rounded-2xl text-xs outline-none focus:ring-4 focus:ring-primary/10 w-full md:w-64 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="p-3 bg-card border border-border rounded-2xl text-muted-foreground hover:text-primary hover:border-primary/30 transition-all flex items-center gap-2"
              >
                <Filter size={18} />
                <span className="text-xs font-bold">Filtros</span>
                <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {showFilters && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowFilters(false)} />
                  <div className="absolute left-0 top-full mt-2 bg-card border border-border rounded-xl shadow-xl z-50 p-4 min-w-[200px] animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-black uppercase text-foreground">Filtrar Status</span>
                      <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-muted rounded-lg text-muted-foreground">
                        <X size={14} />
                      </button>
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setShowFilters(false);
                      }}
                      className="w-full px-4 py-3 bg-muted rounded-xl text-xs outline-none focus:ring-4 focus:ring-primary/10 text-foreground"
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="px-4 py-2 bg-info/10 text-info rounded-xl text-[10px] font-black uppercase tracking-widest border border-info/20">
            {items.filter(i => i.status === 'Análise').length.toString().padStart(2, '0')} Novas Propostas
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-card text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
            <tr>
              <th className="px-8 py-6">Título da Manifestação</th>
              <th className="px-8 py-6">Instituição Proponente</th>
              <th className="px-8 py-6">Data de Envio</th>
              <th className="px-8 py-6">Status</th>
              <th className="px-8 py-6 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredItems.map((p) => (
              <tr key={p.id} className="hover:bg-primary/5 transition-colors cursor-pointer group">
                <td className="px-8 py-7">
                  <div className="font-black text-foreground text-sm">{p.title}</div>
                </td>
                <td className="px-8 py-7">
                  <span className="text-xs font-bold text-primary">{p.osc}</span>
                </td>
                <td className="px-8 py-7">
                  <div className="flex items-center space-x-2 text-xs font-medium text-muted-foreground">
                    <Clock size={14} />
                    <span>{p.date}</span>
                  </div>
                </td>
                <td className="px-8 py-7">
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${getStatusStyle(p.status)}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-8 py-7 text-right">
                  <button 
                    onClick={() => handleView(p)}
                    className="p-3 bg-muted text-muted-foreground rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-16 text-center text-muted-foreground">
                  Nenhuma manifestação encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Cadastro */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-[2rem] p-6 md:p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-foreground">Nova PMIS</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Título da Manifestação *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Programa de Capacitação Jovem"
                  required
                  className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Instituição Proponente (OSC) *
                </label>
                <input
                  type="text"
                  value={formData.osc}
                  onChange={(e) => setFormData({ ...formData, osc: e.target.value })}
                  placeholder="Nome da OSC"
                  required
                  className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva a manifestação..."
                  rows={3}
                  className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20 resize-none text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Área de Atuação
                  </label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="Ex: Educação"
                    className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Público-Alvo
                  </label>
                  <input
                    type="text"
                    value={formData.publico}
                    onChange={(e) => setFormData({ ...formData, publico: e.target.value })}
                    placeholder="Ex: Jovens"
                    className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Objetivo
                </label>
                <input
                  type="text"
                  value={formData.objetivo}
                  onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                  placeholder="Objetivo principal"
                  className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Justificativa
                </label>
                <textarea
                  value={formData.justificativa}
                  onChange={(e) => setFormData({ ...formData, justificativa: e.target.value })}
                  placeholder="Justificativa da manifestação..."
                  rows={2}
                  className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20 resize-none text-foreground placeholder:text-muted-foreground"
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
                  {saving ? 'Salvando...' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {showViewModal && selectedPMIS && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-[2rem] p-6 md:p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-black text-foreground">{selectedPMIS.title}</h3>
                <p className="text-sm text-primary font-bold">{selectedPMIS.osc}</p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center p-4 bg-muted rounded-xl">
                <span className="text-xs font-black text-muted-foreground uppercase">Status Atual</span>
                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border ${getStatusStyle(selectedPMIS.status)}`}>
                  {selectedPMIS.status}
                </span>
              </div>

              {selectedPMIS.descricao && (
                <div className="p-4 bg-muted rounded-xl">
                  <span className="text-[10px] font-black text-muted-foreground uppercase block mb-2">Descrição</span>
                  <p className="text-sm text-foreground">{selectedPMIS.descricao}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedPMIS.area && (
                  <div className="p-4 bg-muted rounded-xl">
                    <span className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Área</span>
                    <p className="text-sm font-bold text-foreground">{selectedPMIS.area}</p>
                  </div>
                )}
                {selectedPMIS.publico && (
                  <div className="p-4 bg-muted rounded-xl">
                    <span className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Público-Alvo</span>
                    <p className="text-sm font-bold text-foreground">{selectedPMIS.publico}</p>
                  </div>
                )}
              </div>

              {selectedPMIS.objetivo && (
                <div className="p-4 bg-muted rounded-xl">
                  <span className="text-[10px] font-black text-muted-foreground uppercase block mb-2">Objetivo</span>
                  <p className="text-sm text-foreground">{selectedPMIS.objetivo}</p>
                </div>
              )}

              {selectedPMIS.justificativa && (
                <div className="p-4 bg-muted rounded-xl">
                  <span className="text-[10px] font-black text-muted-foreground uppercase block mb-2">Justificativa</span>
                  <p className="text-sm text-foreground">{selectedPMIS.justificativa}</p>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-6">
              <span className="text-[10px] font-black text-muted-foreground uppercase block mb-3">Alterar Status</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleUpdateStatus('Decidido')}
                  disabled={selectedPMIS.status === 'Decidido'}
                  className="py-3 bg-info/10 text-info border border-info/20 rounded-xl font-black text-[10px] uppercase hover:opacity-80 disabled:opacity-50 transition-all"
                >
                  Marcar como Decidido
                </button>
                <button
                  onClick={() => handleUpdateStatus('Publicado')}
                  disabled={selectedPMIS.status === 'Publicado'}
                  className="py-3 bg-success/10 text-success border border-success/20 rounded-xl font-black text-[10px] uppercase hover:opacity-80 disabled:opacity-50 transition-all"
                >
                  Publicar
                </button>
                <button
                  onClick={() => handleUpdateStatus('Análise')}
                  disabled={selectedPMIS.status === 'Análise'}
                  className="py-3 bg-warning/10 text-warning border border-warning/20 rounded-xl font-black text-[10px] uppercase hover:opacity-80 disabled:opacity-50 transition-all"
                >
                  Retornar Análise
                </button>
                <button
                  onClick={() => handleUpdateStatus('Rejeitado')}
                  disabled={selectedPMIS.status === 'Rejeitado'}
                  className="py-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl font-black text-[10px] uppercase hover:opacity-80 disabled:opacity-50 transition-all"
                >
                  Rejeitar
                </button>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="flex-1 py-4 bg-muted text-muted-foreground rounded-2xl font-black text-xs uppercase tracking-widest"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PMISModule;

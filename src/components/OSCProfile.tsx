import React, { useState } from 'react';
import { Users, Plus, AlertTriangle, Calendar, Search, X, Loader2, CheckCircle } from 'lucide-react';
import { useOSCs } from '@/hooks/useOSCs';

const OSCModule: React.FC = () => {
  const { oscs, loading, error, createOSC, updateOSC, deleteOSC } = useOSCs();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    cnpj: '',
    razao_social: '',
    status_cnd: 'regular',
    validade_cnd: '',
    logo_url: '',
  });
  const [saving, setSaving] = useState(false);

  const filteredOscs = oscs.filter(osc => 
    osc.razao_social.toLowerCase().includes(search.toLowerCase()) ||
    osc.cnpj.includes(search)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    await createOSC({
      cnpj: formData.cnpj,
      razao_social: formData.razao_social,
      status_cnd: formData.status_cnd || 'regular',
      validade_cnd: formData.validade_cnd || null,
      logo_url: formData.logo_url || null,
    });
    
    setFormData({ cnpj: '', razao_social: '', status_cnd: 'regular', validade_cnd: '', logo_url: '' });
    setShowModal(false);
    setSaving(false);
  };

  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'regular': return 'bg-success';
      case 'irregular': return 'bg-destructive shadow-lg shadow-destructive/30';
      case 'vencida': return 'bg-warning';
      default: return 'bg-muted-foreground';
    }
  };

  const isExpired = (date: string | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-primary uppercase tracking-widest mb-3">
            <Users size={14} />
            <span>Credenciamento Único • Unaí/MG (POC Items 23-25)</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter">Cadastro de OSCs</h2>
          <p className="text-muted-foreground font-medium italic">Habilitação digital com controle automático de vencimentos.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-6 md:px-8 py-4 bg-primary text-primary-foreground rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-xl flex items-center space-x-2 transition-all active:scale-95"
        >
          <Plus size={20} /> <span>Nova Inscrição</span>
        </button>
      </header>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por razão social ou CNPJ..."
          className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/10"
        />
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-2xl flex items-center gap-3">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* OSC Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filteredOscs.map((osc) => (
          <div key={osc.id} className="bg-card rounded-[2.5rem] md:rounded-[3.5rem] border border-border shadow-sm hover:shadow-2xl transition-all group p-6 md:p-10 relative overflow-hidden">
            {(osc.status_cnd === 'irregular' || isExpired(osc.validade_cnd)) && (
              <div className="absolute top-0 right-0 bg-destructive text-destructive-foreground px-4 md:px-6 py-2 rounded-bl-3xl flex items-center gap-2 animate-pulse">
                <AlertTriangle size={14} /> 
                <span className="text-[10px] font-black uppercase">
                  {osc.status_cnd === 'irregular' ? 'Irregular' : 'CND Vencida'}
                </span>
              </div>
            )}
            
            <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black text-xl md:text-2xl mb-6 md:mb-8 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              {osc.razao_social.charAt(0)}
            </div>
            
            <h3 className="text-xl md:text-2xl font-black text-foreground mb-2 leading-tight">{osc.razao_social}</h3>
            <p className="text-xs font-mono text-muted-foreground mb-6 md:mb-8">{osc.cnpj}</p>
            
            <div className="space-y-4 md:space-y-6 pt-4 md:pt-6 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-muted-foreground uppercase">Validade CND</span>
                <span className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Calendar size={14} className="text-primary" /> 
                  {osc.validade_cnd ? new Date(osc.validade_cnd).toLocaleDateString('pt-BR') : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-muted-foreground uppercase">Situação Fiscal</span>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(osc.status_cnd)}`}></div>
              </div>
            </div>

            <button className="w-full mt-6 md:mt-10 py-4 md:py-5 bg-muted text-muted-foreground rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all">
              Acessar Dossiê de Habilitação
            </button>
          </div>
        ))}

        {filteredOscs.length === 0 && !loading && (
          <div className="col-span-full text-center py-16">
            <Users className="mx-auto text-muted-foreground/30 mb-4" size={64} />
            <p className="text-muted-foreground font-medium">
              {search ? 'Nenhuma OSC encontrada com esses critérios.' : 'Nenhuma OSC cadastrada ainda.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Nova OSC */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-[2rem] p-6 md:p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-foreground">Nova OSC</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  CNPJ *
                </label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                  placeholder="00.000.000/0000-00"
                  required
                  className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Razão Social *
                </label>
                <input
                  type="text"
                  value={formData.razao_social}
                  onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                  placeholder="Nome completo da organização"
                  required
                  className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Status CND
                </label>
                <select
                  value={formData.status_cnd}
                  onChange={(e) => setFormData({ ...formData, status_cnd: e.target.value })}
                  className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20 appearance-none cursor-pointer"
                >
                  <option value="regular">Regular</option>
                  <option value="irregular">Irregular</option>
                  <option value="vencida">Vencida</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Validade CND
                </label>
                <input
                  type="date"
                  value={formData.validade_cnd}
                  onChange={(e) => setFormData({ ...formData, validade_cnd: e.target.value })}
                  className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20"
                />
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
                  disabled={saving}
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
    </div>
  );
};

export default OSCModule;

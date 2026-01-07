import React, { useState } from 'react';
import { 
  FileText, Plus, DollarSign, User, Clock, Scale, ChevronRight, 
  X, Loader2, Download, Filter, BarChart3, ArrowLeft, Edit, Trash2,
  AlertTriangle, CheckCircle
} from 'lucide-react';
import { useAmendments } from '@/hooks/useAmendments';
import { useOSCs } from '@/hooks/useOSCs';
import { usePartnerships } from '@/hooks/usePartnerships';

const AmendmentsModule: React.FC = () => {
  const { amendments, loading, createAmendment, updateAmendment, deleteAmendment, getStats } = useAmendments();
  const { oscs } = useOSCs();
  const { partnerships } = usePartnerships();
  
  const [showModal, setShowModal] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [selectedAmendment, setSelectedAmendment] = useState<typeof amendments[0] | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('');
  
  const [formData, setFormData] = useState({
    numero: '',
    autor: '',
    valor: '',
    ano: new Date().getFullYear().toString(),
    descricao: '',
    tipo: 'Impositiva',
    tipo_indicacao: 'Direta',
    prazo_legal: '',
    status: 'Pendente',
    osc_beneficiaria_id: '',
    partnership_id: '',
  });

  const stats = getStats();

  const resetForm = () => {
    setFormData({
      numero: '',
      autor: '',
      valor: '',
      ano: new Date().getFullYear().toString(),
      descricao: '',
      tipo: 'Impositiva',
      tipo_indicacao: 'Direta',
      prazo_legal: '',
      status: 'Pendente',
      osc_beneficiaria_id: '',
      partnership_id: '',
    });
    setSelectedAmendment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const amendmentData = {
      numero: formData.numero,
      autor: formData.autor,
      valor: parseFloat(formData.valor) || 0,
      ano: parseInt(formData.ano) || new Date().getFullYear(),
      descricao: formData.descricao || undefined,
      tipo: formData.tipo,
      tipo_indicacao: formData.tipo_indicacao,
      prazo_legal: formData.prazo_legal || undefined,
      status: formData.status,
      osc_beneficiaria_id: formData.osc_beneficiaria_id || undefined,
      partnership_id: formData.partnership_id || undefined,
    };

    if (selectedAmendment) {
      await updateAmendment(selectedAmendment.id, amendmentData);
    } else {
      await createAmendment(amendmentData);
    }

    resetForm();
    setShowModal(false);
    setSaving(false);
  };

  const handleEdit = (amendment: typeof amendments[0]) => {
    setSelectedAmendment(amendment);
    setFormData({
      numero: amendment.numero,
      autor: amendment.autor,
      valor: amendment.valor.toString(),
      ano: amendment.ano.toString(),
      descricao: amendment.descricao || '',
      tipo: amendment.tipo || 'Impositiva',
      tipo_indicacao: amendment.tipo_indicacao || 'Direta',
      prazo_legal: amendment.prazo_legal || '',
      status: amendment.status || 'Pendente',
      osc_beneficiaria_id: amendment.osc_beneficiaria_id || '',
      partnership_id: amendment.partnership_id || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta emenda?')) {
      await deleteAmendment(id);
    }
  };

  const filteredAmendments = amendments.filter(a => {
    if (filterStatus && a.status !== filterStatus) return false;
    if (filterYear && a.ano.toString() !== filterYear) return false;
    return true;
  });

  const exportToCSV = () => {
    const headers = ['Número', 'Autor', 'Valor', 'Ano', 'Tipo', 'Indicação', 'Status', 'OSC Beneficiária', 'Prazo Legal'];
    const rows = filteredAmendments.map(a => [
      a.numero,
      a.autor,
      a.valor.toString(),
      a.ano.toString(),
      a.tipo || '',
      a.tipo_indicacao || '',
      a.status || '',
      a.osc?.razao_social || '',
      a.prazo_legal || '',
    ]);
    
    const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `emendas_parlamentares_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const years = [...new Set(amendments.map(a => a.ano))].sort((a, b) => b - a);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showReport) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <header className="flex justify-between items-center">
          <button
            onClick={() => setShowReport(false)}
            className="flex items-center gap-2 text-primary font-black text-xs uppercase hover:bg-primary/10 px-4 py-2 rounded-xl transition-all"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          <button
            onClick={exportToCSV}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase flex items-center gap-2"
          >
            <Download size={16} /> Exportar CSV
          </button>
        </header>

        <div className="bg-card rounded-[3rem] p-8 shadow-xl border border-border">
          <h2 className="text-2xl font-black text-foreground mb-6">Relatório de Emendas Parlamentares</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="p-6 bg-muted rounded-2xl">
              <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Total Alocado</p>
              <p className="text-2xl font-black text-primary">R$ {stats.totalAlocado.toLocaleString('pt-BR')}</p>
            </div>
            <div className="p-6 bg-muted rounded-2xl">
              <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Executadas</p>
              <p className="text-2xl font-black text-success">{stats.executadas}</p>
            </div>
            <div className="p-6 bg-muted rounded-2xl">
              <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Vinculadas</p>
              <p className="text-2xl font-black text-info">{stats.vinculadas}</p>
            </div>
            <div className="p-6 bg-muted rounded-2xl">
              <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Pendentes</p>
              <p className="text-2xl font-black text-warning">{stats.pendentes}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-black text-foreground">Por Autor</h3>
            {Object.entries(
              filteredAmendments.reduce((acc, a) => {
                if (!acc[a.autor]) acc[a.autor] = { count: 0, valor: 0 };
                acc[a.autor].count++;
                acc[a.autor].valor += a.valor;
                return acc;
              }, {} as Record<string, { count: number; valor: number }>)
            ).map(([autor, data]) => (
              <div key={autor} className="flex justify-between items-center p-4 bg-muted/50 rounded-xl">
                <span className="font-bold text-foreground">{autor}</span>
                <div className="text-right">
                  <p className="font-black text-primary">R$ {data.valor.toLocaleString('pt-BR')}</p>
                  <p className="text-[10px] text-muted-foreground">{data.count} emenda(s)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-primary uppercase tracking-widest mb-3">
            <FileText size={14} />
            <span>Gestão Unaí/MG • Decreto 7.259/2023</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter">Emendas Parlamentares</h2>
          <p className="text-muted-foreground font-medium font-sans italic">"A transparência na execução da vontade do legislador."</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowReport(true)}
            className="px-6 py-4 bg-card border border-border text-foreground rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-muted flex items-center gap-2 transition-all"
          >
            <BarChart3 size={18} />
            <span className="hidden md:inline">Relatório</span>
          </button>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-6 md:px-8 py-4 bg-primary text-primary-foreground rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-xl shadow-primary/20 flex items-center space-x-2 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>Nova Indicação</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-card p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-border flex flex-col justify-between group hover:shadow-lg transition-all">
          <div className="p-3 md:p-4 bg-muted text-success rounded-2xl w-fit mb-4 md:mb-6">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Alocado</p>
            <h3 className="text-xl md:text-3xl font-black text-foreground">R$ {(stats.totalAlocado / 1000000).toFixed(2)}M</h3>
          </div>
        </div>
        <div className="bg-card p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-border flex flex-col justify-between group hover:shadow-lg transition-all">
          <div className="p-3 md:p-4 bg-muted text-info rounded-2xl w-fit mb-4 md:mb-6">
            <User size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Indiretas</p>
            <h3 className="text-xl md:text-3xl font-black text-foreground">{stats.indiretas.toString().padStart(2, '0')}</h3>
          </div>
        </div>
        <div className="bg-card p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-border flex flex-col justify-between group hover:shadow-lg transition-all">
          <div className="p-3 md:p-4 bg-muted text-destructive rounded-2xl w-fit mb-4 md:mb-6">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Prazos (LOM)</p>
            <h3 className="text-xl md:text-3xl font-black text-foreground">{stats.prazosProximos.toString().padStart(2, '0')}</h3>
          </div>
        </div>
        <div className="bg-card p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-border flex flex-col justify-between group hover:shadow-lg transition-all">
          <div className="p-3 md:p-4 bg-muted text-success rounded-2xl w-fit mb-4 md:mb-6">
            <Scale size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Executadas</p>
            <h3 className="text-xl md:text-3xl font-black text-foreground">{stats.executadas.toString().padStart(2, '0')}</h3>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter size={16} />
          <span className="text-xs font-bold uppercase">Filtros:</span>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-card border border-border rounded-xl text-sm appearance-none cursor-pointer"
        >
          <option value="">Todos os Status</option>
          <option value="Pendente">Pendente</option>
          <option value="Vinculada">Vinculada</option>
          <option value="Executada">Executada</option>
        </select>
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="px-4 py-2 bg-card border border-border rounded-xl text-sm appearance-none cursor-pointer"
        >
          <option value="">Todos os Anos</option>
          {years.map(year => (
            <option key={year} value={year.toString()}>{year}</option>
          ))}
        </select>
        {(filterStatus || filterYear) && (
          <button
            onClick={() => { setFilterStatus(''); setFilterYear(''); }}
            className="text-xs text-primary font-bold hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {filteredAmendments.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-[3rem] border border-border">
          <FileText className="mx-auto text-muted-foreground/30 mb-4" size={64} />
          <p className="text-muted-foreground font-medium">Nenhuma emenda encontrada.</p>
        </div>
      ) : (
        <div className="bg-card rounded-[2rem] md:rounded-[3.5rem] shadow-xl border border-border overflow-hidden overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-muted/50 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 md:px-8 py-4 md:py-6">Emenda / Autor</th>
                <th className="px-6 md:px-8 py-4 md:py-6">Tipo</th>
                <th className="px-6 md:px-8 py-4 md:py-6">Beneficiária (OSC)</th>
                <th className="px-6 md:px-8 py-4 md:py-6">Valor</th>
                <th className="px-6 md:px-8 py-4 md:py-6">Status</th>
                <th className="px-6 md:px-8 py-4 md:py-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAmendments.map((a) => (
                <tr key={a.id} className="hover:bg-primary/5 transition-colors">
                  <td className="px-6 md:px-8 py-6 md:py-8">
                    <div className="font-black text-foreground">{a.numero}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">{a.autor}</div>
                  </td>
                  <td className="px-6 md:px-8 py-6 md:py-8">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${
                      a.tipo_indicacao === 'Direta' ? 'bg-info/10 text-info' : 'bg-warning/10 text-warning'
                    }`}>
                      {a.tipo_indicacao}
                    </span>
                  </td>
                  <td className="px-6 md:px-8 py-6 md:py-8 text-xs font-bold text-muted-foreground italic">
                    {a.osc?.razao_social || 'Aguardando Indicação'}
                  </td>
                  <td className="px-6 md:px-8 py-6 md:py-8 font-black text-primary">
                    R$ {a.valor.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 md:px-8 py-6 md:py-8">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 w-fit ${
                      a.status === 'Executada' ? 'bg-success/10 text-success' :
                      a.status === 'Vinculada' ? 'bg-info/10 text-info' :
                      'bg-warning/10 text-warning'
                    }`}>
                      {a.status === 'Executada' && <CheckCircle size={12} />}
                      {a.status === 'Pendente' && <AlertTriangle size={12} />}
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 md:px-8 py-6 md:py-8 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleEdit(a)}
                        className="p-2 md:p-3 bg-muted text-muted-foreground rounded-xl hover:bg-info hover:text-info-foreground transition-all"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-2 md:p-3 bg-muted text-muted-foreground rounded-xl hover:bg-destructive hover:text-destructive-foreground transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-[2rem] p-6 md:p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-foreground">
                {selectedAmendment ? 'Editar Emenda' : 'Nova Emenda'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Número *
                  </label>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    placeholder="Ex: 001/2024"
                    required
                    className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Ano *
                  </label>
                  <input
                    type="number"
                    value={formData.ano}
                    onChange={(e) => setFormData({ ...formData, ano: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Autor/Parlamentar *
                </label>
                <input
                  type="text"
                  value={formData.autor}
                  onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
                  placeholder="Ex: Ver. Maria Silva"
                  required
                  className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Valor (R$) *
                </label>
                <input
                  type="number"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  placeholder="0,00"
                  step="0.01"
                  required
                  className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição do objetivo da emenda..."
                  rows={2}
                  className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Tipo
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20 appearance-none cursor-pointer"
                  >
                    <option value="Impositiva">Impositiva</option>
                    <option value="Ordinária">Ordinária</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Indicação
                  </label>
                  <select
                    value={formData.tipo_indicacao}
                    onChange={(e) => setFormData({ ...formData, tipo_indicacao: e.target.value })}
                    className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20 appearance-none cursor-pointer"
                  >
                    <option value="Direta">Direta</option>
                    <option value="Indireta">Indireta</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20 appearance-none cursor-pointer"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Vinculada">Vinculada</option>
                    <option value="Executada">Executada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Prazo Legal
                  </label>
                  <input
                    type="date"
                    value={formData.prazo_legal}
                    onChange={(e) => setFormData({ ...formData, prazo_legal: e.target.value })}
                    className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  OSC Beneficiária
                </label>
                <select
                  value={formData.osc_beneficiaria_id}
                  onChange={(e) => setFormData({ ...formData, osc_beneficiaria_id: e.target.value })}
                  className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20 appearance-none cursor-pointer"
                >
                  <option value="">Sem OSC vinculada</option>
                  {oscs.map(osc => (
                    <option key={osc.id} value={osc.id}>{osc.razao_social}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Parceria Vinculada
                </label>
                <select
                  value={formData.partnership_id}
                  onChange={(e) => setFormData({ ...formData, partnership_id: e.target.value })}
                  className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20 appearance-none cursor-pointer"
                >
                  <option value="">Sem parceria vinculada</option>
                  {partnerships.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.numero_termo || 'S/N'} - {p.osc?.razao_social}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 bg-muted text-muted-foreground rounded-2xl font-bold text-sm hover:bg-muted/80 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-sm shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="animate-spin" size={16} />}
                  {selectedAmendment ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmendmentsModule;

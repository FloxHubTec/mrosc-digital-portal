
import React from 'react';
import { Megaphone, Plus, Search, FileText, Filter, ChevronRight, Clock } from 'lucide-react';

const ChamamentoModule: React.FC = () => {
  const chamamentos = [
    { id: '1', number: '001/2023', object: 'Apoio a projetos de contraturno escolar', status: 'Aberto', deadline: '20/11/2023', category: 'Educação' },
    { id: '2', number: '005/2023', object: 'Castração em massa e proteção animal', status: 'Em Julgamento', deadline: '10/10/2023', category: 'Meio Ambiente' },
    { id: '3', number: '008/2023', object: 'Oficinas de artes plásticas e música', status: 'Homologado', deadline: '15/09/2023', category: 'Cultura' },
  ];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-primary uppercase tracking-widest mb-3">
            <Megaphone size={14} />
            <span>Processos de Seleção Pública</span>
          </div>
          <h2 className="text-4xl font-black text-foreground tracking-tighter">Chamamentos e Editais</h2>
          <p className="text-muted-foreground font-medium">Gestão do fluxo seletivo conforme Art. 23 da Lei 13.019/14.</p>
        </div>
        <button className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-xl shadow-primary/20 flex items-center space-x-2 transition-all active:scale-95">
          <Plus size={18} />
          <span>Novo Edital</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Editais Ativos', 'Propostas em Análise', 'Prazos de Recurso'].map((item, i) => (
          <div key={i} className="bg-card p-6 rounded-3xl border border-border shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item}</p>
              <h4 className="text-2xl font-black text-foreground">0{i+2}</h4>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <FileText size={20} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-[2.5rem] shadow-xl shadow-muted/50 border border-border overflow-hidden">
        <div className="p-8 border-b border-border flex justify-between items-center bg-muted/20">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder="Pesquisar edital..." 
              className="pl-12 pr-6 py-3 bg-card border border-border rounded-2xl text-xs outline-none focus:ring-4 focus:ring-primary/10 w-64"
            />
          </div>
          <div className="flex space-x-2">
            <button className="p-3 text-muted-foreground hover:text-primary transition-colors"><Filter size={18} /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/50 text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6">Nº Edital / Categoria</th>
                <th className="px-8 py-6">Objeto da Seleção</th>
                <th className="px-8 py-6">Status Atual</th>
                <th className="px-8 py-6">Prazo Final</th>
                <th className="px-8 py-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {chamamentos.map((c) => (
                <tr key={c.id} className="group hover:bg-primary/5 transition-all cursor-pointer">
                  <td className="px-8 py-7">
                    <div className="font-black text-primary text-sm">{c.number}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase mt-1">{c.category}</div>
                  </td>
                  <td className="px-8 py-7">
                    <p className="text-xs font-medium text-muted-foreground max-w-xs leading-relaxed">{c.object}</p>
                  </td>
                  <td className="px-8 py-7">
                    <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase border ${
                      c.status === 'Aberto' ? 'bg-success/10 text-success border-success/20' : 
                      c.status === 'Em Julgamento' ? 'bg-warning/10 text-warning border-warning/20' : 'bg-info/10 text-info border-info/20'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-8 py-7">
                    <div className="flex items-center space-x-2 text-xs font-bold text-foreground">
                      <Clock size={14} className="text-muted-foreground" />
                      <span>{c.deadline}</span>
                    </div>
                  </td>
                  <td className="px-8 py-7 text-right">
                    <button className="p-3 bg-muted text-muted-foreground rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChamamentoModule;


import React, { useState } from 'react';
import { BookOpen, Search, ChevronRight, Edit3, Settings, ShieldCheck } from 'lucide-react';

const ManualModule: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const topics = [
    { id: '1', title: 'Processamento de Emendas Parlamentares', category: 'Operacional', icon: Settings },
    { id: '2', title: 'Prestação de Contas (REO/REFF)', category: 'Compliance', icon: ShieldCheck },
    { id: '3', title: 'Chamamento e Seleção Pública', category: 'Fluxo Legal', icon: BookOpen },
    { id: '4', title: 'Manual Master da Prefeitura', category: 'Admin', icon: Edit3 },
  ];

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-primary uppercase tracking-widest mb-3">
            <BookOpen size={14} />
            <span>Capacitação e Suporte (Itens 17 e 18 POC)</span>
          </div>
          <h2 className="text-4xl font-black text-foreground tracking-tighter">Manual do Sistema</h2>
          <p className="text-muted-foreground font-medium">Instruções de uso editáveis pelo Administrador Master.</p>
        </div>
        <div className="flex gap-3">
           <button className="px-6 py-3 bg-card border border-border rounded-2xl font-black text-xs uppercase hover:bg-muted transition-all">Editar Manual</button>
           <button className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase shadow-xl">Baixar em PDF</button>
        </div>
      </header>

      <div className="relative mb-12">
        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-primary" size={24} />
        <input type="text" placeholder="Pesquisar instrução ou base legal..." className="w-full pl-20 pr-8 py-10 bg-card rounded-[3rem] text-xl font-medium shadow-xl border-none outline-none focus:ring-8 focus:ring-primary/10 transition-all" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {topics.map((t) => (
          <div key={t.id} className="bg-card p-12 rounded-[4rem] border border-border shadow-sm hover:shadow-xl transition-all cursor-pointer group">
             <div className="flex items-center gap-6 mb-8">
                <div className="p-5 bg-primary/10 text-primary rounded-[2rem] group-hover:scale-110 transition-transform">
                   <t.icon size={32} />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-foreground tracking-tight">{t.title}</h3>
                   <span className="text-[10px] font-black text-primary uppercase tracking-widest">{t.category}</span>
                </div>
             </div>
             <p className="text-sm text-muted-foreground font-medium mb-10 leading-relaxed">Instruções detalhadas sobre como operar o módulo de {t.title.toLowerCase()} em conformidade com as exigências da Controladoria Geral do Município.</p>
             <button className="flex items-center gap-2 text-[10px] font-black text-primary uppercase group-hover:translate-x-2 transition-transform">
                Acessar Guia Passo a Passo <ChevronRight size={14} />
             </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManualModule;

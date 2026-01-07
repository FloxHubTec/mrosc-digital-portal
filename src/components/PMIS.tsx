
import React from 'react';
import { Briefcase, Plus, Clock, Eye } from 'lucide-react';

const PMISModule: React.FC = () => {
  const items = [
    { id: '1', title: 'Educação para Jovens em Risco', osc: 'OSC Vida Nova', date: '20/10/2023', status: 'Análise' },
    { id: '2', title: 'Horta Comunitária Zona Sul', osc: 'Verde Cidade', date: '15/10/2023', status: 'Decidido' },
    { id: '3', title: 'Apoio a Idosos Abandonados', osc: 'Assoc. Terceira Idade', date: '10/10/2023', status: 'Publicado' },
  ];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-primary uppercase tracking-widest mb-3"><Briefcase size={14} /><span>Participação Social e Iniciativa OSC</span></div>
          <h2 className="text-4xl font-black text-foreground tracking-tighter">PMIS</h2>
          <p className="text-muted-foreground font-medium">Procedimento de Manifestação de Interesse Social (Art. 18 Lei 13.019/14).</p>
        </div>
        <button className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-xl flex items-center space-x-2"><Plus size={18} /><span>Cadastrar PMIS</span></button>
      </header>

      <div className="bg-card rounded-[2.5rem] shadow-xl border border-border overflow-hidden">
        <div className="p-8 bg-muted border-b border-border flex justify-between items-center">
          <h4 className="text-lg font-black text-foreground">Propostas Recebidas</h4>
          <div className="px-4 py-2 bg-info/10 text-info rounded-xl text-[10px] font-black uppercase tracking-widest border border-info/20">03 Novas Propostas</div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-card text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
            <tr><th className="px-8 py-6">Título da Manifestação</th><th className="px-8 py-6">Instituição Proponente</th><th className="px-8 py-6">Data de Envio</th><th className="px-8 py-6">Status</th><th className="px-8 py-6 text-right">Ação</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((p) => (
              <tr key={p.id} className="hover:bg-primary/5 transition-colors cursor-pointer group">
                <td className="px-8 py-7"><div className="font-black text-foreground text-sm">{p.title}</div></td>
                <td className="px-8 py-7"><span className="text-xs font-bold text-primary">{p.osc}</span></td>
                <td className="px-8 py-7"><div className="flex items-center space-x-2 text-xs font-medium text-muted-foreground"><Clock size={14} /><span>{p.date}</span></div></td>
                <td className="px-8 py-7"><span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${p.status === 'Análise' ? 'bg-warning/10 text-warning border-warning/20' : p.status === 'Decidido' ? 'bg-info/10 text-info border-info/20' : 'bg-success/10 text-success border-success/20'}`}>{p.status}</span></td>
                <td className="px-8 py-7 text-right"><button className="p-3 bg-muted text-muted-foreground rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all"><Eye size={18} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PMISModule;

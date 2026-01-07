
import React, { useState } from 'react';
import { Plus, Eye, FileSignature, ArrowLeft, Edit, CheckCircle, ClipboardList, AlertTriangle } from 'lucide-react';
import { PartnershipStatus, Partnership, UserRole } from '../types';
import { User } from '../services/authContext';
import WorkPlanEditor from './WorkPlanEditor';

interface PartnershipsProps { user: User; }

const StatusBadge = ({ status }: { status: PartnershipStatus }) => {
  const styles: Record<string, string> = {
    [PartnershipStatus.EXECUTION]: 'bg-info/10 text-info border-info/20',
    [PartnershipStatus.PLANNING]: 'bg-muted text-muted-foreground border-border',
    [PartnershipStatus.CELEBRATION]: 'bg-primary/10 text-primary border-primary/20',
    [PartnershipStatus.ACCOUNTABILITY]: 'bg-warning/10 text-warning border-warning/20',
    [PartnershipStatus.CONCLUDED]: 'bg-success/10 text-success border-success/20',
  };
  return (
    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border tracking-widest ${styles[status] || 'bg-muted'}`}>
      {status}
    </span>
  );
};

const PartnershipsModule: React.FC<PartnershipsProps> = ({ user }) => {
  const [selectedPartnership, setSelectedPartnership] = useState<Partnership | null>(null);
  const [view, setView] = useState<'list' | 'detail' | 'create'>('list');

  const mockPartnerships: Partnership[] = [
    { id: '1', title: 'Projeto Sopa Amiga - Distribuição Alimentar', oscId: 'osc_01', type: 'Termo de Fomento', status: PartnershipStatus.EXECUTION, totalValue: 250000, startDate: '2023-01-01', endDate: '2023-12-31', workPlanVersion: 1, goals: [{ id: 'g1', description: 'Distribuição de refeições', target: '12000', progress: 65, status: 'Em Andamento' }], tranches: [] },
    { id: '2', title: 'Escola de Artes - Município Criativo', oscId: 'osc_02', type: 'Termo de Colaboração', status: PartnershipStatus.CELEBRATION, totalValue: 120000, startDate: '2023-06-01', endDate: '2024-06-01', workPlanVersion: 2, goals: [], tranches: [] }
  ];

  if (view === 'create') return <WorkPlanEditor onBack={() => setView('list')} />;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {view === 'list' ? (
        <>
          <header className="flex justify-between items-end">
            <div>
              <div className="flex items-center space-x-3 text-[10px] font-black text-primary uppercase tracking-widest mb-3">
                <FileSignature size={14} />
                <span>Gestão Unaí/MG • Registro de Parcerias</span>
              </div>
              <h2 className="text-5xl font-black text-foreground tracking-tighter">Instrumentos MROSC</h2>
            </div>
            <button onClick={() => setView('create')} className="px-8 py-5 bg-primary text-primary-foreground rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:opacity-90 shadow-2xl shadow-primary/20 flex items-center gap-3 transition-all active:scale-95">
              <Plus size={20} /> Nova Parceria
            </button>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mockPartnerships.map(p => (
              <div key={p.id} onClick={() => { setSelectedPartnership(p); setView('detail'); }} className="bg-card p-12 rounded-[4rem] border border-border shadow-sm hover:shadow-2xl transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-8">
                  <StatusBadge status={p.status} />
                  <div className="p-3 bg-muted text-muted-foreground rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-all"><Eye size={20} /></div>
                </div>
                <h4 className="text-2xl font-black text-foreground mb-4 tracking-tight leading-tight">{p.title}</h4>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-10">{p.type}</p>
                <div className="flex justify-between items-center pt-8 border-t border-border">
                   <div className="space-y-1"><span className="text-[9px] font-black text-primary uppercase tracking-widest">Valor Global</span><div className="font-black text-foreground">R$ {p.totalValue.toLocaleString()}</div></div>
                   <div className="text-right space-y-1"><span className="text-[9px] font-black text-primary uppercase tracking-widest">Versão</span><div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">V0{p.workPlanVersion}</div></div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-10 animate-in slide-in-from-right duration-500 pb-20">
           <div className="flex justify-between items-center">
              <button onClick={() => setView('list')} className="flex items-center gap-3 text-primary font-black text-[10px] uppercase tracking-widest px-6 py-3 bg-card rounded-2xl border border-border shadow-sm hover:bg-primary/10 transition-all"><ArrowLeft size={16} /> Voltar</button>
              <div className="flex gap-4">
                 <button className="px-6 py-3 bg-info/10 text-info rounded-xl font-black text-[10px] uppercase flex items-center gap-2"><Edit size={16} /> Editar</button>
                 <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-black text-[10px] uppercase shadow-lg">Baixar Instrumento</button>
              </div>
           </div>
           <div className="bg-card p-12 rounded-[4rem] shadow-2xl border border-border">
              <div className="flex items-center gap-8 mb-12">
                 <div className="w-20 h-20 bg-primary text-primary-foreground rounded-[2rem] flex items-center justify-center font-black text-3xl shadow-xl">{selectedPartnership?.title.charAt(0)}</div>
                 <div>
                    <h3 className="text-3xl font-black text-foreground tracking-tighter">{selectedPartnership?.title}</h3>
                    <p className="text-xs text-primary font-bold uppercase tracking-widest mt-2">{selectedPartnership?.type} • ID #PRT-00{selectedPartnership?.id}</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="p-8 bg-muted rounded-[2.5rem] border border-border"><CheckCircle className="text-primary mb-4" size={24} /><h5 className="text-[10px] font-black text-muted-foreground uppercase mb-2">Execução Física</h5><p className="text-xl font-black text-foreground">65% Concluído</p></div>
                 <div className="p-8 bg-muted rounded-[2.5rem] border border-border"><ClipboardList className="text-info mb-4" size={24} /><h5 className="text-[10px] font-black text-muted-foreground uppercase mb-2">Status Contas</h5><p className="text-xl font-black text-foreground">Em Análise</p></div>
                 <div className="p-8 bg-warning/10 rounded-[2.5rem] border border-warning/20"><AlertTriangle className="text-warning mb-4" size={24} /><h5 className="text-[10px] font-black text-muted-foreground uppercase mb-2">Vigência</h5><p className="text-xl font-black text-foreground">62 Dias Restantes</p></div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PartnershipsModule;

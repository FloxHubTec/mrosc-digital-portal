
import React, { useState } from 'react';
import { Users, Plus, AlertTriangle, Calendar } from 'lucide-react';
import { OSC, OSCStatus } from '../types';

const OSCModule: React.FC = () => {
  const [oscs, setOscs] = useState<OSC[]>([
    { id: '1', name: 'Instituto Futuro Melhor', cnpj: '12.345.678/0001-90', status: OSCStatus.REGULAR, lastUpdate: '01/10/2023', email: 'adm@futuro.org', phone: '(38) 3677-1234', cnds: [] },
    { id: '2', name: 'Assoc. Comunitária Unaí', cnpj: '98.765.432/0001-11', status: OSCStatus.EXPIRED_CND, lastUpdate: '15/09/2023', email: 'contato@unai.org', phone: '(38) 3677-4321', cnds: [] },
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-primary uppercase tracking-widest mb-3">
            <Users size={14} />
            <span>Credenciamento Único • Unaí/MG (Item 24 POC)</span>
          </div>
          <h2 className="text-4xl font-black text-foreground tracking-tighter">Cadastro de OSCs</h2>
          <p className="text-muted-foreground font-medium italic">Habilitação digital com controle automático de vencimentos.</p>
        </div>
        <button className="px-8 py-4 bg-primary text-primary-foreground rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-xl flex items-center space-x-2 transition-all active:scale-95">
          <Plus size={20} /> <span>Nova Inscrição</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {oscs.map((osc) => (
          <div key={osc.id} className="bg-card rounded-[3.5rem] border border-border shadow-sm hover:shadow-2xl transition-all group p-10 relative overflow-hidden">
            {osc.status === OSCStatus.EXPIRED_CND && (
              <div className="absolute top-0 right-0 bg-destructive text-destructive-foreground px-6 py-2 rounded-bl-3xl flex items-center gap-2 animate-pulse">
                <AlertTriangle size={14} /> <span className="text-[10px] font-black uppercase">Vencimento Detectado</span>
              </div>
            )}
            
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black text-2xl mb-8 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              {osc.name.charAt(0)}
            </div>
            
            <h3 className="text-2xl font-black text-foreground mb-2 leading-tight">{osc.name}</h3>
            <p className="text-xs font-mono text-muted-foreground mb-8">{osc.cnpj}</p>
            
            <div className="space-y-6 pt-6 border-t border-border">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-muted-foreground uppercase">Validade Mandato</span>
                  <span className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Calendar size={14} className="text-primary" /> 12/2024
                  </span>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-muted-foreground uppercase">Situação Fiscal</span>
                  <div className={`w-3 h-3 rounded-full ${osc.status === OSCStatus.REGULAR ? 'bg-success' : 'bg-destructive shadow-lg shadow-destructive/30'}`}></div>
               </div>
            </div>

            <button className="w-full mt-10 py-5 bg-muted text-muted-foreground rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all">
              Acessar Dossiê de Habilitação
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OSCModule;

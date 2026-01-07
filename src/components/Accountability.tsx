
import React, { useState } from 'react';
import { ClipboardList, Camera, CheckCircle2, XCircle, CreditCard } from 'lucide-react';
import { User } from '../services/authContext';

interface AccountabilityProps { user: User; }

const AccountabilityModule: React.FC<AccountabilityProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'REO' | 'REFF'>('REO');

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-primary uppercase tracking-widest mb-3">
            <ClipboardList size={14} />
            <span>Processamento Integral POC Item 33</span>
          </div>
          <h2 className="text-4xl font-black text-foreground tracking-tighter">Compliance de Contas</h2>
          <p className="text-muted-foreground font-medium italic">Monitoramento eletrônico de Objeto e Financeiro (REO/REFF).</p>
        </div>
      </header>

      <div className="flex bg-card p-2 rounded-3xl shadow-sm border border-border w-fit">
        <button 
          onClick={() => setActiveTab('REO')}
          className={`px-8 py-4 rounded-2xl text-xs font-black uppercase transition-all ${activeTab === 'REO' ? 'bg-primary text-primary-foreground shadow-xl' : 'text-muted-foreground hover:text-primary'}`}
        >
          REO (Execução Objeto)
        </button>
        <button 
          onClick={() => setActiveTab('REFF')}
          className={`px-8 py-4 rounded-2xl text-xs font-black uppercase transition-all ${activeTab === 'REFF' ? 'bg-primary text-primary-foreground shadow-xl' : 'text-muted-foreground hover:text-primary'}`}
        >
          REFF (Financeiro)
        </button>
      </div>

      <div className="bg-card rounded-[4rem] shadow-2xl border border-border overflow-hidden">
        {activeTab === 'REO' ? (
          <div className="p-12 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="p-10 border-2 border-dashed border-border rounded-[3rem] bg-muted/50 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                    <Camera size={32} />
                  </div>
                  <h4 className="text-xl font-black text-foreground mb-2">Evidências Fotográficas</h4>
                  <p className="text-xs text-muted-foreground font-medium mb-6">Insira fotos do evento, listas de presença e relatórios de atividades.</p>
                  <button className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-[10px] uppercase">Upload de Arquivos</button>
               </div>
               <div className="space-y-6">
                  <h4 className="text-xl font-black text-foreground">Histórico de Metas</h4>
                  {[1, 2].map(i => (
                    <div key={i} className="p-6 bg-muted rounded-3xl flex items-center justify-between border border-border">
                       <div className="flex items-center gap-4">
                          <CheckCircle2 className="text-success" size={24} />
                          <div>
                             <p className="text-[10px] font-black text-muted-foreground uppercase">Meta 0{i}</p>
                             <p className="text-sm font-bold text-foreground">Oficina de {i === 1 ? 'Música' : 'Teatro'}</p>
                          </div>
                       </div>
                       <span className="text-xs font-black text-primary">100% OK</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-sidebar-background text-sidebar-foreground/70 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-7">Despesa / Doc Fiscal</th>
                  <th className="px-8 py-7">Categoria</th>
                  <th className="px-8 py-7">Valor</th>
                  <th className="px-8 py-7">Conciliação</th>
                  <th className="px-8 py-7 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { desc: 'Folha Pagamento Dezembro', doc: 'NF-9821', cat: 'Recursos Humanos', val: 'R$ 12.400,00', alert: false },
                  { desc: 'Material de Limpeza', doc: 'NF-0122', cat: 'Custeio', val: 'R$ 850,00', alert: true },
                ].map((item, i) => (
                  <tr key={i} className="hover:bg-muted transition-colors">
                    <td className="px-8 py-8">
                      <div className="font-black text-foreground">{item.desc}</div>
                      <div className="text-[10px] font-bold text-muted-foreground">{item.doc}</div>
                    </td>
                    <td className="px-8 py-8">
                      <span className="px-3 py-1 bg-muted text-muted-foreground rounded-lg text-[9px] font-black uppercase">{item.cat}</span>
                    </td>
                    <td className="px-8 py-8 font-black text-primary">{item.val}</td>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-2 text-xs font-bold text-success">
                        <CreditCard size={14} /> Conciliado
                      </div>
                    </td>
                    <td className="px-8 py-8 text-right">
                       <div className="flex justify-end gap-2">
                          <button className="p-3 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive hover:text-destructive-foreground transition-all" title="Glosar Despesa">
                            <XCircle size={18} />
                          </button>
                          <button className="p-3 bg-success/10 text-success rounded-xl hover:bg-success hover:text-success-foreground transition-all">
                            <CheckCircle2 size={18} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountabilityModule;

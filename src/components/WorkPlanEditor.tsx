
import React, { useState } from 'react';
import { Save, Plus, Trash2, ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';

const WorkPlanEditor: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-500">
      <header className="flex justify-between items-end">
        <div className="flex items-center gap-6">
           <button onClick={onBack} className="p-4 bg-card rounded-2xl border border-border text-primary hover:bg-primary/10 transition-all"><ArrowLeft size={20} /></button>
           <div>
              <h2 className="text-3xl font-black text-foreground tracking-tighter">Novo Plano de Trabalho</h2>
              <p className="text-muted-foreground font-medium italic">"Modelo Padrão MROSC Unaí/MG"</p>
           </div>
        </div>
        <div className="flex gap-4">
           <button className="px-8 py-4 bg-info/10 text-info rounded-2xl font-black text-[10px] uppercase flex items-center gap-3"><Sparkles size={16} /> Sugestão por IA</button>
           <button className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-[10px] uppercase shadow-2xl flex items-center gap-3"><Save size={16} /> Finalizar e Enviar</button>
        </div>
      </header>

      <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide">
         {['1. Identificação', '2. Objeto e Justificativa', '3. Metas e Indicadores', '4. Cronograma Financeiro', '5. Anexos Técnicos'].map((step, i) => (
            <div key={i} onClick={() => setActiveStep(i+1)} className={`shrink-0 px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest cursor-pointer transition-all border-2 ${activeStep === i+1 ? 'bg-primary text-primary-foreground border-primary shadow-xl' : 'bg-card text-muted-foreground border-border hover:border-primary/30'}`}>
               {step}
            </div>
         ))}
      </div>

      <div className="bg-card rounded-[4rem] shadow-2xl border border-border p-16 relative">
         <div className="absolute top-12 right-16 flex items-center gap-3 grayscale opacity-40">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center font-black text-[10px]">BRS</div>
            <span className="text-[9px] font-black uppercase text-muted-foreground">Brasão de Unaí</span>
         </div>

         {activeStep === 1 && (
            <div className="space-y-12 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Nome da Instituição</label>
                     <input type="text" className="w-full p-6 bg-muted rounded-3xl border-none outline-none font-bold text-foreground focus:ring-4 focus:ring-primary/10 transition-all" defaultValue="Instituto Futuro Melhor" />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">CNPJ Oficial</label>
                     <input type="text" className="w-full p-6 bg-muted rounded-3xl border-none outline-none font-bold text-foreground" defaultValue="12.345.678/0001-90" />
                  </div>
               </div>
               <div className="p-8 bg-warning/10 rounded-3xl border border-warning/20 flex items-start gap-4">
                  <CheckCircle className="text-warning shrink-0" size={24} />
                  <p className="text-xs text-warning font-medium">Os dados acima foram importados do Cadastro Único da OSC. Caso estejam desatualizados, realize a alteração no módulo de Registro.</p>
               </div>
            </div>
         )}

         {activeStep === 3 && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <div className="flex justify-between items-center">
                  <h4 className="text-2xl font-black text-foreground tracking-tighter">Detalhamento de Metas</h4>
                  <button className="p-4 bg-primary/10 text-primary rounded-2xl hover:bg-primary hover:text-primary-foreground transition-all"><Plus size={24} /></button>
               </div>
               <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="p-8 bg-muted rounded-[2.5rem] border border-border flex items-center justify-between">
                       <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center font-black text-primary shadow-sm">0{i}</div>
                          <div>
                             <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Descrição da Meta</p>
                             <p className="font-bold text-foreground">Oficina de Capacitação em {i === 1 ? 'Música' : 'Teatro'}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-12">
                          <div className="text-right">
                             <p className="text-[10px] font-black text-muted-foreground uppercase">Indicador</p>
                             <p className="text-xs font-bold">Aulas Realizadas</p>
                          </div>
                          <button className="p-3 text-destructive/30 hover:text-destructive transition-colors"><Trash2 size={20} /></button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         )}
      </div>
    </div>
  );
};

export default WorkPlanEditor;

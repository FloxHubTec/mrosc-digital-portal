import React from 'react';
import { Search, ChevronRight, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const TransparencyPortal: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground pt-12 pb-32 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter">PORTAL<span className="text-primary-foreground/80">MROSC</span></h1>
            <p className="text-[10px] font-bold text-primary-foreground/70 uppercase tracking-widest">Prefeitura Municipal de Unaí/MG</p>
          </div>
          <Link to="/" className="text-xs font-black uppercase tracking-widest bg-primary-foreground/10 px-4 py-2 rounded-xl hover:bg-primary-foreground/20 text-primary-foreground">Acesso Restrito</Link>
        </div>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-6 text-primary-foreground">Transparência nas Parcerias</h2>
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" size={24} />
            <input 
              type="text" 
              placeholder="Pesquisar OSC, CNPJ ou Objeto..." 
              className="w-full pl-16 pr-6 py-5 rounded-3xl text-foreground bg-card shadow-xl border-none outline-none focus:ring-4 focus:ring-primary/20" 
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 -mt-16 space-y-12 pb-24">
        <section className="bg-card rounded-[3rem] shadow-2xl overflow-hidden border border-border">
          <div className="p-10 border-b border-border flex justify-between items-center bg-muted/50">
            <div>
              <h3 className="text-2xl font-black text-foreground tracking-tight italic">Extrato de Parcerias (Art. 38 Lei 13.019/14)</h3>
              <p className="text-sm text-muted-foreground font-medium">Dados atualizados em tempo real conforme exigência legal.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/30 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-6">Parceira / CNPJ</th>
                  <th className="px-8 py-6">Tipo / Objeto</th>
                  <th className="px-6 py-6 text-center">Valor / Repasses</th>
                  <th className="px-6 py-6 text-center">Situação Contas</th>
                  <th className="px-8 py-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { osc: 'Inst. Unaí Forte', cnpj: '12.345.678/0001-01', type: 'Termo de Fomento', obj: 'Alimentação Escolar Rural', val: 'R$ 250.000,00', status: 'Aprovada' },
                  { osc: 'Assoc. Vida Plena', cnpj: '98.765.432/0001-99', type: 'Termo de Colaboração', obj: 'Oficinas de Música', val: 'R$ 85.000,00', status: 'Em Análise' },
                  { osc: 'Creche Raio de Sol', cnpj: '45.123.789/0001-44', type: 'Termo de Fomento', obj: 'Manutenção de Berçário', val: 'R$ 150.000,00', status: 'Aprovada com Ressalvas' }
                ].map((p, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-all cursor-pointer">
                    <td className="px-8 py-7">
                      <div className="font-black text-foreground">{p.osc}</div>
                      <div className="text-[10px] font-bold text-muted-foreground font-mono">{p.cnpj}</div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="text-xs font-bold text-primary">{p.type}</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-1">{p.obj}</div>
                    </td>
                    <td className="px-6 py-7 text-center">
                      <div className="font-black text-foreground text-sm">{p.val}</div>
                      <div className="text-[9px] font-bold text-green-600 uppercase">100% Repassado</div>
                    </td>
                    <td className="px-6 py-7 text-center">
                      <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase border ${
                        p.status === 'Aprovada' 
                          ? 'bg-green-100 text-green-700 border-green-200' 
                          : p.status === 'Em Análise' 
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-200' 
                            : 'bg-blue-100 text-blue-700 border-blue-200'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-8 py-7 text-right">
                      <button className="text-primary hover:text-primary/80 transition-colors">
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card p-10 rounded-[3.5rem] shadow-xl border border-border">
            <h4 className="text-xl font-black text-foreground mb-6 flex items-center gap-3">
              <FileText className="text-primary" /> Chamamentos Públicos
            </h4>
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="flex justify-between items-center p-6 bg-muted rounded-3xl hover:bg-primary/10 transition-colors">
                  <div>
                    <p className="text-[10px] font-black text-primary uppercase">Edital 00{i}/2023</p>
                    <p className="text-sm font-bold text-foreground">Processo de Seleção para Projetos de Cultura</p>
                  </div>
                  <CheckCircle2 className="text-green-600" size={18} />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card p-10 rounded-[3.5rem] shadow-xl border border-border">
            <h4 className="text-xl font-black text-foreground mb-6 flex items-center gap-3">
              <AlertCircle className="text-primary" /> Legislação MROSC
            </h4>
            <div className="space-y-4">
              <div className="p-6 bg-muted rounded-3xl flex justify-between items-center">
                <span className="text-sm font-bold text-foreground">Lei Municipal nº 3.083/2017</span>
                <button className="text-[10px] font-black text-primary uppercase">Ver PDF</button>
              </div>
              <div className="p-6 bg-muted rounded-3xl flex justify-between items-center">
                <span className="text-sm font-bold text-foreground">Instrução Normativa CITP 01/2023</span>
                <button className="text-[10px] font-black text-primary uppercase">Ver PDF</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TransparencyPortal;

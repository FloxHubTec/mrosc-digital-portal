
import React from 'react';
import { History, Search, Filter, ShieldCheck, Download, Lock } from 'lucide-react';

const AuditLogsModule: React.FC = () => {
  const logs = [
    { id: '1', user: 'Admin Master', action: 'EDIT', resource: 'Parceria #PRT-001', details: 'Alteração de cronograma financeiro', date: '20/10/2023 14:32', ip: '192.168.0.10', hash: '8a3f...d921' },
    { id: '2', user: 'Gestor Saúde', action: 'CREATE', resource: 'Termo de Fomento', details: 'Criação de novo instrumento jurídico', date: '20/10/2023 11:15', ip: '192.168.0.15', hash: '2b9e...f011' },
    { id: '3', user: 'OSC Futuro', action: 'LOGIN', resource: 'Sistema', details: 'Acesso realizado via portal OSC', date: '19/10/2023 09:00', ip: '177.42.12.98', hash: '5c12...a342' },
    { id: '4', user: 'Controle Interno', action: 'DELETE', resource: 'Rascunho Plano', details: 'Remoção de documento obsoleto', date: '18/10/2023 16:45', ip: '192.168.0.11', hash: 'ff23...e091' },
  ];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-primary uppercase tracking-widest mb-3">
            <History size={14} />
            <span>Rastreabilidade e Compliance LGPD</span>
          </div>
          <h2 className="text-4xl font-black text-foreground tracking-tighter">Trilhas de Auditoria</h2>
          <p className="text-muted-foreground font-medium">Registro imutável de todas as ações realizadas no ecossistema.</p>
        </div>
        <button className="px-6 py-3 bg-card border border-border rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-muted transition-all flex items-center space-x-2 shadow-sm">
          <Download size={18} />
          <span>Exportar Log Completo</span>
        </button>
      </header>

      <div className="bg-card rounded-[2.5rem] shadow-xl border border-border overflow-hidden">
        <div className="p-8 border-b border-border flex justify-between items-center bg-muted/20">
          <div className="flex space-x-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                type="text" 
                placeholder="Filtrar por usuário ou ação..." 
                className="pl-12 pr-6 py-3 bg-card border border-border rounded-2xl text-xs outline-none focus:ring-4 focus:ring-primary/10 w-64"
              />
            </div>
            <button className="p-3 bg-card border border-border rounded-2xl text-muted-foreground hover:text-primary transition-all"><Filter size={18} /></button>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-success bg-success/10 px-4 py-2 rounded-full border border-success/20">
            <ShieldCheck size={14} />
            <span>INTEGRIDADE VERIFICADA (BLOCKCHAIN-READY)</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6">Data / Hora</th>
                <th className="px-8 py-6">Usuário</th>
                <th className="px-8 py-6">Ação</th>
                <th className="px-8 py-6">Recurso</th>
                <th className="px-8 py-6">Hash de Integridade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-muted transition-colors">
                  <td className="px-8 py-6">
                    <div className="text-xs font-bold text-foreground">{log.date}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">IP: {log.ip}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-black text-primary text-sm">{log.user}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                      log.action === 'CREATE' ? 'bg-info/10 text-info' :
                      log.action === 'EDIT' ? 'bg-warning/10 text-warning' :
                      log.action === 'DELETE' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-xs font-medium text-foreground">{log.resource}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 italic">{log.details}</div>
                  </td>
                  <td className="px-8 py-6 font-mono text-[10px] text-muted-foreground/50">
                    <div className="flex items-center space-x-2">
                      <Lock size={12} />
                      <span>{log.hash}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-sidebar-background text-sidebar-foreground p-10 rounded-[3rem] relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShieldCheck size={200} />
        </div>
        <div className="relative z-10">
          <h3 className="text-2xl font-black mb-4">Garantia de Não-Exclusão</h3>
          <p className="text-sidebar-foreground/70 max-w-2xl text-sm leading-relaxed mb-8">
            Conforme requisitos de segurança da informação, registros vinculados a processos ativos ou concluídos possuem proibição técnica de exclusão física. Qualquer tentativa de deleção é convertida em "arquivamento lógico" com preservação total do histórico para auditorias judiciais ou de órgãos de controle.
          </p>
          <div className="flex space-x-6">
            <div className="flex flex-col">
              <span className="text-sidebar-primary font-black text-xs uppercase tracking-widest">Backup Automático</span>
              <span className="text-xl font-bold">A cada 6 horas</span>
            </div>
            <div className="w-px h-10 bg-sidebar-border"></div>
            <div className="flex flex-col">
              <span className="text-sidebar-primary font-black text-xs uppercase tracking-widest">Retenção de Dados</span>
              <span className="text-xl font-bold">10 Anos (Digital)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsModule;

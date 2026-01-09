import React, { useState } from "react";
import { History, Search, Filter, ShieldCheck, Lock, ArrowLeft, X, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import AuditExportDropdown from "./ui/AuditExportDropdown";
import { exportData, ExportFormat } from "@/utils/exportUtils";
import { toast } from "sonner";

const AuditLogsModule: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    action: "",
    user: "",
    dateFrom: "",
    dateTo: "",
  });

  // Mock logs - filtering out OSC users (only gov staff: Admin Master, Técnico, Gestor)
  const allLogs = [
    {
      id: "1",
      user: "Admin Master",
      userRole: "admin_master",
      action: "EDIT",
      resource: "Parceria #PRT-001",
      details: "Alteração de cronograma financeiro",
      date: "20/10/2023 14:32",
      ip: "192.168.0.10",
      hash: "8a3f...d921",
    },
    {
      id: "2",
      user: "Gestor Saúde",
      userRole: "gestor",
      action: "CREATE",
      resource: "Termo de Fomento",
      details: "Criação de novo instrumento jurídico",
      date: "20/10/2023 11:15",
      ip: "192.168.0.15",
      hash: "2b9e...f011",
    },
    {
      id: "3",
      user: "Técnico Financeiro",
      userRole: "tecnico",
      action: "UPDATE",
      resource: "Prestação de Contas #PC-042",
      details: "Validação de documentos fiscais",
      date: "19/10/2023 09:00",
      ip: "192.168.0.12",
      hash: "5c12...a342",
    },
    {
      id: "4",
      user: "Controle Interno",
      userRole: "controle",
      action: "DELETE",
      resource: "Rascunho Plano",
      details: "Remoção de documento obsoleto",
      date: "18/10/2023 16:45",
      ip: "192.168.0.11",
      hash: "ff23...e091",
    },
    {
      id: "5",
      user: "Admin Master",
      userRole: "admin_master",
      action: "UPDATE",
      resource: "OSC - Instituto Esperança",
      details: "Atualização de dados cadastrais e CNPJ",
      date: "17/10/2023 10:20",
      ip: "192.168.0.10",
      hash: "a1b2...c3d4",
    },
    {
      id: "6",
      user: "Gestor Saúde",
      userRole: "gestor",
      action: "UPDATE",
      resource: "Plano de Trabalho #PT-042",
      details: "Atualização de metas e cronograma",
      date: "16/10/2023 15:45",
      ip: "192.168.0.15",
      hash: "e5f6...g7h8",
    },
    {
      id: "7",
      user: "Admin Master",
      userRole: "admin_master",
      action: "EXPORT",
      resource: "Relatório SICOM",
      details: "Exportação de dados para TCE-MG",
      date: "15/10/2023 09:00",
      ip: "192.168.0.10",
      hash: "i9j0...k1l2",
    },
    {
      id: "8",
      user: "Técnico Físico",
      userRole: "tecnico",
      action: "UPLOAD",
      resource: "Relatório de Visita",
      details: "Upload de fotos e relatório de monitoramento",
      date: "14/10/2023 16:30",
      ip: "192.168.0.13",
      hash: "m3n4...o5p6",
    },
  ];

  // Filter logs to only show gov staff (Admin Master, Técnico, Gestor, Controle)
  // OSC users are excluded from audit trail as requested
  const logs = allLogs.filter(log => 
    ['admin_master', 'gestor', 'tecnico', 'controle'].includes(log.userRole)
  );

  const actionOptions = [
    { value: "", label: "Todas as Ações" },
    { value: "CREATE", label: "Criação" },
    { value: "EDIT", label: "Edição" },
    { value: "UPDATE", label: "Atualização" },
    { value: "DELETE", label: "Exclusão" },
    { value: "LOGIN", label: "Login" },
    { value: "LOGOUT", label: "Logout" },
    { value: "EXPORT", label: "Exportação" },
    { value: "UPLOAD", label: "Upload" },
  ];

  const handleExport = (format: ExportFormat) => {
    const headers = ["Data/Hora", "Usuário", "Ação", "Recurso", "Detalhes", "IP", "Hash"];
    const exportDataArray = logs.map((log) => [
      log.date,
      log.user,
      log.action,
      log.resource,
      log.details,
      log.ip,
      log.hash,
    ]);

    exportData(format, {
      filename: `AuditLogs_${new Date().toISOString().split("T")[0]}`,
      title: "Trilha de Auditoria - Sistema MROSC Unaí/MG",
      headers,
      data: exportDataArray,
    });

    toast.success(`Logs exportados em ${format.toUpperCase()}`);
  };

  const filteredLogs = logs.filter((log) => {
    if (filters.action && log.action !== filters.action) return false;
    if (filters.user && !log.user.toLowerCase().includes(filters.user.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Voltar</span>
          </Link>
          <div className="flex items-center space-x-2 text-[10px] font-black text-primary uppercase tracking-widest mb-3">
            <History size={14} />
            <span>Rastreabilidade e Compliance LGPD</span>
          </div>
          <h2 className="text-4xl font-black text-foreground tracking-tighter">Trilhas de Auditoria</h2>
          <p className="text-muted-foreground font-medium">
            Registro imutável de todas as ações realizadas no ecossistema.
          </p>
        </div>
        <AuditExportDropdown onExport={handleExport} />
      </header>

      <div className="bg-card rounded-[2.5rem] shadow-xl border border-border overflow-hidden">
        <div className="p-8 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/20">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Filtrar por usuário..."
                value={filters.user}
                onChange={(e) => setFilters({ ...filters, user: e.target.value })}
                className="pl-12 pr-6 py-3 bg-card border border-border rounded-2xl text-xs outline-none focus:ring-4 focus:ring-primary/10 w-full md:w-64 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-3 bg-card border border-border rounded-2xl text-muted-foreground hover:text-primary hover:border-primary/30 transition-all flex items-center gap-2"
              >
                <Filter size={18} />
                <span className="text-xs font-bold">Filtros</span>
                <ChevronDown size={14} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </button>

              {showFilters && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowFilters(false)} />
                  <div className="absolute left-0 top-full mt-2 bg-card border border-border rounded-xl shadow-xl z-50 p-4 min-w-[280px] animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-black uppercase text-foreground">Filtros Avançados</span>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="p-1 hover:bg-muted rounded-lg text-muted-foreground"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-muted-foreground uppercase mb-2">
                          Tipo de Ação
                        </label>
                        <select
                          value={filters.action}
                          onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                          className="w-full px-4 py-3 bg-muted rounded-xl text-xs outline-none focus:ring-4 focus:ring-primary/10 text-foreground"
                        >
                          {actionOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-muted-foreground uppercase mb-2">
                            Data Início
                          </label>
                          <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                            className="w-full px-3 py-3 bg-muted rounded-xl text-xs outline-none focus:ring-4 focus:ring-primary/10 text-foreground"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-muted-foreground uppercase mb-2">
                            Data Fim
                          </label>
                          <input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                            className="w-full px-3 py-3 bg-muted rounded-xl text-xs outline-none focus:ring-4 focus:ring-primary/10 text-foreground"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setFilters({ action: "", user: "", dateFrom: "", dateTo: "" })}
                          className="flex-1 py-2 bg-muted text-muted-foreground rounded-xl text-[10px] font-black uppercase"
                        >
                          Limpar
                        </button>
                        <button
                          onClick={() => setShowFilters(false)}
                          className="flex-1 py-2 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase"
                        >
                          Aplicar
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
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
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-muted transition-colors">
                  <td className="px-8 py-6">
                    <div className="text-xs font-bold text-foreground">{log.date}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">IP: {log.ip}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-black text-primary text-sm">{log.user}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                        log.action === "CREATE"
                          ? "bg-info/10 text-info"
                          : log.action === "EDIT"
                            ? "bg-warning/10 text-warning"
                            : log.action === "UPDATE"
                              ? "bg-primary/10 text-primary"
                              : log.action === "DELETE"
                                ? "bg-destructive/10 text-destructive"
                                : log.action === "EXPORT"
                                  ? "bg-success/10 text-success"
                                  : log.action === "UPLOAD"
                                    ? "bg-info/10 text-info"
                                    : "bg-muted text-muted-foreground"
                      }`}
                    >
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

      <div className="bg-primary p-10 rounded-[3rem] relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShieldCheck size={200} className="text-primary-foreground" />
        </div>
        <div className="relative z-10">
          <h3 className="text-2xl font-black mb-4 text-primary-foreground">Garantia de Não-Exclusão</h3>
          <p className="text-primary-foreground/70 max-w-2xl text-sm leading-relaxed mb-8">
            Conforme requisitos de segurança da informação, registros vinculados a processos ativos ou concluídos
            possuem proibição técnica de exclusão física. Qualquer tentativa de deleção é convertida em "arquivamento
            lógico" com preservação total do histórico para auditorias judiciais ou de órgãos de controle.
          </p>
          <div className="flex flex-wrap gap-6">
            <div className="flex flex-col">
              <span className="text-primary-foreground/70 font-black text-xs uppercase tracking-widest">
                Backup Automático
              </span>
              <span className="text-xl font-bold text-primary-foreground">A cada 6 horas</span>
            </div>
            <div className="w-px h-10 bg-primary-foreground/20"></div>
            <div className="flex flex-col">
              <span className="text-primary-foreground/70 font-black text-xs uppercase tracking-widest">
                Retenção de Dados
              </span>
              <span className="text-xl font-bold text-primary-foreground">10 Anos (Digital)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsModule;

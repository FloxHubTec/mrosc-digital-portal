import React, { useState, useEffect } from "react";
import {
  Activity,
  FileText,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  FileBarChart,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  Megaphone,
  Briefcase,
  History,
  DollarSign,
  Scale,
  X,
  FileSignature,
  CalendarClock,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { User } from "../services/authContext";
import { UserRole } from "../types";
import ExportDropdown from "./ui/ExportDropdown";
import { exportData, ExportFormat } from "@/utils/exportUtils";
import { toast } from "sonner";
import { usePartnerships } from "@/hooks/usePartnerships";
import { useAuth } from "@/hooks/useAuth";

// Mock data for global charts (admin view)
const globalData = [
  { name: "Jan", valor: 420000 },
  { name: "Fev", valor: 380000 },
  { name: "Mar", valor: 510000 },
  { name: "Abr", valor: 490000 },
  { name: "Mai", valor: 620000 },
  { name: "Jun", valor: 580000 },
];

const COLORS_PIE = ["#0f766e", "#0d9488", "#f59e0b", "#ef4444"];
const globalPieData = [
  { name: "Em Execução", value: 45 },
  { name: "Celebradas", value: 25 },
  { name: "Contas em Análise", value: 20 },
  { name: "Prazos Vencidos", value: 10 },
];

// Dados mock de alertas críticos (admin view)
const criticalAlerts = [
  { id: '1', title: 'Prestação de Contas Vencida', entity: 'OSC Vida Nova', deadline: '05/01/2026', type: 'contas' },
  { id: '2', title: 'CND Federal Expirada', entity: 'Assoc. Verde Cidade', deadline: '02/01/2026', type: 'certidao' },
  { id: '3', title: 'Prazo de Vigência Esgotando', entity: 'Instituto Esperança', deadline: '15/01/2026', type: 'vigencia' },
];

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  trend?: { value: number; positive: boolean };
  pulse?: boolean;
  onClick?: () => void;
}

const StatCard = ({ title, value, icon: Icon, color, trend, pulse, onClick }: StatCardProps) => (
  <div 
    onClick={onClick}
    className={`bg-card p-8 rounded-[2.5rem] shadow-sm border border-border hover:shadow-xl transition-all relative overflow-hidden group ${onClick ? 'cursor-pointer' : ''}`}
  >
    {pulse && (
      <div className="absolute top-4 right-4 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
      </div>
    )}
    <div className="flex items-center justify-between mb-8">
      <div
        className={`p-4 rounded-2xl ${color === "teal" ? "bg-primary/10 text-primary" : color === "indigo" ? "bg-info/10 text-info" : color === "blue" ? "bg-info/10 text-info" : "bg-warning/10 text-warning"} group-hover:scale-110 transition-transform`}
      >
        <Icon size={24} />
      </div>
      {trend && (
        <span
          className={`text-[10px] font-black flex items-center space-x-1 ${trend.positive ? "text-success" : "text-destructive"}`}
        >
          {trend.positive ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <span>{trend.value}%</span>
        </span>
      )}
    </div>
    <div>
      <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2">{title}</p>
      <h3 className="text-4xl font-black text-foreground">{value}</h3>
    </div>
  </div>
);

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [showAlerts, setShowAlerts] = useState(false);
  const { profile } = useAuth();
  const isOSC = user.role === UserRole.OSC_LEGAL || user.role === UserRole.OSC_USER;
  
  // For OSC users, fetch their own partnerships data
  const { partnerships, loading: loadingPartnerships } = usePartnerships(isOSC);
  
  // Calculate OSC-specific stats
  const oscStats = React.useMemo(() => {
    if (!isOSC || loadingPartnerships) return null;
    
    const activePartnerships = partnerships.filter(p => p.status === 'ativa' || p.status === 'em_execucao');
    const totalReceived = partnerships.reduce((sum, p) => sum + (p.valor_repassado || 0), 0);
    const pendingAccounts = partnerships.filter(p => p.status === 'pendente_contas').length;
    
    // Calculate expiring partnerships (vigencia_fim within 30 days)
    const today = new Date();
    const expiringPartnerships = partnerships.filter(p => {
      if (!p.vigencia_fim) return false;
      const endDate = new Date(p.vigencia_fim);
      const daysUntilEnd = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilEnd >= 0 && daysUntilEnd <= 30;
    });
    
    return {
      totalPartnerships: partnerships.length,
      activePartnerships: activePartnerships.length,
      totalReceived,
      pendingAccounts,
      expiringCount: expiringPartnerships.length,
    };
  }, [isOSC, partnerships, loadingPartnerships]);
  
  // Generate OSC-specific chart data
  const oscChartData = React.useMemo(() => {
    if (!isOSC || !partnerships.length) return [];
    
    // Group by month (simplified - using created_at)
    const monthlyData: { [key: string]: number } = {};
    partnerships.forEach(p => {
      if (p.valor_repassado) {
        const date = new Date(p.created_at);
        const monthKey = date.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + p.valor_repassado;
      }
    });
    
    return Object.entries(monthlyData).map(([name, valor]) => ({ name, valor }));
  }, [isOSC, partnerships]);
  
  // OSC-specific pie data (status distribution)
  const oscPieData = React.useMemo(() => {
    if (!isOSC || !partnerships.length) return globalPieData;
    
    const statusCount: { [key: string]: number } = {};
    partnerships.forEach(p => {
      const status = p.status || 'Outros';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    
    return Object.entries(statusCount).map(([name, value]) => ({ 
      name: name === 'ativa' ? 'Em Execução' : name === 'celebrada' ? 'Celebradas' : name, 
      value 
    }));
  }, [isOSC, partnerships]);
  
  // Use appropriate data based on user type
  const chartData = isOSC ? (oscChartData.length > 0 ? oscChartData : [{ name: 'N/A', valor: 0 }]) : globalData;
  const pieData = isOSC ? oscPieData : globalPieData;

  const handleExportSICOM = (format: ExportFormat) => {
    const headers = ['Mês', 'Valor Repassado', 'Parcerias Ativas', 'Metas Cumpridas'];
    const sicomData = [
      ['Janeiro/2026', 'R$ 420.000,00', '114', '89%'],
      ['Fevereiro/2026', 'R$ 380.000,00', '112', '92%'],
      ['Março/2026', 'R$ 510.000,00', '118', '87%'],
      ['Abril/2026', 'R$ 490.000,00', '116', '91%'],
      ['Maio/2026', 'R$ 620.000,00', '120', '94%'],
      ['Junho/2026', 'R$ 580.000,00', '114', '90%'],
    ];
    
    exportData(format, {
      filename: `SICOM_MROSC_${new Date().toISOString().split('T')[0]}`,
      title: 'Relatório SICOM - Sistema MROSC Unaí/MG',
      headers,
      data: sicomData,
    });
    
    toast.success(`Relatório SICOM exportado em ${format.toUpperCase()}`);
  };

  const getAlertTypeStyle = (type: string) => {
    switch (type) {
      case 'contas': return 'bg-destructive/10 text-destructive';
      case 'certidao': return 'bg-warning/10 text-warning';
      case 'vigencia': return 'bg-info/10 text-info';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center space-x-3 text-[10px] font-black text-primary uppercase tracking-widest mb-3">
            <div className="w-10 h-px bg-primary/30"></div>
            <span>Unidade Unaí/MG • Exercício 2026</span>
          </div>
          <h2 className="text-5xl font-black text-foreground tracking-tighter">
            {isOSC ? "Painel da Instituição" : "Gestão Estratégica MROSC"}
          </h2>
          <p className="text-muted-foreground font-medium italic mt-2">"Lei Municipal 3.083/17 e Decreto 7.259/23."</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Link
            to="/transparency"
            className="flex-1 md:flex-none px-8 py-4 bg-card border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-muted flex items-center justify-center gap-3 transition-all shadow-sm text-foreground"
          >
            <ShieldCheck size={18} /> Transparência
          </Link>
          {!isOSC && (
            <ExportDropdown onExport={handleExportSICOM} className="flex-1 md:flex-none" />
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {isOSC ? (
          // OSC-specific cards with their own data
          <>
            <StatCard
              title="Minhas Parcerias"
              value={loadingPartnerships ? "..." : String(oscStats?.totalPartnerships || 0).padStart(2, '0')}
              icon={FileSignature}
              color="teal"
              onClick={() => navigate('/partnerships')}
            />
            <StatCard 
              title="Total Recebido" 
              value={loadingPartnerships ? "..." : `R$ ${((oscStats?.totalReceived || 0) / 1000).toFixed(0)}K`}
              icon={DollarSign} 
              color="indigo" 
              onClick={() => navigate('/accountability')}
            />
            <StatCard 
              title="Contas Pendentes" 
              value={loadingPartnerships ? "..." : String(oscStats?.pendingAccounts || 0).padStart(2, '0')}
              icon={Clock} 
              color="blue" 
              onClick={() => navigate('/accountability')}
            />
            <StatCard 
              title="Prazos Vencendo" 
              value={loadingPartnerships ? "..." : String(oscStats?.expiringCount || 0).padStart(2, '0')}
              icon={CalendarClock} 
              color="amber" 
              pulse={oscStats?.expiringCount ? oscStats.expiringCount > 0 : false}
              onClick={() => navigate('/partnerships')}
            />
          </>
        ) : (
          // Admin/Staff cards with global data
          <>
            <StatCard
              title="Parcerias Ativas"
              value="114"
              icon={Activity}
              color="teal"
              trend={{ value: 8, positive: true }}
              onClick={() => navigate('/partnerships')}
            />
            <StatCard 
              title="Emendas Alocadas" 
              value="R$ 1.8M" 
              icon={DollarSign} 
              color="indigo" 
              onClick={() => navigate('/amendments')}
            />
            <StatCard 
              title="Chamamentos" 
              value="05" 
              icon={Megaphone} 
              color="blue" 
              onClick={() => navigate('/chamamento')}
            />
            <StatCard 
              title="Alertas Críticos" 
              value="03" 
              icon={AlertTriangle} 
              color="amber" 
              pulse={true} 
              onClick={() => setShowAlerts(true)}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card p-12 rounded-[4rem] shadow-sm border border-border">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3 italic">
                <TrendingUp className="text-primary" size={28} />
                {isOSC ? "Meus Repasses" : "Repasses x Metas"}
              </h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">
                {isOSC ? "Histórico de Repasses Recebidos" : "Fluxo de Desembolso Financeiro MROSC"}
              </p>
            </div>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-[9px] font-black text-muted-foreground uppercase">Valor Repassado</span>
            </div>
          </div>
          <div className="h-80">
            {loadingPartnerships && isOSC ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: 700 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: 700 }}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    contentStyle={{
                      borderRadius: "24px",
                      border: "none",
                      boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.2)",
                    }}
                  />
                  <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[12, 12, 0, 0]} barSize={45} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-card p-12 rounded-[4rem] shadow-sm border border-border flex flex-col items-center justify-center">
          <h3 className="text-xl font-black text-foreground tracking-tight mb-10 self-start italic">
            {isOSC ? "Minhas Parcerias" : "Status de Contas"}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 w-full">
            {pieData.map((d, i) => (
              <div key={i} className="p-5 bg-muted rounded-3xl border border-border flex flex-col">
                <span className="text-[9px] font-black text-muted-foreground uppercase mb-2">{d.name}</span>
                <span className="text-xl font-black text-foreground">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!isOSC && (
        <div className="bg-primary p-12 rounded-[4rem] flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:scale-150 transition-transform duration-1000">
            <History size={250} className="text-primary-foreground" />
          </div>
          <div className="max-w-xl relative z-10">
            <h4 className="text-3xl font-black mb-6 flex items-center gap-4 text-primary-foreground">
              <Scale className="text-primary-foreground/80" /> Auditoria Imutável
            </h4>
            <p className="text-primary-foreground/70 font-medium leading-relaxed mb-10">
              Todos os atos decisórios, parcerias celebradas e transferências são registrados com rastreabilidade total
              (Audit Trail), garantindo integridade para o Tribunal de Contas (SICOM) e órgãos externos.
            </p>
            <Link
              to="/logs"
              className="px-10 py-5 bg-primary-foreground text-primary hover:opacity-90 rounded-2xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-3 transition-all"
            >
              Acessar Trilha de Auditoria <History size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="p-6 bg-primary-foreground/10 backdrop-blur-md rounded-3xl border border-primary-foreground/20 text-center">
              <span className="block text-[9px] font-black text-primary-foreground/80 uppercase mb-2">Logs Hoje</span>
              <span className="text-2xl font-black text-primary-foreground">1.242</span>
            </div>
            <div className="p-6 bg-primary-foreground/10 backdrop-blur-md rounded-3xl border border-primary-foreground/20 text-center">
              <span className="block text-[9px] font-black text-primary-foreground/80 uppercase mb-2">Integridade</span>
              <span className="text-2xl font-black text-primary-foreground">100%</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Alertas Críticos */}
      {showAlerts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-[2rem] p-6 md:p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-destructive/10 rounded-xl">
                  <AlertTriangle className="text-destructive" size={24} />
                </div>
                <h3 className="text-2xl font-black text-foreground">Alertas Críticos</h3>
              </div>
              <button 
                onClick={() => setShowAlerts(false)} 
                className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {criticalAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className="p-5 bg-muted rounded-2xl border border-border hover:border-primary/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-black text-foreground text-sm mb-1">{alert.title}</h4>
                      <p className="text-xs text-muted-foreground">{alert.entity}</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase ${getAlertTypeStyle(alert.type)}`}>
                      {alert.deadline}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <button
                onClick={() => {
                  setShowAlerts(false);
                  navigate('/parcerias');
                }}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all"
              >
                Ver Todas as Parcerias
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

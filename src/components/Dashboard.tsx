import React from "react";
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
} from "lucide-react";
import { Link } from "react-router-dom";
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

const data = [
  { name: "Jan", valor: 420000 },
  { name: "Fev", valor: 380000 },
  { name: "Mar", valor: 510000 },
  { name: "Abr", valor: 490000 },
  { name: "Mai", valor: 620000 },
  { name: "Jun", valor: 580000 },
];

const COLORS_PIE = ["#0f766e", "#0d9488", "#f59e0b", "#ef4444"];
const pieData = [
  { name: "Em Execução", value: 45 },
  { name: "Celebradas", value: 25 },
  { name: "Contas em Análise", value: 20 },
  { name: "Prazos Vencidos", value: 10 },
];

const StatCard = ({ title, value, icon: Icon, color, trend, pulse }: any) => (
  <div className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-border hover:shadow-xl transition-all relative overflow-hidden group">
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
  const isOSC = user.role === UserRole.OSC_LEGAL || user.role === UserRole.OSC_USER;

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
            className="flex-1 md:flex-none px-8 py-4 bg-card border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-muted flex items-center justify-center gap-3 transition-all shadow-sm"
          >
            <ShieldCheck size={18} /> Transparência
          </Link>
          {!isOSC && (
            <button className="flex-1 md:flex-none px-8 py-4 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 transition-all active:scale-95">
              <FileBarChart size={18} /> Exportar SICOM
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard
          title="Parcerias Ativas"
          value={isOSC ? "02" : "114"}
          icon={Activity}
          color="teal"
          trend={{ value: 8, positive: true }}
        />
        <StatCard title="Emendas Alocadas" value="R$ 1.8M" icon={DollarSign} color="indigo" />
        <StatCard title="Chamamentos" value="05" icon={Megaphone} color="blue" />
        <StatCard title="Alertas Críticos" value="03" icon={AlertTriangle} color="amber" pulse={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card p-12 rounded-[4rem] shadow-sm border border-border">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3 italic">
                <TrendingUp className="text-primary" size={28} />
                Repasses x Metas
              </h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">
                Fluxo de Desembolso Financeiro MROSC
              </p>
            </div>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-[9px] font-black text-muted-foreground uppercase">Valor Repassado</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
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
          </div>
        </div>

        <div className="bg-card p-12 rounded-[4rem] shadow-sm border border-border flex flex-col items-center justify-center">
          <h3 className="text-xl font-black text-foreground tracking-tight mb-10 self-start italic">
            Status de Contas
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
        <div className="bg-sidebar-background p-12 rounded-[4rem] text-sidebar-foreground flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-150 transition-transform duration-1000">
            <History size={250} />
          </div>
          <div className="max-w-xl relative z-10">
            <h4 className="text-3xl font-black mb-6 flex items-center gap-4">
              <Scale className="text-sidebar-primary" /> Auditoria Imutável
            </h4>
            <p className="text-sidebar-foreground/60 font-medium leading-relaxed mb-10">
              Todos os atos decisórios, parcerias celebradas e transferências são registrados com rastreabilidade total
              (Audit Trail), garantindo integridade para o Tribunal de Contas (SICOM) e órgãos externos.
            </p>
            <Link
              to="/logs"
              className="px-10 py-5 bg-sidebar-accent hover:opacity-90 rounded-2xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-3 transition-all"
            >
              Acessar Trilha de Auditoria <History size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="p-6 bg-sidebar-foreground/5 backdrop-blur-md rounded-3xl border border-sidebar-foreground/10 text-center">
              <span className="block text-[9px] font-black text-sidebar-primary uppercase mb-2">Logs Hoje</span>
              <span className="text-2xl font-black">1.242</span>
            </div>
            <div className="p-6 bg-sidebar-foreground/5 backdrop-blur-md rounded-3xl border border-sidebar-foreground/10 text-center">
              <span className="block text-[9px] font-black text-sidebar-primary uppercase mb-2">Integridade</span>
              <span className="text-2xl font-black">100%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

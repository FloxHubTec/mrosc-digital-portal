import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, FileSignature, ShieldCheck, Eye, Search, Menu, X, ClipboardList, Megaphone, Briefcase, History, Lock, BookOpen, MessageSquare, Scale, BarChartHorizontal, LogOut, Trophy, FilePlus2, HelpCircle, Link2 } from 'lucide-react';
import Dashboard from './components/Dashboard';
import PartnershipsModule from './components/Partnerships';
import AmendmentsModule from './components/Amendments';
import OSCModule from './components/OSCProfile';
import TransparencyPortal from './components/Transparency';
import AccountabilityModule from './components/Accountability';
import ChamamentoModule from './components/Chamamento';
import AuditLogsModule from './components/AuditLogs';
import PMISModule from './components/PMIS';
import LegislationModule from './components/Legislation';
import CommunicationModule from './components/Communication';
import ManualModule from './components/Manual';
import ReportsModule from './components/Reports';
import ProposalSelectionModule from './components/ProposalSelection';
import AdditivesModule from './components/Additives';
import SupportModule from './components/Support';
import IntegrationsModule from './components/Integrations';
import NotificationDropdown from './components/NotificationDropdown';
import UserProfileSettings from './components/UserProfileSettings';
import Auth from './pages/Auth';
import { UserRole } from './types';
import { AuthProvider, useAuth, getRoleEnum, isSuperAdmin } from './hooks/useAuth';
import { getAccessibleRoutes } from './services/authContext';

const SidebarItem = ({ to, icon: Icon, label, active, hidden }: { to: string, icon: any, label: string, active: boolean, hidden?: boolean }) => {
  if (hidden) return null;
  return (
    <Link to={to} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-sidebar-accent text-sidebar-foreground font-bold' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'}`}>
      <Icon size={18} />
      <span className="text-sm">{label}</span>
    </Link>
  );
};

// Loading spinner component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="text-muted-foreground font-medium">Carregando...</p>
    </div>
  </div>
);

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);
  
  if (loading) return <LoadingSpinner />;
  if (!user) return null;
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const { user, profile, signOut, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get role from profile or default
  const currentRole = profile?.role ? getRoleEnum(profile.role) : UserRole.OSC_USER;
  const routes = getAccessibleRoutes(currentRole);
  const canAccess = (path: string) => routes.includes('all') || routes.includes(path);

  // Check if user is superadmin (hidden from system display)
  const isDevSuperAdmin = isSuperAdmin(profile?.role || null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Show loading while checking auth
  if (loading) return <LoadingSpinner />;

  // Public routes
  if (location.pathname === '/transparency') return <TransparencyPortal />;
  if (location.pathname === '/auth') return <Auth />;

  // Protected app
  if (!user) {
    navigate('/auth');
    return null;
  }

  // Display role for UI (hide superadmin dev role)
  const displayRole = isDevSuperAdmin ? UserRole.MASTER : currentRole;

  const currentUser = {
    name: profile?.full_name || user.email?.split('@')[0] || 'Usuário',
    role: displayRole,
    department: profile?.department || undefined,
  };

  // Check if current user is master or superadmin for profile settings
  const isMasterUser = currentRole === UserRole.MASTER || isDevSuperAdmin;

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <aside className={`bg-sidebar text-sidebar-foreground w-72 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:relative z-50 h-full border-r border-sidebar-border overflow-y-auto scrollbar-hide`}>
        <div className="p-6 flex items-center justify-between border-b border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-sidebar-primary rounded-xl flex items-center justify-center shadow-lg"><ShieldCheck size={22} className="text-sidebar-primary-foreground" /></div>
            <div>
              <h1 className="text-base font-black tracking-tight leading-none text-sidebar-foreground">MROSC<span className="text-sidebar-primary">Digital</span></h1>
              <p className="text-[9px] font-bold text-sidebar-foreground/50 uppercase tracking-widest mt-1">Sistema de Parcerias</p>
            </div>
          </div>
          <button className="md:hidden text-sidebar-foreground" onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
        </div>

        <div className="px-4 py-4 text-[10px] font-bold text-sidebar-primary uppercase tracking-widest">Operacional</div>
        <nav className="px-4 space-y-1">
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
          <SidebarItem to="/amendments" icon={FileText} label="Emendas Parlamentares" active={location.pathname === '/amendments'} hidden={!canAccess('/amendments')} />
          <SidebarItem to="/pmis" icon={Briefcase} label="PMIS" active={location.pathname === '/pmis'} hidden={!canAccess('/pmis')} />
          <SidebarItem to="/chamamento" icon={Megaphone} label="Chamamentos" active={location.pathname === '/chamamento'} hidden={!canAccess('/chamamento')} />
          <SidebarItem to="/proposals" icon={Trophy} label="Seleção de Propostas" active={location.pathname === '/proposals'} hidden={!canAccess('/proposals')} />
          <SidebarItem to="/partnerships" icon={FileSignature} label="Parcerias" active={location.pathname.startsWith('/partnerships')} hidden={!canAccess('/partnerships')} />
          <SidebarItem to="/additives" icon={FilePlus2} label="Aditivos" active={location.pathname === '/additives'} hidden={!canAccess('/additives')} />
          <SidebarItem to="/accountability" icon={ClipboardList} label="Contas (REO/REFF)" active={location.pathname === '/accountability'} hidden={!canAccess('/accountability')} />
        </nav>

        <div className="px-4 py-4 text-[10px] font-bold text-sidebar-primary uppercase tracking-widest mt-2 border-t border-sidebar-border pt-6">Gestão e Dados</div>
        <nav className="px-4 space-y-1">
          <SidebarItem to="/oscs" icon={Users} label="Cadastro OSCs" active={location.pathname === '/oscs'} hidden={!canAccess('/oscs')} />
          <SidebarItem to="/reports" icon={BarChartHorizontal} label="Relatórios e BI" active={location.pathname === '/reports'} hidden={!canAccess('/reports')} />
          <SidebarItem to="/legislation" icon={Scale} label="Legislação e Modelos" active={location.pathname === '/legislation'} hidden={!canAccess('/legislation')} />
          <SidebarItem to="/communication" icon={MessageSquare} label="Comunicações" active={location.pathname === '/communication'} hidden={!canAccess('/communication')} />
        </nav>

        <div className="px-4 py-4 text-[10px] font-bold text-sidebar-primary uppercase tracking-widest mt-2 border-t border-sidebar-border pt-6">Controle e Ajuda</div>
        <nav className="px-4 space-y-1 mb-24">
          <SidebarItem to="/logs" icon={History} label="Audit Trail (LGPD)" active={location.pathname === '/logs'} hidden={!canAccess('/logs')} />
          <SidebarItem to="/support" icon={HelpCircle} label="Suporte" active={location.pathname === '/support'} />
          <SidebarItem to="/integrations" icon={Link2} label="Integrações" active={location.pathname === '/integrations'} hidden={!canAccess('/integrations')} />
          <SidebarItem to="/manual" icon={BookOpen} label="Manual do Sistema" active={location.pathname === '/manual'} />
          <SidebarItem to="/transparency" icon={Eye} label="Portal Público" active={false} />
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-sidebar-accent border-t border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sidebar-primary flex items-center justify-center font-bold text-sm text-sidebar-primary-foreground uppercase">{currentUser.name.substring(0,2)}</div>
            <div className="overflow-hidden flex-1">
              <p className="font-semibold text-sidebar-foreground text-xs truncate">{currentUser.name}</p>
              <p className="text-sidebar-primary text-[10px] uppercase font-bold tracking-tight truncate">{currentUser.role}</p>
            </div>
            <button 
              onClick={handleSignOut} 
              title="Sair do Sistema" 
              className="text-sidebar-foreground/50 hover:text-destructive transition-colors p-2 hover:bg-destructive/10 rounded-lg"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-card/80 backdrop-blur-md border-b border-border h-20 flex items-center justify-between px-4 md:px-8 z-10 shrink-0">
          <div className="flex items-center space-x-4 md:space-x-6">
            <button className="text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-primary/10 rounded-xl" onClick={() => setIsSidebarOpen(!isSidebarOpen)}><Menu size={22} /></button>
            <div className="relative group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <input type="text" placeholder="Busca global..." className="pl-12 pr-6 py-3 border-none rounded-2xl text-sm bg-muted focus:bg-card focus:ring-4 focus:ring-primary/10 outline-none w-64 lg:w-80 xl:w-[400px] transition-all" />
            </div>
          </div>
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-[10px] font-black text-primary uppercase">Ambiente Seguro</span>
              <span className="text-[9px] text-muted-foreground font-bold">{currentUser.department || 'Prefeitura de Unaí'}</span>
            </div>
            
            {/* Notification Dropdown */}
            <NotificationDropdown />
            
            <div className="h-10 w-px bg-border hidden md:block"></div>
            
            {/* User Profile Settings */}
            <UserProfileSettings user={currentUser} isMaster={isMasterUser} />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 bg-background/50">
          <Routes>
            <Route path="/" element={<Dashboard user={currentUser} />} />
            <Route path="/amendments" element={canAccess('/amendments') ? <AmendmentsModule /> : <AccessDenied />} />
            <Route path="/pmis" element={canAccess('/pmis') ? <PMISModule /> : <AccessDenied />} />
            <Route path="/chamamento" element={canAccess('/chamamento') ? <ChamamentoModule /> : <AccessDenied />} />
            <Route path="/proposals" element={canAccess('/proposals') ? <ProposalSelectionModule /> : <AccessDenied />} />
            <Route path="/partnerships/*" element={canAccess('/partnerships') ? <PartnershipsModule /> : <AccessDenied />} />
            <Route path="/additives" element={canAccess('/additives') ? <AdditivesModule /> : <AccessDenied />} />
            <Route path="/accountability" element={canAccess('/accountability') ? <AccountabilityModule /> : <AccessDenied />} />
            <Route path="/oscs" element={canAccess('/oscs') ? <OSCModule /> : <AccessDenied />} />
            <Route path="/reports" element={canAccess('/reports') ? <ReportsModule /> : <AccessDenied />} />
            <Route path="/legislation" element={canAccess('/legislation') ? <LegislationModule /> : <AccessDenied />} />
            <Route path="/communication" element={canAccess('/communication') ? <CommunicationModule /> : <AccessDenied />} />
            <Route path="/logs" element={canAccess('/logs') ? <AuditLogsModule /> : <AccessDenied />} />
            <Route path="/support" element={<SupportModule />} />
            <Route path="/integrations" element={canAccess('/integrations') ? <IntegrationsModule /> : <AccessDenied />} />
            <Route path="/manual" element={<ManualModule />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const AccessDenied = () => (
  <div className="flex flex-col items-center justify-center h-full space-y-4 p-6 text-center">
    <div className="p-6 bg-destructive/10 text-destructive rounded-full"><Lock size={48} /></div>
    <h2 className="text-2xl md:text-3xl font-black text-foreground">Acesso Restrito</h2>
    <p className="text-muted-foreground max-w-md">Seu perfil de usuário não possui permissão para acessar este módulo.</p>
    <Link to="/" className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest">Voltar ao Dashboard</Link>
  </div>
);

const AppWrapper = () => (
  <HashRouter>
    <AuthProvider>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/transparency" element={<TransparencyPortal />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  </HashRouter>
);

export default AppWrapper;
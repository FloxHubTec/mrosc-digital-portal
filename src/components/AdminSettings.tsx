import React, { useState, useRef } from 'react';
import { Settings, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, X, Users, BookOpen, Lock, KeyRound, Plus, Search, Edit, Server, Shield, Clock, Database, RefreshCw, Phone, Palette, Image, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLabels } from '@/contexts/LabelContext';
import { useTheme, defaultTheme } from '@/contexts/ThemeContext';
import { Textarea } from '@/components/ui/textarea';

type TabType = 'migration' | 'users' | 'dictionary' | 'infrastructure' | 'branding';

interface MockUser {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  perfil: 'Master' | 'Gestor' | 'Técnico' | 'OSC';
  status: 'Ativo' | 'Bloqueado';
  criadoEm: string;
}

const mockUsers: MockUser[] = [
  { id: '1', nome: 'Carlos Administrador', email: 'carlos.admin@unai.mg.gov.br', cpf: '123.456.789-00', perfil: 'Master', status: 'Ativo', criadoEm: '15/01/2024' },
  { id: '2', nome: 'Maria Gestora', email: 'maria.gestora@unai.mg.gov.br', cpf: '987.654.321-00', perfil: 'Gestor', status: 'Ativo', criadoEm: '20/02/2024' },
  { id: '3', nome: 'João Técnico', email: 'joao.tecnico@unai.mg.gov.br', cpf: '456.789.123-00', perfil: 'Técnico', status: 'Ativo', criadoEm: '10/03/2024' },
  { id: '4', nome: 'Ana Silva - OSC Vida Plena', email: 'ana.silva@vidaplena.org.br', cpf: '321.654.987-00', perfil: 'OSC', status: 'Bloqueado', criadoEm: '05/04/2024' },
];

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('migration');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [users, setUsers] = useState<MockUser[]>(mockUsers);
  const [userFormData, setUserFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    perfil: 'Técnico' as MockUser['perfil'],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const { labels, updateLabel } = useLabels();
  const { theme, updateTheme, resetTheme } = useTheme();
  const [editingLabels, setEditingLabels] = useState<Record<string, string>>(labels);
  const [brandingForm, setBrandingForm] = useState({
    primaryColor: theme.primaryColor,
    secondaryColor: theme.secondaryColor,
    organizationName: theme.organizationName,
    organizationSubtitle: theme.organizationSubtitle,
    logoUrl: theme.logoUrl,
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].name.endsWith('.csv')) {
      setUploadedFile(files[0]);
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, envie apenas arquivos CSV.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && files[0].name.endsWith('.csv')) {
      setUploadedFile(files[0]);
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, envie apenas arquivos CSV.",
        variant: "destructive",
      });
    }
  };

  const handleProcessFile = async () => {
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setIsProcessing(false);
    setUploadedFile(null);
    
    toast({
      title: "Migração concluída!",
      description: "54 OSCs importadas com sucesso.",
    });
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: MockUser = {
      id: String(Date.now()),
      ...userFormData,
      status: 'Ativo',
      criadoEm: new Date().toLocaleDateString('pt-BR'),
    };
    setUsers([...users, newUser]);
    setShowUserModal(false);
    setUserFormData({ nome: '', email: '', cpf: '', perfil: 'Técnico' });
    toast({ title: "Usuário criado!", description: `${newUser.nome} foi cadastrado com sucesso.` });
  };

  const handleBlockUser = (userId: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: u.status === 'Ativo' ? 'Bloqueado' : 'Ativo' } : u));
    toast({ title: "Status alterado!", description: "O status do usuário foi atualizado." });
  };

  const handleResetPassword = (userId: string) => {
    toast({ title: "Senha resetada!", description: "Um e-mail foi enviado ao usuário com a nova senha." });
  };

  const handleSaveLabels = () => {
    Object.entries(editingLabels).forEach(([key, value]) => {
      updateLabel(key, value);
    });
    toast({ title: "Dicionário salvo!", description: "Os termos foram atualizados com sucesso." });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "Arquivo muito grande", description: "A imagem deve ter no máximo 2MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBrandingForm(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBranding = () => {
    updateTheme({
      primaryColor: brandingForm.primaryColor,
      secondaryColor: brandingForm.secondaryColor,
      organizationName: brandingForm.organizationName,
      organizationSubtitle: brandingForm.organizationSubtitle,
      logoUrl: brandingForm.logoUrl,
    });
    toast({ title: "Identidade Visual salva!", description: "As configurações de tema foram aplicadas com sucesso." });
  };

  const handleResetBranding = () => {
    resetTheme();
    setBrandingForm({
      primaryColor: defaultTheme.primaryColor,
      secondaryColor: defaultTheme.secondaryColor,
      organizationName: defaultTheme.organizationName,
      organizationSubtitle: defaultTheme.organizationSubtitle,
      logoUrl: defaultTheme.logoUrl,
    });
    toast({ title: "Tema restaurado!", description: "As configurações padrão foram restauradas." });
  };

  const filteredUsers = users.filter(u => 
    u.nome.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.cpf.includes(userSearch)
  );

  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreForm, setRestoreForm] = useState({ dataDesejada: '', motivo: '' });
  
  const lastBackupTime = new Date();
  lastBackupTime.setHours(lastBackupTime.getHours() - 1);

  const handleRestoreRequest = () => {
    toast({ 
      title: "Solicitação enviada!", 
      description: "Nossa equipe técnica entrará em contato em até 4 horas úteis." 
    });
    setShowRestoreModal(false);
    setRestoreForm({ dataDesejada: '', motivo: '' });
  };

  const tabs = [
    { id: 'branding' as TabType, label: 'Identidade Visual', icon: Palette },
    { id: 'migration' as TabType, label: 'Migração de Dados', icon: Upload },
    { id: 'users' as TabType, label: 'Gestão de Usuários', icon: Users },
    { id: 'dictionary' as TabType, label: 'Dicionário', icon: BookOpen },
    { id: 'infrastructure' as TabType, label: 'Infraestrutura', icon: Server },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <div className="flex items-center space-x-2 text-[10px] font-black text-primary uppercase tracking-widest mb-3">
          <Settings size={14} />
          <span>Configurações do Sistema</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter">Administração</h2>
        <p className="text-muted-foreground font-medium">Configurações avançadas, usuários e ferramentas de migração.</p>
      </header>

      {/* Tabs - Responsive */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4 overflow-x-auto">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 md:px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <tab.icon size={16} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <div className="bg-card rounded-[2rem] md:rounded-[2.5rem] border border-border p-6 md:p-12 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-foreground mb-2">Identidade Visual (White Label)</h3>
              <p className="text-muted-foreground">
                Personalize as cores, logomarca e nome da organização exibidos no sistema.
              </p>
            </div>
            <Button variant="outline" onClick={handleResetBranding} className="gap-2 text-muted-foreground">
              <RotateCcw size={16} />
              Restaurar Padrão
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Color Settings */}
            <div className="space-y-6">
              <h4 className="font-black text-foreground text-lg flex items-center gap-2">
                <Palette size={18} className="text-primary" />
                Cores do Sistema
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Cor Principal (Primária)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={brandingForm.primaryColor}
                      onChange={(e) => setBrandingForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-16 h-12 rounded-xl cursor-pointer border border-border"
                    />
                    <input
                      type="text"
                      value={brandingForm.primaryColor}
                      onChange={(e) => setBrandingForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="flex-1 px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20 text-foreground font-mono"
                      placeholder="#0f766e"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Usada em botões, sidebar e destaques.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Cor Secundária (Acentos)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={brandingForm.secondaryColor}
                      onChange={(e) => setBrandingForm(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="w-16 h-12 rounded-xl cursor-pointer border border-border"
                    />
                    <input
                      type="text"
                      value={brandingForm.secondaryColor}
                      onChange={(e) => setBrandingForm(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="flex-1 px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20 text-foreground font-mono"
                      placeholder="#0d9488"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Usada em links e elementos secundários.</p>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-6 p-6 bg-muted rounded-2xl">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-4">Prévia das Cores</p>
                <div className="flex gap-4">
                  <div 
                    className="w-20 h-20 rounded-xl shadow-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: brandingForm.primaryColor }}
                  >
                    Primária
                  </div>
                  <div 
                    className="w-20 h-20 rounded-xl shadow-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: brandingForm.secondaryColor }}
                  >
                    Secundária
                  </div>
                </div>
              </div>
            </div>

            {/* Organization Settings */}
            <div className="space-y-6">
              <h4 className="font-black text-foreground text-lg flex items-center gap-2">
                <Image size={18} className="text-primary" />
                Dados da Organização
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Nome da Organização
                  </label>
                  <input
                    type="text"
                    value={brandingForm.organizationName}
                    onChange={(e) => setBrandingForm(prev => ({ ...prev, organizationName: e.target.value }))}
                    className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20 text-foreground"
                    placeholder="Prefeitura Municipal de..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Subtítulo / Estado
                  </label>
                  <input
                    type="text"
                    value={brandingForm.organizationSubtitle}
                    onChange={(e) => setBrandingForm(prev => ({ ...prev, organizationSubtitle: e.target.value }))}
                    className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20 text-foreground"
                    placeholder="Estado de Minas Gerais"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Logomarca / Brasão
                  </label>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  
                  <div 
                    onClick={() => logoInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-2xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all"
                  >
                    {brandingForm.logoUrl ? (
                      <div className="flex flex-col items-center gap-4">
                        <img 
                          src={brandingForm.logoUrl} 
                          alt="Logo" 
                          className="w-24 h-24 object-contain rounded-xl"
                        />
                        <p className="text-xs text-muted-foreground">Clique para alterar</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-4 bg-muted rounded-xl">
                          <Image size={32} className="text-muted-foreground" />
                        </div>
                        <p className="text-sm text-foreground font-medium">Clique para enviar</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG ou SVG (máx. 2MB)</p>
                      </div>
                    )}
                  </div>
                  
                  {brandingForm.logoUrl && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 text-destructive hover:bg-destructive/10"
                      onClick={() => setBrandingForm(prev => ({ ...prev, logoUrl: '' }))}
                    >
                      <X size={14} className="mr-1" />
                      Remover Logo
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-end">
            <Button onClick={handleSaveBranding} className="gap-2 px-8">
              <CheckCircle size={16} />
              Salvar Identidade Visual
            </Button>
          </div>

          <div className="mt-8 p-6 bg-muted rounded-2xl">
            <h4 className="font-black text-foreground mb-3 flex items-center gap-2">
              <AlertCircle size={16} className="text-info" />
              Onde as configurações são aplicadas
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Cores:</strong> Sidebar, botões, links e elementos de destaque</li>
              <li>• <strong>Nome:</strong> Cabeçalho do sistema, Portal de Transparência e PDFs gerados</li>
              <li>• <strong>Logo:</strong> Tela de Login, Sidebar e relatórios oficiais (REO/REFF)</li>
            </ul>
          </div>
        </div>
      )}

      {/* Migration Tab */}
      {activeTab === 'migration' && (
        <>
          <div className="bg-card rounded-[2rem] md:rounded-[2.5rem] border border-border p-6 md:p-12 shadow-sm">
            <h3 className="text-xl md:text-2xl font-black text-foreground mb-2">Migração de Dados</h3>
            <p className="text-muted-foreground mb-8">
              Importe dados de OSCs e parcerias de exercícios anteriores através de arquivos CSV.
            </p>

            {/* Drag and Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-[1.5rem] md:rounded-[2rem] p-8 md:p-12 text-center transition-all cursor-pointer
                ${isDragOver 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }
                ${uploadedFile ? 'border-success bg-success/5' : ''}
              `}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />

              {uploadedFile ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-success/10 rounded-2xl">
                    <FileSpreadsheet size={48} className="text-success" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-foreground">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearFile();
                    }}
                    className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-destructive"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className={`p-6 rounded-2xl transition-colors ${isDragOver ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Upload size={48} className={isDragOver ? 'text-primary' : 'text-muted-foreground'} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-foreground mb-1">
                      Arraste e solte seu arquivo CSV aqui
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ou clique para selecionar
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center">
                    <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-[10px] font-black uppercase">
                      OSCs
                    </span>
                    <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-[10px] font-black uppercase">
                      Parcerias
                    </span>
                    <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-[10px] font-black uppercase">
                      Emendas
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Process Button */}
            {uploadedFile && (
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleProcessFile}
                  disabled={isProcessing}
                  className="px-6 md:px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Iniciar Migração
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-10 p-6 bg-muted rounded-2xl">
              <h4 className="font-black text-foreground mb-3 flex items-center gap-2">
                <AlertCircle size={16} className="text-warning" />
                Instruções para Migração
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• O arquivo CSV deve conter as colunas obrigatórias: CNPJ, Razão Social, Status</li>
                <li>• Campos de data devem estar no formato DD/MM/AAAA</li>
                <li>• Valores monetários devem usar ponto como separador decimal</li>
                <li>• Faça um backup antes de iniciar a migração</li>
              </ul>
            </div>
          </div>

          {/* Recent Migrations */}
          <div className="bg-card rounded-[2rem] border border-border p-6 md:p-8 shadow-sm">
            <h3 className="text-xl font-black text-foreground mb-6">Histórico de Migrações</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <CheckCircle size={18} className="text-success" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">oscs_2023.csv</p>
                    <p className="text-[10px] text-muted-foreground">12/11/2024 às 14:32</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-success">32 registros</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <CheckCircle size={18} className="text-success" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">parcerias_exercicio_2022.csv</p>
                    <p className="text-[10px] text-muted-foreground">10/11/2024 às 09:15</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-success">18 registros</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-card rounded-[2rem] md:rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-foreground">Gestão de Usuários</h3>
              <p className="text-muted-foreground text-sm">Administre os acessos ao sistema MROSC.</p>
            </div>
            <Button onClick={() => setShowUserModal(true)} className="gap-2">
              <Plus size={16} />
              Novo Usuário
            </Button>
          </div>

          <div className="p-4 md:p-6 border-b border-border bg-muted/20">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                type="text" 
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Pesquisar usuário..." 
                className="pl-12 pr-6 py-3 bg-card border border-border rounded-2xl text-xs outline-none focus:ring-4 focus:ring-primary/10 w-full text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-muted/50 text-muted-foreground text-[10px] font-black uppercase tracking-[0.15em]">
                <tr>
                  <th className="px-4 md:px-6 py-5">Nome</th>
                  <th className="px-4 md:px-6 py-5">E-mail</th>
                  <th className="px-4 md:px-6 py-5">CPF</th>
                  <th className="px-4 md:px-6 py-5">Perfil</th>
                  <th className="px-4 md:px-6 py-5">Status</th>
                  <th className="px-4 md:px-6 py-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-all">
                    <td className="px-4 md:px-6 py-5">
                      <p className="font-bold text-foreground text-sm">{user.nome}</p>
                      <p className="text-[10px] text-muted-foreground">{user.criadoEm}</p>
                    </td>
                    <td className="px-4 md:px-6 py-5 text-xs text-muted-foreground">{user.email}</td>
                    <td className="px-4 md:px-6 py-5 text-xs font-mono text-muted-foreground">{user.cpf}</td>
                    <td className="px-4 md:px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase ${
                        user.perfil === 'Master' ? 'bg-primary/10 text-primary' :
                        user.perfil === 'Gestor' ? 'bg-info/10 text-info' :
                        user.perfil === 'Técnico' ? 'bg-success/10 text-success' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {user.perfil}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase ${
                        user.status === 'Ativo' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-5 text-right">
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => handleBlockUser(user.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.status === 'Ativo' 
                              ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' 
                              : 'bg-success/10 text-success hover:bg-success/20'
                          }`}
                          title={user.status === 'Ativo' ? 'Bloquear' : 'Desbloquear'}
                        >
                          <Lock size={14} />
                        </button>
                        <button 
                          onClick={() => handleResetPassword(user.id)}
                          className="p-2 bg-warning/10 text-warning rounded-lg hover:bg-warning/20 transition-colors"
                          title="Resetar Senha"
                        >
                          <KeyRound size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dictionary Tab */}
      {activeTab === 'dictionary' && (
        <div className="bg-card rounded-[2rem] md:rounded-[2.5rem] border border-border p-6 md:p-12 shadow-sm">
          <h3 className="text-xl md:text-2xl font-black text-foreground mb-2">Dicionário de Termos</h3>
          <p className="text-muted-foreground mb-8">
            Personalize os termos exibidos no sistema de acordo com a nomenclatura do seu município.
          </p>

          {/* Add New Term */}
          <div className="mb-8 p-6 bg-muted/50 rounded-2xl">
            <h4 className="font-black text-foreground mb-4 flex items-center gap-2">
              <Plus size={16} className="text-primary" />
              Adicionar Novo Termo
            </h4>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Chave do termo (ex: convenio)"
                className="flex-1 px-4 py-3 bg-card border border-border rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20 text-foreground"
                id="newTermKey"
              />
              <input
                type="text"
                placeholder="Valor personalizado (ex: Convênio)"
                className="flex-1 px-4 py-3 bg-card border border-border rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20 text-foreground"
                id="newTermValue"
              />
              <Button onClick={() => {
                const keyInput = document.getElementById('newTermKey') as HTMLInputElement;
                const valueInput = document.getElementById('newTermValue') as HTMLInputElement;
                if (keyInput?.value && valueInput?.value) {
                  setEditingLabels({ ...editingLabels, [keyInput.value]: valueInput.value });
                  keyInput.value = '';
                  valueInput.value = '';
                  toast({ title: "Termo adicionado!", description: "Clique em 'Salvar Dicionário' para confirmar." });
                }
              }} className="gap-2 whitespace-nowrap">
                <Plus size={16} />
                Adicionar
              </Button>
            </div>
          </div>

          <div className="space-y-6 max-w-xl">
            {Object.entries(editingLabels).map(([key, value]) => (
              <div key={key} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <label className="text-sm font-bold text-muted-foreground uppercase w-32 shrink-0">
                  {key}
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setEditingLabels({ ...editingLabels, [key]: e.target.value })}
                  className="flex-1 px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20 text-foreground"
                  placeholder={`Termo para ${key}`}
                />
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <Button onClick={handleSaveLabels} className="gap-2">
              <CheckCircle size={16} />
              Salvar Dicionário
            </Button>
          </div>

          <div className="mt-10 p-6 bg-muted rounded-2xl">
            <h4 className="font-black text-foreground mb-3 flex items-center gap-2">
              <AlertCircle size={16} className="text-info" />
              Onde os termos são aplicados
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Chamamento:</strong> Título do módulo de Chamamentos/Editais</li>
              <li>• <strong>Edital:</strong> Termo alternativo para processos seletivos</li>
              <li>• <strong>OSC:</strong> Organizações da Sociedade Civil</li>
              <li>• <strong>Parceria:</strong> Instrumentos de colaboração/fomento</li>
            </ul>
          </div>
        </div>
      )}

      {/* Infrastructure Tab */}
      {activeTab === 'infrastructure' && (
        <div className="space-y-6">
          <div className="bg-card rounded-[2rem] md:rounded-[2.5rem] border border-border p-6 md:p-12 shadow-sm">
            <h3 className="text-xl md:text-2xl font-black text-foreground mb-2">Infraestrutura e Segurança</h3>
            <p className="text-muted-foreground mb-8">
              Monitore o status dos servidores, backups e segurança do sistema.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Server Status */}
              <div className="bg-success/10 border border-success/30 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-success/20 rounded-xl">
                    <Server size={24} className="text-success" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-success uppercase tracking-widest">Status do Servidor</p>
                    <p className="text-2xl font-black text-success">Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm text-success font-medium">Operando normalmente</span>
                </div>
              </div>

              {/* Backup Status */}
              <div className="bg-success/10 border border-success/30 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-success/20 rounded-xl">
                    <Database size={24} className="text-success" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-success uppercase tracking-widest">Backup Automático</p>
                    <p className="text-2xl font-black text-success">Ativo</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw size={14} className="text-success" />
                  <span className="text-sm text-success font-medium">Executado a cada 4 horas</span>
                </div>
              </div>

              {/* Last Backup */}
              <div className="bg-muted border border-border rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Clock size={24} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Último Backup</p>
                    <p className="text-lg font-black text-foreground">
                      {lastBackupTime.toLocaleDateString('pt-BR')} às {lastBackupTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Há aproximadamente 1 hora</p>
              </div>

              {/* Data Retention */}
              <div className="bg-muted border border-border rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-info/10 rounded-xl">
                    <Shield size={24} className="text-info" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Retenção de Dados</p>
                    <p className="text-2xl font-black text-foreground">5 Anos</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Conforme exigência legal MROSC</p>
              </div>
            </div>

            {/* Restore Button */}
            <div className="mt-8 p-6 bg-warning/10 border border-warning/30 rounded-2xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-black text-warning text-lg">Restauração de Backup</h4>
                  <p className="text-sm text-warning/80">
                    Solicite a restauração de dados de uma data específica. A equipe técnica analisará o pedido.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowRestoreModal(true)}
                  className="border-warning text-warning hover:bg-warning/10 gap-2 shrink-0"
                >
                  <RefreshCw size={16} />
                  Solicitar Restauração
                </Button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-6 bg-muted rounded-2xl">
              <h4 className="font-black text-foreground mb-3 flex items-center gap-2">
                <AlertCircle size={16} className="text-info" />
                Informações de Segurança
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Backups são realizados automaticamente 6 vezes ao dia (a cada 4 horas)</li>
                <li>• Os dados são criptografados em trânsito e em repouso (AES-256)</li>
                <li>• Réplicas são mantidas em datacenter secundário geograficamente distante</li>
                <li>• Monitoramento 24/7 com alertas automáticos para a equipe técnica</li>
                <li>• Testes de restauração são realizados mensalmente</li>
              </ul>
            </div>
          </div>

          {/* Restore Modal */}
          <Dialog open={showRestoreModal} onOpenChange={setShowRestoreModal}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-black flex items-center gap-2">
                  <Phone size={20} className="text-primary" />
                  Solicitar Restauração de Backup
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 mt-4">
                <div className="p-4 bg-warning/10 border border-warning/30 rounded-xl">
                  <p className="text-sm text-warning font-medium">
                    Esta solicitação será enviada à equipe de suporte técnico para análise e execução.
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Data/Hora Desejada para Restauração *
                  </label>
                  <input
                    type="datetime-local"
                    value={restoreForm.dataDesejada}
                    onChange={(e) => setRestoreForm({ ...restoreForm, dataDesejada: e.target.value })}
                    className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Motivo da Restauração *
                  </label>
                  <Textarea
                    value={restoreForm.motivo}
                    onChange={(e) => setRestoreForm({ ...restoreForm, motivo: e.target.value })}
                    placeholder="Descreva o motivo da necessidade de restauração..."
                    rows={4}
                    className="bg-muted"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowRestoreModal(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleRestoreRequest} 
                    disabled={!restoreForm.dataDesejada || !restoreForm.motivo}
                    className="flex-1 gap-2"
                  >
                    <Phone size={16} />
                    Enviar Solicitação
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* New User Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Novo Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-5 mt-4">
            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                value={userFormData.nome}
                onChange={(e) => setUserFormData({ ...userFormData, nome: e.target.value })}
                required
                className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20 text-foreground"
                placeholder="Nome do usuário"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                E-mail *
              </label>
              <input
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                required
                className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20 text-foreground"
                placeholder="email@exemplo.com.br"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                CPF *
              </label>
              <input
                type="text"
                value={userFormData.cpf}
                onChange={(e) => setUserFormData({ ...userFormData, cpf: e.target.value })}
                required
                className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20 text-foreground"
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                Perfil de Acesso *
              </label>
              <select
                value={userFormData.perfil}
                onChange={(e) => setUserFormData({ ...userFormData, perfil: e.target.value as MockUser['perfil'] })}
                required
                className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/20 appearance-none cursor-pointer text-foreground"
              >
                <option value="Master">Master</option>
                <option value="Gestor">Gestor</option>
                <option value="Técnico">Técnico</option>
                <option value="OSC">OSC</option>
              </select>
            </div>
            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowUserModal(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 gap-2">
                <Plus size={16} />
                Criar Usuário
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSettings;

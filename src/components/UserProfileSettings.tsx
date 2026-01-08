import React, { useState } from 'react';
import { User, Settings, Plus, Users, Mail, Shield, Edit, Save, X, Key, Building, Bell, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserRole } from '@/types';

interface UserProfileSettingsProps {
  user: {
    name: string;
    email?: string;
    role: UserRole;
    department?: string;
    avatar?: string;
  };
  isMaster?: boolean;
  isOSC?: boolean;
  oscName?: string;
}

const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({ 
  user, 
  isMaster = false, 
  isOSC = false,
  oscName = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email || '',
    department: user.department || '',
    institution: oscName || '', // Nome da instituição para OSC
    phone: '',
  });
  
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: 'Usuário OSC',
    department: '',
    password: '',
  });

  const [createdUsers, setCreatedUsers] = useState<Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
  }>>([
    { id: '1', name: 'Maria Silva', email: 'maria@osc.org.br', role: 'Usuário OSC', status: 'Ativo' },
    { id: '2', name: 'João Santos', email: 'joao@unai.mg.gov.br', role: 'Gestor', status: 'Ativo' },
    { id: '3', name: 'Ana Costa', email: 'ana@osc.org.br', role: 'Representante Legal OSC', status: 'Ativo' },
    { id: '4', name: 'Carlos Oliveira', email: 'carlos@unai.mg.gov.br', role: 'Controle Interno', status: 'Ativo' },
  ]);

  // Pending user approvals - only for Gestor and Técnico roles
  const [pendingApprovals, setPendingApprovals] = useState<Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    requestedAt: string;
  }>>([
    { id: 'p1', name: 'Fernando Mendes', email: 'fernando@unai.mg.gov.br', role: 'Gestor', department: 'Secretaria de Cultura', requestedAt: '2024-01-15' },
    { id: 'p2', name: 'Camila Rodrigues', email: 'camila@unai.mg.gov.br', role: 'Técnico', department: 'Secretaria de Assistência Social', requestedAt: '2024-01-14' },
    { id: 'p3', name: 'Roberto Lima', email: 'roberto@unai.mg.gov.br', role: 'Gestor', department: 'Secretaria de Educação', requestedAt: '2024-01-13' },
  ]);

  const handleApproveUser = (userId: string) => {
    const user = pendingApprovals.find(u => u.id === userId);
    if (user) {
      // Add to active users
      setCreatedUsers(prev => [...prev, {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        status: 'Ativo'
      }]);
      // Remove from pending
      setPendingApprovals(prev => prev.filter(u => u.id !== userId));
      toast.success(`Usuário ${user.name} aprovado com sucesso! Um e-mail de confirmação foi enviado.`);
    }
  };

  const handleRejectUser = (userId: string) => {
    const user = pendingApprovals.find(u => u.id === userId);
    if (user) {
      setPendingApprovals(prev => prev.filter(u => u.id !== userId));
      toast.info(`Solicitação de ${user.name} foi rejeitada.`);
    }
  };

  const handleSaveProfile = () => {
    toast.success('Perfil atualizado com sucesso!');
    setIsEditing(false);
  };

  const handleCreateUser = () => {
    if (!newUserData.name || !newUserData.email || !newUserData.password) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      name: newUserData.name,
      email: newUserData.email,
      role: newUserData.role,
      status: 'Ativo',
    };

    setCreatedUsers(prev => [...prev, newUser]);
    setNewUserData({ name: '', email: '', role: 'Usuário OSC', department: '', password: '' });
    setShowCreateUser(false);
    toast.success(`Usuário ${newUser.name} criado com sucesso!`);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Master':
      case 'Administrador':
        return 'bg-purple-100 text-purple-700';
      case 'Gestor':
        return 'bg-blue-100 text-blue-700';
      case 'Técnico':
        return 'bg-green-100 text-green-700';
      case 'Controle Interno':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-3 px-4 py-3 hover:bg-muted rounded-xl transition-colors w-full text-left">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={20} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email || user.role}</p>
          </div>
          <Settings size={16} className="text-muted-foreground" />
        </button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User size={20} />
            Meu Perfil
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="mt-4">
          <TabsList className={`grid w-full ${isMaster ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            {isMaster && <TabsTrigger value="users">Usuários</TabsTrigger>}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4 mt-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User size={40} className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{profileData.name}</h3>
                <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Nome Completo</label>
                <Input
                  value={profileData.name}
                  onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">E-mail</label>
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              
              {/* Campo diferente para OSC: Nome da Instituição ao invés de Departamento */}
              {isOSC ? (
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block flex items-center gap-1">
                    <Building size={12} /> Nome da Instituição
                  </label>
                  <Input
                    value={profileData.institution}
                    onChange={e => setProfileData({ ...profileData, institution: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Nome da OSC"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Departamento</label>
                  <Input
                    value={profileData.department}
                    onChange={e => setProfileData({ ...profileData, department: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              )}
              
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Telefone</label>
                <Input
                  value={profileData.phone}
                  onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              {isEditing ? (
                <>
                  <Button onClick={handleSaveProfile} className="flex-1 gap-2">
                    <Save size={16} /> Salvar
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X size={16} />
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                  <Edit size={16} /> Editar Perfil
                </Button>
              )}
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Key size={18} /> Alterar Senha
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Senha Atual</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Nova Senha</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Confirmar Nova Senha</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <Button className="w-full">Alterar Senha</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield size={18} /> Sessões Ativas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-muted rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm">Este dispositivo</p>
                    <p className="text-xs text-muted-foreground">Chrome • Windows • Ativo agora</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Atual</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab (Master only) */}
          {isMaster && (
            <TabsContent value="users" className="space-y-4 mt-4">
              {/* Pending Approvals Section */}
              {pendingApprovals.length > 0 && (
                <Card className="border-warning/50 bg-warning/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-warning">
                      <Bell size={18} className="animate-pulse" />
                      Aprovação de Novos Usuários
                      <Badge className="bg-warning text-warning-foreground ml-2">{pendingApprovals.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground mb-4">
                      Os seguintes usuários solicitaram acesso como Gestor ou Técnico e aguardam sua aprovação:
                    </p>
                    {pendingApprovals.map(u => (
                      <div key={u.id} className="p-4 bg-card rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                            <Clock size={18} className="text-warning" />
                          </div>
                          <div>
                            <p className="font-semibold">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getRoleColor(u.role)}>{u.role}</Badge>
                              <span className="text-xs text-muted-foreground">• {u.department}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveUser(u.id)}
                            className="gap-1 bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                          >
                            <CheckCircle size={14} /> Aprovar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRejectUser(u.id)}
                            className="gap-1 text-destructive border-destructive hover:bg-destructive/10 flex-1 sm:flex-none"
                          >
                            <XCircle size={14} /> Rejeitar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Gerenciar Usuários</h3>
                <Button onClick={() => setShowCreateUser(true)} className="gap-2">
                  <Plus size={16} /> Novo Usuário
                </Button>
              </div>

              <div className="space-y-3">
                {createdUsers.map(u => (
                  <Card key={u.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getRoleColor(u.role)}>{u.role}</Badge>
                        <Badge className={u.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {u.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Create User Dialog */}
              <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Plus size={18} /> Criar Novo Usuário
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Nome Completo *</label>
                      <Input
                        value={newUserData.name}
                        onChange={e => setNewUserData({ ...newUserData, name: e.target.value })}
                        placeholder="Nome do usuário"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">E-mail *</label>
                      <Input
                        type="email"
                        value={newUserData.email}
                        onChange={e => setNewUserData({ ...newUserData, email: e.target.value })}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Perfil de Acesso *</label>
                      <Select value={newUserData.role} onValueChange={v => setNewUserData({ ...newUserData, role: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Usuário OSC">Usuário OSC</SelectItem>
                          <SelectItem value="Responsável Legal OSC">Responsável Legal OSC</SelectItem>
                          <SelectItem value="Gestor">Gestor</SelectItem>
                          <SelectItem value="Técnico">Técnico</SelectItem>
                          <SelectItem value="Controle Interno">Controle Interno</SelectItem>
                          <SelectItem value="Comissão de Seleção">Comissão de Seleção</SelectItem>
                          <SelectItem value="Procuradoria">Procuradoria</SelectItem>
                          <SelectItem value="Administrador">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Departamento</label>
                      <Input
                        value={newUserData.department}
                        onChange={e => setNewUserData({ ...newUserData, department: e.target.value })}
                        placeholder="Ex: Secretaria de Cultura"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Senha Inicial *</label>
                      <Input
                        type="password"
                        value={newUserData.password}
                        onChange={e => setNewUserData({ ...newUserData, password: e.target.value })}
                        placeholder="••••••••"
                      />
                    </div>
                    <Button onClick={handleCreateUser} className="w-full gap-2">
                      <Users size={16} /> Criar Usuário
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileSettings;

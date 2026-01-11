import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle, Eye, UserPlus, Building2, Phone, User, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Registration request modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    razao_social: '',
    cnpj: '',
    nome_responsavel: '',
    email_responsavel: '',
    telefone: '',
    justificativa: '',
  });
  const [sendingRegister, setSendingRegister] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const { user, signIn } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if redirected from transparency portal
  const fromTransparency = location.state?.fromTransparency || false;

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('E-mail ou senha incorretos.');
        } else {
          setError(error.message);
        }
      }
    } catch (err: any) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegisterRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingRegister(true);
    
    try {
      // Send email to admin via edge function
      const { error } = await supabase.functions.invoke('send-support-notification', {
        body: {
          type: 'registration_request',
          subject: `[SOLICITAÇÃO DE CADASTRO] Nova OSC: ${registerForm.razao_social}`,
          content: `
Uma nova OSC solicitou cadastro no sistema MROSC Digital.

DADOS DA ORGANIZAÇÃO:
- Razão Social: ${registerForm.razao_social}
- CNPJ: ${registerForm.cnpj}

DADOS DO RESPONSÁVEL:
- Nome: ${registerForm.nome_responsavel}
- E-mail: ${registerForm.email_responsavel}
- Telefone: ${registerForm.telefone}

JUSTIFICATIVA:
${registerForm.justificativa}

---
Esta solicitação foi enviada através do Portal da Transparência.
Acesse o painel administrativo para aprovar ou rejeitar este cadastro.
          `,
          metadata: {
            tipo: 'solicitacao_cadastro',
            osc: registerForm.razao_social,
            cnpj: registerForm.cnpj,
            email: registerForm.email_responsavel,
          }
        }
      });
      
      if (error) throw error;
      
      setRegisterSuccess(true);
      toast({
        title: "Solicitação enviada!",
        description: "O Administrador analisará sua solicitação em breve.",
      });
    } catch (err) {
      console.error('Error sending registration request:', err);
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setSendingRegister(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sidebar-background via-sidebar-background to-primary/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-3xl shadow-2xl mb-6">
            {theme.logoUrl ? (
              <img src={theme.logoUrl} alt={theme.organizationName} className="w-16 h-16 object-contain" />
            ) : (
              <ShieldCheck size={40} className="text-primary-foreground" />
            )}
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter">
            MROSC<span className="text-primary">Digital</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium mt-2">
            Sistema de Gestão de Parcerias • {theme.organizationName.split(' ').slice(-1)[0]}
          </p>
        </div>
        
        {/* Alert for users coming from transparency portal */}
        {fromTransparency && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-primary shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-bold text-foreground">Login necessário</p>
              <p className="text-xs text-muted-foreground">
                Para inscrever uma proposta em chamamento público, faça login com sua conta de OSC ou solicite cadastro.
              </p>
            </div>
          </div>
        )}

        {/* Card de Login */}
        <div className="bg-card rounded-[2.5rem] shadow-2xl p-10 border border-border">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-black text-foreground uppercase tracking-widest">
              Acesso ao Sistema
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Entre com suas credenciais institucionais
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-12 pr-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-2xl text-sm">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-xl shadow-primary/30 flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  Acessar Sistema
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Esqueceu sua senha?{' '}
            <button className="text-primary font-bold hover:underline">
              Recuperar acesso
            </button>
          </p>
          
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-4">
              Sua OSC ainda não possui acesso ao sistema?
            </p>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="w-full py-4 bg-success/10 text-success border border-success/30 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-success/20 hover:border-success/50 flex items-center justify-center gap-3 transition-all"
            >
              <UserPlus size={18} />
              Solicitar Cadastro de OSC
            </button>
          </div>

          {/* Botão Acesso Cidadão */}
          <Link
            to="/transparency"
            className="mt-4 w-full py-4 bg-muted/50 text-foreground border border-border rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/10 hover:border-primary/30 hover:text-primary flex items-center justify-center gap-3 transition-all"
          >
            <Eye size={18} />
            Acesso Cidadão (Portal da Transparência)
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-white/40 text-[10px] font-medium mt-8 uppercase tracking-widest">
          Lei Federal 13.019/2014 • Lei Municipal 3.083/2017
        </p>
      </div>
      
      {/* Registration Request Modal */}
      <Dialog open={showRegisterModal} onOpenChange={(open) => {
        setShowRegisterModal(open);
        if (!open) {
          setRegisterSuccess(false);
          setRegisterForm({
            razao_social: '',
            cnpj: '',
            nome_responsavel: '',
            email_responsavel: '',
            telefone: '',
            justificativa: '',
          });
        }
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <Building2 className="text-primary" />
              Solicitar Cadastro de OSC
            </DialogTitle>
          </DialogHeader>
          
          {registerSuccess ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="text-success" size={32} />
              </div>
              <h3 className="text-lg font-black text-foreground mb-2">Solicitação Enviada!</h3>
              <p className="text-sm text-muted-foreground mb-6">
                O Administrador Master receberá sua solicitação e entrará em contato pelo e-mail informado.
              </p>
              <Button onClick={() => setShowRegisterModal(false)}>
                Fechar
              </Button>
            </div>
          ) : (
            <form onSubmit={handleRegisterRequest} className="space-y-4 mt-4">
              <div className="bg-muted/50 p-4 rounded-xl border border-border">
                <p className="text-xs text-muted-foreground">
                  Preencha os dados abaixo para solicitar o cadastro da sua OSC no sistema. 
                  O Administrador analisará sua solicitação e, se aprovada, enviará as credenciais de acesso por e-mail.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Razão Social da OSC *
                </Label>
                <Input
                  value={registerForm.razao_social}
                  onChange={(e) => setRegisterForm({ ...registerForm, razao_social: e.target.value })}
                  placeholder="Nome completo da organização"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  CNPJ *
                </Label>
                <Input
                  value={registerForm.cnpj}
                  onChange={(e) => setRegisterForm({ ...registerForm, cnpj: e.target.value })}
                  placeholder="00.000.000/0001-00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Nome do Responsável Legal *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    className="pl-10"
                    value={registerForm.nome_responsavel}
                    onChange={(e) => setRegisterForm({ ...registerForm, nome_responsavel: e.target.value })}
                    placeholder="Nome completo"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  E-mail do Responsável *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    type="email"
                    className="pl-10"
                    value={registerForm.email_responsavel}
                    onChange={(e) => setRegisterForm({ ...registerForm, email_responsavel: e.target.value })}
                    placeholder="email@organizacao.org.br"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Telefone de Contato *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    className="pl-10"
                    value={registerForm.telefone}
                    onChange={(e) => setRegisterForm({ ...registerForm, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Justificativa / Observações
                </Label>
                <Textarea
                  value={registerForm.justificativa}
                  onChange={(e) => setRegisterForm({ ...registerForm, justificativa: e.target.value })}
                  placeholder="Descreva brevemente o objetivo da sua OSC e o motivo da solicitação de cadastro..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowRegisterModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 gap-2"
                  disabled={sendingRegister}
                >
                  {sendingRegister ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <ArrowRight size={16} />
                      Enviar Solicitação
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Usuário OSC');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('E-mail ou senha incorretos.');
          } else {
            setError(error.message);
          }
        }
      } else {
        if (password.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres.');
          setLoading(false);
          return;
        }
        
        const { error } = await signUp(email, password, fullName, role);
        if (error) {
          if (error.message.includes('already registered')) {
            setError('Este e-mail já está cadastrado. Faça login.');
          } else {
            setError(error.message);
          }
        } else {
          setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro.');
        }
      }
    } catch (err: any) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    'Usuário OSC',
    'Representante Legal OSC',
    'Gestor da Parceria',
    'Técnico - Execução Física',
    'Técnico - Execução Financeira',
    'Comissão de Seleção',
    'Comissão de Monitoramento',
    'Conselhos Municipais',
    'Procuradoria Jurídica',
    'Controle Interno',
    'Administrador Master',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sidebar-background via-sidebar-background to-primary/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-3xl shadow-2xl mb-6">
            <ShieldCheck size={40} className="text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter">
            MROSC<span className="text-primary">Digital</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium mt-2">
            Sistema de Gestão de Parcerias • Unaí/MG
          </p>
        </div>

        {/* Card de Login/Registro */}
        <div className="bg-card rounded-[2.5rem] shadow-2xl p-10 border border-border">
          {/* Toggle Login/Registro */}
          <div className="flex bg-muted p-1.5 rounded-2xl mb-8">
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                isLogin ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                !isLogin ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                    required={!isLogin}
                    className="w-full pl-12 pr-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            )}

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

            {!isLogin && (
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  Perfil de Acesso
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-4 bg-muted rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-2xl text-sm">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 p-4 bg-success/10 text-success rounded-2xl text-sm">
                <ShieldCheck size={18} />
                <span>{success}</span>
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
                  {isLogin ? 'Acessar Sistema' : 'Criar Conta'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {isLogin && (
            <p className="text-center text-xs text-muted-foreground mt-6">
              Esqueceu sua senha?{' '}
              <button className="text-primary font-bold hover:underline">
                Recuperar acesso
              </button>
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-white/40 text-[10px] font-medium mt-8 uppercase tracking-widest">
          Lei Federal 13.019/2014 • Lei Municipal 3.083/2017
        </p>
      </div>
    </div>
  );
};

export default Auth;

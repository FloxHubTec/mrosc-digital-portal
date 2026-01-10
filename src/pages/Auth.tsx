import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, signIn } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

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
          
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              A criação de novos usuários é restrita ao Administrador.
            </p>
          </div>
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

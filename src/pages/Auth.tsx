import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, User, Mail, Lock, AlertCircle, Eye, EyeOff, ArrowRight, Flame, Target, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotMode, setForgotMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const validateForm = () => {
    if (!formData.email) {
      setError("Email é obrigatório");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Email inválido");
      return false;
    }
    if (forgotMode) return true;
    if (!formData.password) {
      setError("Senha é obrigatória");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres");
      return false;
    }
    if (!isLogin && !formData.name) {
      setError("Nome é obrigatório para cadastro");
      return false;
    }
    return true;
  };

  const handleForgotPassword = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setError(error.message);
      } else {
        toast({
          title: "Email enviado! 📧",
          description: "Verifique sua caixa de entrada para redefinir a senha",
        });
        setForgotMode(false);
      }
    } catch {
      setError("Erro ao enviar email. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (forgotMode) {
      handleForgotPassword();
      return;
    }

    if (!validateForm()) return;
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setError(
            error.message.includes("Invalid login credentials")
              ? "Email ou senha incorretos"
              : error.message
          );
        } else {
          toast({
            title: "Bem-vinda de volta! 🎉",
            description: "Login realizado com sucesso",
          });
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.name);
        if (error) {
          setError(
            error.message.includes("already registered")
              ? "Este email já está cadastrado"
              : error.message
          );
        } else {
          toast({
            title: "Conta criada! 🌱",
            description: "Sua jornada no Vertice começou",
          });
        }
      }
    } catch {
      setError("Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-primary opacity-40" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const features = [
    { icon: Target, text: "Organize sua rotina e hábitos" },
    { icon: Flame, text: "Acompanhe seu progresso diário" },
    { icon: Heart, text: "Cuide do corpo e da mente" },
  ];

  return (
    <div className="min-h-screen w-full flex bg-background relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px] -top-40 -left-40 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-secondary/8 blur-[120px] bottom-0 right-0 pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-accent/6 blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Left Panel — Branding (desktop only) */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] xl:w-[520px] shrink-0 p-10 relative">
        {/* Gradient overlay */}
        <div className="absolute inset-0 gradient-primary opacity-[0.07] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Vertice
            </h1>
          </div>

          <h2 className="text-4xl xl:text-5xl font-bold text-foreground leading-tight mb-6">
            Sua vida mais{" "}
            <span className="text-gradient">organizada</span>,{" "}
            <br className="hidden xl:block" />
            um dia de cada vez.
          </h2>

          <p className="text-muted-foreground text-lg mb-10 max-w-sm leading-relaxed">
            Hábitos, finanças, autocuidado e comunidade — tudo em um só lugar.
          </p>

          <div className="space-y-5">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-foreground/80 text-[15px]">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-muted-foreground/50 text-sm relative z-10">
          © {new Date().getFullYear()} Vertice · Todos os direitos reservados
        </p>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl gradient-primary mb-4 shadow-lg shadow-primary/25">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Vertice
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Sua jornada começa aqui</p>
          </div>

          {/* Card */}
          <div className="glass-card p-7 sm:p-8">
            {/* Header */}
            <div className="mb-7">
              <h2 className="text-xl font-bold text-foreground">
                {forgotMode
                  ? "Recuperar senha"
                  : isLogin
                  ? "Bem-vinda de volta"
                  : "Crie sua conta"}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {forgotMode
                  ? "Informe seu email para receber o link"
                  : isLogin
                  ? "Entre para continuar sua jornada"
                  : "Comece a transformar sua rotina"}
              </p>
            </div>

            {/* Toggle (hidden in forgot mode) */}
            {!forgotMode && (
              <div className="flex gap-1 mb-6 p-1 bg-muted/50 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setIsLogin(true); setError(null); }}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    isLogin
                      ? "btn-gradient shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => { setIsLogin(false); setError(null); }}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    !isLogin
                      ? "btn-gradient shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Cadastrar
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 mb-5 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && !forgotMode && (
                <div className="relative animate-fade-in">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Nome completo"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-muted/40 border border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                    disabled={loading}
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-muted/40 border border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                  disabled={loading}
                />
              </div>

              {!forgotMode && (
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Senha"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-12 py-3.5 bg-muted/40 border border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              )}

              {isLogin && !forgotMode && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => { setForgotMode(true); setError(null); }}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 btn-gradient text-sm font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {forgotMode ? "Enviando..." : isLogin ? "Entrando..." : "Criando conta..."}
                  </>
                ) : (
                  <>
                    {forgotMode ? "Enviar link" : isLogin ? "Entrar" : "Criar conta"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Forgot mode back link */}
            {forgotMode && (
              <button
                type="button"
                onClick={() => { setForgotMode(false); setError(null); }}
                className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors mt-5"
              >
                ← Voltar ao login
              </button>
            )}
          </div>

          {/* Footer toggle */}
          {!forgotMode && (
            <p className="text-center text-muted-foreground text-sm mt-6">
              {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(null); }}
                className="text-primary hover:text-primary/80 transition-colors font-semibold"
              >
                {isLogin ? "Cadastre-se" : "Entre"}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;

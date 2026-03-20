import { Lock, Sparkles, Droplets, Leaf, Shield, TrendingUp, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const sampleSchedule = [
  { week: "Semana 1", type: "Hidratação", emoji: "💧", desc: "Reposição de água e brilho" },
  { week: "Semana 2", type: "Nutrição", emoji: "🥑", desc: "Óleos e vitaminas essenciais" },
  { week: "Semana 3", type: "Reconstrução", emoji: "🔧", desc: "Fortalecimento da fibra capilar" },
  { week: "Semana 4", type: "Hidratação", emoji: "💧", desc: "Manutenção e equilíbrio" },
];

const benefits = [
  { icon: Droplets, title: "Cabelo mais saudável", desc: "Tratamentos personalizados para seu tipo de fio" },
  { icon: Shield, title: "Redução de quebra", desc: "Fortalecimento com produtos certos para você" },
  { icon: TrendingUp, title: "Crescimento mais forte", desc: "Rotina que estimula o crescimento natural" },
  { icon: Star, title: "Rotina guiada", desc: "Acompanhamento semanal da especialista Yara" },
];

const HairCarePreview = () => {
  const handleCTA = () => {
    window.open("https://wa.me/5500000000000?text=Olá Yara! Quero meu cronograma capilar personalizado 💇‍♀️", "_blank");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="bg-primary p-6 md:p-10 text-primary-foreground text-center space-y-3">
          <span className="text-4xl">💇‍♀️</span>
          <h2 className="text-xl md:text-2xl font-bold leading-tight" style={{ lineHeight: "1.1" }}>
            Cronograma Capilar Personalizado
          </h2>
          <p className="text-primary-foreground/80 text-sm max-w-md mx-auto">
            Criado sob medida para o seu tipo de cabelo pela especialista <strong className="text-primary-foreground">Yara Cristina</strong>.
          </p>
        </div>
      </div>

      {/* Sample Schedule — blurred */}
      <div className="glass-card rounded-2xl p-5 md:p-6 space-y-4 relative">
        <div className="flex items-center gap-2 mb-1">
          <Leaf className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Exemplo de Cronograma</h3>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 blur-[2px] select-none pointer-events-none">
            {sampleSchedule.map((item) => (
              <div key={item.week} className="rounded-xl p-4 bg-muted/60 border border-border/50 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">{item.week}</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.emoji}</span>
                  <span className="font-semibold text-sm text-foreground">{item.type}</span>
                </div>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Lock overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[1px] rounded-xl">
            <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mb-3">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <p className="font-semibold text-sm text-center text-foreground">Seu cronograma personalizado está disponível</p>
            <p className="text-xs text-muted-foreground text-center mt-1 max-w-[240px]">
              Solicite acesso para liberar seu plano exclusivo
            </p>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="glass-card rounded-2xl p-5 md:p-6 space-y-4">
        <h3 className="font-semibold text-sm flex items-center gap-2 text-foreground">
          <Sparkles className="w-4 h-4 text-primary" />
          O que você recebe
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="flex gap-3 p-3 rounded-xl bg-muted/40 border border-border/40">
                <div className="w-9 h-9 rounded-lg bg-primary/12 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{b.title}</p>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="glass-card rounded-2xl p-6 md:p-8 text-center space-y-4">
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Tenha um plano exclusivo feito para o <strong className="text-foreground">seu</strong> cabelo, com acompanhamento real da Yara.
        </p>
        <Button
          onClick={handleCTA}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-8 active:scale-[0.97] transition-all"
        >
          Quero meu cronograma
          <ArrowRight className="w-4 h-4" />
        </Button>
        <p className="text-xs text-muted-foreground">
          Ao clicar, você será redirecionada para falar com a Yara
        </p>
      </div>
    </div>
  );
};

export default HairCarePreview;

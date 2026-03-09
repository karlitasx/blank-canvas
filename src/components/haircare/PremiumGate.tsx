import { Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const PremiumGate = () => {
  return (
    <div className="glass-card p-8 md:p-12 rounded-2xl text-center space-y-6 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto">
        <Crown className="w-8 h-8 text-white" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold">Cronograma Capilar da Yara</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Esse recurso faz parte do plano premium. Tenha acesso ao seu cronograma
          capilar personalizado, criado especialmente para o seu tipo de cabelo.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white gap-2">
          <Sparkles className="w-4 h-4" />
          Conhecer assinatura
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-lg mx-auto">
        {[
          { icon: "💧", title: "Hidratação", desc: "Programada para seu cabelo" },
          { icon: "🥑", title: "Nutrição", desc: "Produtos recomendados" },
          { icon: "🔧", title: "Reconstrução", desc: "Acompanhamento da Yara" },
        ].map((item) => (
          <div key={item.title} className="p-3 rounded-xl bg-muted/50 space-y-1">
            <span className="text-2xl">{item.icon}</span>
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PremiumGate;

import { useState, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

const motivationalQuotes = [
  "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
  "Sua única limitação é aquela que você impõe à sua própria mente.",
  "Cada dia é uma nova oportunidade para mudar sua vida.",
  "A disciplina é a ponte entre metas e realizações.",
  "Foco no progresso, não na perfeição.",
  "Você é mais forte do que imagina.",
  "Grandes conquistas começam com pequenos passos.",
  "Acredite em você e tudo será possível.",
  "O melhor momento para começar é agora.",
  "Transforme seus sonhos em metas e suas metas em realidade.",
  "A persistência realiza o impossível.",
  "Sua atitude determina sua altitude.",
  "Não espere por oportunidades, crie-as.",
  "O sucesso não é final, o fracasso não é fatal.",
  "Faça hoje o que outros não farão, tenha amanhã o que outros não terão.",
  "A jornada de mil milhas começa com um único passo.",
  "Seja a mudança que você quer ver no mundo.",
  "Desafios são oportunidades disfarçadas.",
  "Quem tem um porquê enfrenta qualquer como.",
  "A excelência não é um ato, mas um hábito.",
];

const HeroSection = () => {
  const { user } = useAuth();
  const { profile, displayName, getInitials } = useProfile();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Memoize quote to prevent re-renders
  const quote = useMemo(
    () => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)],
    []
  );

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const hour = currentTime.getHours();
  let greeting = "Boa noite";
  let emoji = "🌙";
  if (hour < 12) {
    greeting = "Bom dia";
    emoji = "☀️";
  } else if (hour < 18) {
    greeting = "Boa tarde";
    emoji = "🌤️";
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 mb-6 bg-card border border-border">
      {/* Subtle background accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="w-20 h-20 md:w-24 md:h-24 border-2 border-border">
            <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="text-2xl md:text-3xl bg-primary text-primary-foreground">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Greeting and Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-semibold mb-1">
            {greeting}, <span className="text-primary">{displayName}</span>! {emoji}
          </h1>
          
          {/* Date and Time */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-3 text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span className="text-sm capitalize">{formatDate(currentTime)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{formatTime(currentTime)}</span>
            </div>
          </div>

          {/* Motivational Quote */}
          <div className="bg-muted/50 p-3 rounded-lg max-w-xl">
            <p className="text-sm italic text-muted-foreground">
              "{quote}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

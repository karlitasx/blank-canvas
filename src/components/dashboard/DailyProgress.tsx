import { useState, useEffect } from "react";
import { Target, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Goal {
  id: number;
  name: string;
  completed: boolean;
  category: string;
}

const mockGoals: Goal[] = [
  { id: 1, name: "Beber 2L de água", completed: true, category: "Saúde" },
  { id: 2, name: "Meditação 10 minutos", completed: true, category: "Bem-estar" },
  { id: 3, name: "Exercício físico", completed: false, category: "Saúde" },
  { id: 4, name: "Leitura 30 minutos", completed: false, category: "Crescimento" },
  { id: 5, name: "Revisar finanças", completed: true, category: "Finanças" },
  { id: 6, name: "Praticar gratidão", completed: false, category: "Bem-estar" },
  { id: 7, name: "Estudar 1 hora", completed: true, category: "Crescimento" },
];

const DailyProgress = () => {
  const navigate = useNavigate();
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  const completedGoals = mockGoals.filter(g => g.completed).length;
  const totalGoals = mockGoals.length;
  const progressPercent = Math.round((completedGoals / totalGoals) * 100);
  
  const topGoals = mockGoals.slice(0, 3);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progressPercent);
    }, 100);
    return () => clearTimeout(timer);
  }, [progressPercent]);

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg logo-gradient">
          <Target className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-semibold text-lg">Progresso Diário</h3>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Animated Progress Circle */}
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-white/10"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="url(#progressGradient)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(270, 70%, 60%)" />
                <stop offset="50%" stopColor="hsl(300, 70%, 60%)" />
                <stop offset="100%" stopColor="hsl(330, 80%, 65%)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{animatedProgress}%</span>
            <span className="text-xs text-muted-foreground">completo</span>
          </div>
        </div>

        {/* Goals Info */}
        <div className="flex-1 w-full">
          <div className="mb-4">
            <p className="text-2xl font-bold">
              {completedGoals} <span className="text-muted-foreground text-base font-normal">de {totalGoals} metas</span>
            </p>
            <p className="text-sm text-muted-foreground">Você está indo muito bem! 🎯</p>
          </div>

          {/* Top 3 Goals */}
          <div className="space-y-2 mb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Metas principais</p>
            {topGoals.map((goal) => (
              <div
                key={goal.id}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  goal.completed ? "bg-green-500/10" : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  goal.completed 
                    ? "border-green-500 bg-green-500" 
                    : "border-muted-foreground"
                }`}>
                  {goal.completed && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-sm flex-1 ${goal.completed ? "line-through text-muted-foreground" : ""}`}>
                  {goal.name}
                </span>
                <span className="text-xs text-muted-foreground">{goal.category}</span>
              </div>
            ))}
          </div>

          <Button 
            variant="outline" 
            className="w-full group"
            onClick={() => navigate("/habits")}
          >
            Ver todas as metas
            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DailyProgress;

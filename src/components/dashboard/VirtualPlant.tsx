import { useState, useEffect, useMemo } from "react";
import { Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import AnimatedPlant from "./AnimatedPlant";
import confetti from "canvas-confetti";

interface PlantStage {
  name: string;
  color: string;
  minProgress: number;
  description: string;
}

const plantStages: PlantStage[] = [
  { 
    name: "Semente", 
    color: "from-amber-600 to-amber-800",
    minProgress: 0,
    description: "Sua jornada está começando!"
  },
  { 
    name: "Broto", 
    color: "from-lime-400 to-green-500",
    minProgress: 20,
    description: "Você está crescendo!"
  },
  { 
    name: "Planta Pequena", 
    color: "from-green-400 to-emerald-600",
    minProgress: 40,
    description: "Continue assim!"
  },
  { 
    name: "Planta Média", 
    color: "from-emerald-400 to-teal-600",
    minProgress: 60,
    description: "Você está florescendo!"
  },
  { 
    name: "Planta Florida", 
    color: "from-pink-400 via-purple-400 to-indigo-500",
    minProgress: 80,
    description: "Incrível! Sua planta está linda!"
  },
];

// Progress calculation weights
const WEIGHTS = {
  habits: 0.30,      // 30% - hábitos completos
  goals: 0.25,       // 25% - metas alcançadas
  streak: 0.20,      // 20% - dias consecutivos
  tasks: 0.15,       // 15% - tarefas feitas
  selfCare: 0.10,    // 10% - autocuidado
};

const VirtualPlant = () => {
  // These would come from real data/context
  const [progressData] = useState({
    habitsCompleted: 75,    // percentage of habits done today
    goalsAchieved: 60,      // percentage of goals met
    streakDays: 7,          // consecutive days (max 30 for 100%)
    tasksCompleted: 80,     // percentage of tasks done
    selfCareScore: 50,      // self-care check-in score
  });

  const [showSparkle, setShowSparkle] = useState(false);
  const [isEvolvingAnimation, setIsEvolvingAnimation] = useState(false);
  const [previousStage, setPreviousStage] = useState(0);

  // Calculate weighted progress
  const weeklyProgress = Math.round(
    progressData.habitsCompleted * WEIGHTS.habits +
    progressData.goalsAchieved * WEIGHTS.goals +
    Math.min(progressData.streakDays / 30, 1) * 100 * WEIGHTS.streak +
    progressData.tasksCompleted * WEIGHTS.tasks +
    progressData.selfCareScore * WEIGHTS.selfCare
  );

  const getCurrentStage = (progress: number) => {
    for (let i = plantStages.length - 1; i >= 0; i--) {
      if (progress >= plantStages[i].minProgress) {
        return i;
      }
    }
    return 0;
  };

  const currentStageIndex = getCurrentStage(weeklyProgress);
  const currentStage = plantStages[currentStageIndex];
  const nextStage = plantStages[currentStageIndex + 1];
  
  const progressToNextStage = nextStage 
    ? Math.round(((weeklyProgress - currentStage.minProgress) / (nextStage.minProgress - currentStage.minProgress)) * 100)
    : 100;

  // Check for stage evolution
  useEffect(() => {
    if (currentStageIndex > previousStage) {
      setIsEvolvingAnimation(true);
      setShowSparkle(true);
      
      // Trigger confetti for evolution
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#22c55e", "#10b981", "#34d399", "#a855f7", "#ec4899"],
      });

      setTimeout(() => {
        setIsEvolvingAnimation(false);
      }, 1000);
    }
    setPreviousStage(currentStageIndex);
  }, [currentStageIndex, previousStage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSparkle(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showSparkle) {
      const timer = setTimeout(() => setShowSparkle(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSparkle]);

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-semibold text-lg">Sua Plantinha</h3>
      </div>

      {/* Plant Display */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative flex flex-col items-center py-4 cursor-pointer group">
            {/* Glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-t ${currentStage.color} opacity-20 blur-2xl rounded-full transition-all duration-500`} />
            
            {/* Animated Plant */}
            <div className="relative z-10 w-32 h-40 transform group-hover:scale-105 transition-transform duration-300">
              <AnimatedPlant 
                stage={currentStageIndex} 
                isAnimating={isEvolvingAnimation}
              />
              
              {/* Sparkle animation */}
              {showSparkle && (
                <div className="absolute -top-2 -right-2 animate-bounce">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </div>
              )}
            </div>

            {/* Stage name */}
            <p className="mt-2 font-semibold text-lg">{currentStage.name}</p>
            <p className="text-sm text-muted-foreground">{currentStage.description}</p>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-background/95 backdrop-blur-sm border-white/10">
          <p className="font-medium">Sua planta cresceu {weeklyProgress}% esta semana! 🌱</p>
          <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
            <p>• Hábitos: {progressData.habitsCompleted}%</p>
            <p>• Metas: {progressData.goalsAchieved}%</p>
            <p>• Streak: {progressData.streakDays} dias</p>
            <p>• Tarefas: {progressData.tasksCompleted}%</p>
            <p>• Autocuidado: {progressData.selfCareScore}%</p>
          </div>
        </TooltipContent>
      </Tooltip>

      {/* Progress to next stage */}
      {nextStage && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>{currentStage.name}</span>
            <span>{nextStage.name}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${currentStage.color} transition-all duration-1000 ease-out rounded-full`}
              style={{ width: `${progressToNextStage}%` }}
            />
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2">
            {100 - progressToNextStage}% para a próxima evolução
          </p>
        </div>
      )}

      {/* Weekly Progress Bar */}
      <div className="mt-4 pt-4 border-t border-glass-border">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Progresso Semanal</span>
          <span className="font-medium text-foreground">{weeklyProgress}%</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out rounded-full"
            style={{ width: `${weeklyProgress}%` }}
          />
        </div>
      </div>

      {/* Stage indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {plantStages.map((stage, index) => (
          <Tooltip key={stage.name}>
            <TooltipTrigger asChild>
              <div 
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer hover:scale-125 ${
                  index <= currentStageIndex 
                    ? `bg-gradient-to-r ${stage.color}` 
                    : "bg-white/20"
                }`}
              />
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {stage.name} ({stage.minProgress}%+)
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default VirtualPlant;

import { 
  UserLevel, 
  LEVEL_THRESHOLDS, 
  LEVEL_EMOJIS, 
  LEVEL_COLORS 
} from "@/types/achievements";
import { cn } from "@/lib/utils";

interface XPProgressBarProps {
  currentPoints: number;
  level: UserLevel;
  levelProgress: number;
  compact?: boolean;
}

const XPProgressBar = ({ currentPoints, level, levelProgress, compact = false }: XPProgressBarProps) => {
  const levels = Object.entries(LEVEL_THRESHOLDS) as [UserLevel, number][];
  const currentLevelIndex = levels.findIndex(([l]) => l === level);
  const nextLevel = levels[currentLevelIndex + 1];
  const currentThreshold = LEVEL_THRESHOLDS[level];
  const nextThreshold = nextLevel ? nextLevel[1] : currentThreshold;
  const pointsToNext = nextThreshold - currentPoints;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-lg bg-gradient-to-br",
          LEVEL_COLORS[level]
        )}>
          {LEVEL_EMOJIS[level]}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium">{level}</span>
            <span className="text-muted-foreground">{currentPoints} XP</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r",
                LEVEL_COLORS[level]
              )}
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-4">
        {/* Level icon */}
        <div className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-gradient-to-br shadow-lg",
          LEVEL_COLORS[level]
        )}>
          {LEVEL_EMOJIS[level]}
        </div>

        <div className="flex-1">
          {/* Level name and points */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={cn(
                "px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r text-white",
                LEVEL_COLORS[level]
              )}>
                {level}
              </span>
            </div>
            <span className="text-lg font-bold text-gradient">{currentPoints} XP</span>
          </div>

          {/* Progress bar */}
          <div className="relative">
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r relative",
                  LEVEL_COLORS[level]
                )}
                style={{ width: `${levelProgress}%` }}
              >
                {/* Animated shine */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </div>
            </div>
            
            {/* Progress text */}
            {nextLevel && (
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{currentThreshold} XP</span>
                <span className="text-foreground font-medium">
                  {pointsToNext} XP para {nextLevel[0]} {LEVEL_EMOJIS[nextLevel[0] as UserLevel]}
                </span>
                <span>{nextThreshold} XP</span>
              </div>
            )}
            {!nextLevel && (
              <p className="text-xs text-center text-muted-foreground mt-1">
                Nível máximo alcançado! 🏆
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default XPProgressBar;

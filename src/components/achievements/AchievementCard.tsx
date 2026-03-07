import { Lock, Share2 } from "lucide-react";
import { Achievement, RARITY_COLORS, RARITY_LABELS } from "@/types/achievements";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface AchievementCardProps {
  achievement: Achievement & { isUnlocked: boolean };
  progress: number;
  onClick?: () => void;
  onShare?: (achievement: Achievement) => void;
}

const AchievementCard = ({ achievement, progress, onClick, onShare }: AchievementCardProps) => {
  const isUnlocked = achievement.isUnlocked;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare && isUnlocked) {
      onShare(achievement);
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative w-full p-4 rounded-2xl text-left transition-all duration-300",
        isUnlocked 
          ? "glass-card hover:scale-105 hover:shadow-xl cursor-pointer" 
          : "bg-muted/30 border border-muted/20 opacity-70"
      )}
    >
      {/* Rarity indicator */}
      <div 
        className={cn(
          "absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
          isUnlocked 
            ? `bg-gradient-to-r ${RARITY_COLORS[achievement.rarity]} text-white` 
            : "bg-muted text-muted-foreground"
        )}
      >
        {RARITY_LABELS[achievement.rarity]}
      </div>

      <div className="flex gap-4">
        {/* Icon */}
        <div 
          className={cn(
            "relative w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0",
            isUnlocked 
              ? `bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]}` 
              : "bg-muted"
          )}
        >
          {isUnlocked ? (
            <>
              {achievement.emoji}
              {/* Glow effect for unlocked */}
              <div 
                className={cn(
                  "absolute inset-0 rounded-xl bg-gradient-to-br blur-lg opacity-50 -z-10",
                  RARITY_COLORS[achievement.rarity]
                )}
              />
            </>
          ) : (
            <Lock className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-semibold text-sm truncate",
            isUnlocked ? "text-foreground" : "text-muted-foreground"
          )}>
            {achievement.name}
          </h4>
          
          <p className={cn(
            "text-xs mt-1 line-clamp-2",
            isUnlocked ? "text-muted-foreground" : "text-muted-foreground/60"
          )}>
            {achievement.description}
          </p>

          {/* Progress or points */}
          <div className="mt-2 flex items-center justify-between">
            {isUnlocked ? (
              <>
                <div className="flex items-center gap-1 text-xs text-accent font-medium">
                  <span>🏆</span>
                  <span>+{achievement.points} pts</span>
                </div>
                {onShare && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-primary"
                  >
                    <Share2 className="h-3 w-3" />
                    Compartilhar
                  </Button>
                )}
              </>
            ) : (
              <div className="space-y-1 w-full">
                <Progress value={progress} className="h-1.5" />
                <p className="text-[10px] text-muted-foreground">
                  {Math.round(progress)}% concluído
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;

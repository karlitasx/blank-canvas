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
        "relative rounded-lg border p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02]",
        isUnlocked
          ? "glass-card border-primary/30 shadow-lg shadow-primary/10"
          : "bg-muted/30 border-border/50 opacity-70"
      )}
    >
      {/* Rarity indicator */}
      <div
        className={cn(
          "absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-semibold",
          RARITY_COLORS[achievement.rarity]
        )}
      >
        {RARITY_LABELS[achievement.rarity]}
      </div>

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl",
            isUnlocked ? "bg-primary/10" : "bg-muted"
          )}
        >
          {isUnlocked ? (
            <>
              {achievement.emoji}
              {/* Glow effect for unlocked */}
              <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md animate-sparkle" />
            </>
          ) : (
            <Lock className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <h3 className={cn("text-sm font-semibold leading-tight", isUnlocked ? "text-foreground" : "text-muted-foreground")}>
            {achievement.name}
          </h3>

          <p className="text-xs text-muted-foreground line-clamp-2">
            {achievement.description}
          </p>

          {/* Progress or points */}
          <div className="flex items-center gap-2 pt-1">
            {isUnlocked ? (
              <>
                <span className="flex items-center gap-1 text-xs font-medium text-accent">
                  🏆
                  +{achievement.points} pts
                </span>
                {onShare && (
                  <Button variant="ghost" size="sm" className="ml-auto h-7 px-2 text-xs" onClick={handleShare}>
                    <Share2 className="h-3 w-3 mr-1" />
                    Compartilhar
                  </Button>
                )}
              </>
            ) : (
              <div className="w-full space-y-1">
                <Progress value={progress} className="h-1.5" />
                <span className="text-[10px] text-muted-foreground">
                  {Math.round(progress)}% concluído
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;

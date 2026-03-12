import { Lock, Share2, Star } from "lucide-react";
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

const RARITY_BORDER: Record<string, string> = {
  common: "border-muted-foreground/30",
  rare: "border-secondary/40",
  epic: "border-primary/50",
  legendary: "border-accent/60",
};

const RARITY_GLOW: Record<string, string> = {
  common: "",
  rare: "shadow-secondary/10",
  epic: "shadow-primary/15",
  legendary: "shadow-accent/25",
};

const RARITY_BG: Record<string, string> = {
  common: "from-muted/10 to-muted/5",
  rare: "from-secondary/10 to-secondary/5",
  epic: "from-primary/10 to-primary/5",
  legendary: "from-accent/12 to-accent/8",
};

const RARITY_TAG_BG: Record<string, string> = {
  common: "bg-muted/30 text-muted-foreground",
  rare: "bg-secondary/20 text-secondary",
  epic: "bg-primary/20 text-primary",
  legendary: "bg-gradient-to-r from-accent/30 to-accent/20 text-accent-foreground",
};

const AchievementCard = ({ achievement, progress, onClick, onShare }: AchievementCardProps) => {
  const isUnlocked = achievement.isUnlocked;
  const rarity = achievement.rarity;

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
        "group relative w-full rounded-2xl text-left transition-all duration-500 overflow-hidden",
        isUnlocked
          ? cn(
              "border cursor-pointer hover:scale-[1.02] hover:shadow-2xl",
              RARITY_BORDER[rarity],
              RARITY_GLOW[rarity],
              "bg-gradient-to-br",
              RARITY_BG[rarity],
              "backdrop-blur-sm"
            )
          : "bg-muted/20 border border-border/30 opacity-60 hover:opacity-75"
      )}
    >
      {/* Legendary shimmer effect */}
      {isUnlocked && rarity === "legendary" && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent animate-[shimmer_3s_ease-in-out_infinite] pointer-events-none" />
      )}

      <div className="relative p-4">
        {/* Rarity tag */}
        <div className="absolute top-3 right-3">
          <span
            className={cn(
              "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
              isUnlocked ? RARITY_TAG_BG[rarity] : "bg-muted/50 text-muted-foreground/60"
            )}
          >
            {RARITY_LABELS[rarity]}
          </span>
        </div>

        <div className="flex gap-4">
          {/* Icon container */}
          <div className="relative shrink-0">
            <div
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-500 group-hover:scale-110",
                isUnlocked
                  ? cn("bg-gradient-to-br shadow-lg", RARITY_COLORS[rarity])
                  : "bg-muted/50"
              )}
            >
              {isUnlocked ? (
                achievement.emoji
              ) : (
                <Lock className="w-6 h-6 text-muted-foreground/50" />
              )}
            </div>
            {/* Glow ring for epic & legendary */}
            {isUnlocked && (rarity === "epic" || rarity === "legendary") && (
              <div
                className={cn(
                  "absolute -inset-1 rounded-2xl bg-gradient-to-br opacity-30 blur-md -z-10",
                  RARITY_COLORS[rarity]
                )}
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pt-0.5">
            <h4
              className={cn(
                "font-bold text-sm leading-tight truncate pr-16",
                isUnlocked ? "text-foreground" : "text-muted-foreground/70"
              )}
            >
              {achievement.name}
            </h4>

            <p
              className={cn(
                "text-xs mt-1.5 line-clamp-2 leading-relaxed",
                isUnlocked ? "text-muted-foreground" : "text-muted-foreground/40"
              )}
            >
              {achievement.description}
            </p>

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between">
              {isUnlocked ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                    <span className="text-xs font-bold text-accent">
                      +{achievement.points} XP
                    </span>
                  </div>
                  {onShare && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleShare}
                      className="h-7 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-primary rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Share2 className="h-3 w-3" />
                      Compartilhar
                    </Button>
                  )}
                </>
              ) : (
                <div className="space-y-1.5 w-full">
                  <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary/40 transition-all duration-700"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 font-medium">
                    {Math.round(progress)}% concluído
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;

import { Achievement, RARITY_COLORS } from "@/types/achievements";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BadgeDisplayProps {
  achievements: Achievement[];
  maxDisplay?: number;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export const BadgeDisplay = ({
  achievements,
  maxDisplay = 5,
  size = "md",
  showTooltip = true,
}: BadgeDisplayProps) => {
  const displayAchievements = achievements.slice(0, maxDisplay);
  const remaining = achievements.length - maxDisplay;

  const sizeClasses = {
    sm: "w-8 h-8 text-base",
    md: "w-10 h-10 text-lg",
    lg: "w-12 h-12 text-xl",
  };

  return (
    <div className="flex items-center -space-x-2">
      {displayAchievements.map((achievement) => {
        const badge = (
          <div
            key={achievement.id}
            className={cn(
              "rounded-full flex items-center justify-center ring-2 ring-background bg-gradient-to-br",
              sizeClasses[size],
              RARITY_COLORS[achievement.rarity]
            )}
          >
            {achievement.emoji}
          </div>
        );

        if (showTooltip) {
          return (
            <Tooltip key={achievement.id}>
              <TooltipTrigger asChild>{badge}</TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold">{achievement.name}</p>
                <p className="text-xs text-muted-foreground">
                  {achievement.description}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        }

        return badge;
      })}

      {remaining > 0 && (
        <div
          className={cn(
            "rounded-full flex items-center justify-center ring-2 ring-background bg-muted text-muted-foreground font-medium",
            sizeClasses[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};

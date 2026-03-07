import { useNavigate } from "react-router-dom";
import { Trophy, ChevronRight, Lock } from "lucide-react";
import { useAchievementsContext } from "@/contexts/AchievementsContext";
import { ALL_ACHIEVEMENTS, RARITY_COLORS } from "@/types/achievements";
import { cn } from "@/lib/utils";

const RecentAchievements = () => {
  const navigate = useNavigate();
  const { state, getUnlockedCount, getTotalCount } = useAchievementsContext();

  // Get recent unlocked achievements (last 3)
  const recentAchievements = ALL_ACHIEVEMENTS
    .filter((a) => state.unlockedAchievements.includes(a.id))
    .slice(-3)
    .reverse();

  const unlockedCount = getUnlockedCount();
  const totalCount = getTotalCount();
  const progressPercent = (unlockedCount / totalCount) * 100;

  // Get next achievements to unlock (first 3 locked)
  const nextToUnlock = ALL_ACHIEVEMENTS
    .filter((a) => !state.unlockedAchievements.includes(a.id))
    .slice(0, 3);

  const displayAchievements =
    recentAchievements.length > 0 ? recentAchievements : nextToUnlock;
  const showingRecent = recentAchievements.length > 0;

  return (
    <div className="glass-card p-5 hover:scale-[1.02] transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {showingRecent ? "Conquistas Recentes" : "Próximas Conquistas"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {unlockedCount}/{totalCount} desbloqueadas
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/achievements")}
          className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors group"
        >
          Ver todas
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-3 gap-3">
        {displayAchievements.map((achievement, index) => {
          const isUnlocked = state.unlockedAchievements.includes(achievement.id);

          return (
            <div
              key={achievement.id}
              className={cn(
                "relative group cursor-pointer",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate("/achievements")}
            >
              <div
                className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all duration-300",
                  isUnlocked
                    ? `bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]} shadow-lg group-hover:scale-110 group-hover:shadow-xl`
                    : "bg-muted/30 group-hover:bg-muted/50"
                )}
              >
                {isUnlocked ? (
                  <>
                    <span className="text-2xl mb-1">{achievement.emoji}</span>
                    <span className="text-[10px] text-white/90 text-center line-clamp-1 font-medium">
                      {achievement.name}
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 text-muted-foreground mb-1" />
                    <span className="text-[10px] text-muted-foreground text-center line-clamp-1">
                      {achievement.name}
                    </span>
                  </>
                )}
              </div>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                <div className="glass-card px-3 py-2 text-xs whitespace-nowrap shadow-lg">
                  <p className="font-medium">{achievement.name}</p>
                  <p className="text-muted-foreground text-[10px]">
                    {achievement.description}
                  </p>
                  {isUnlocked && (
                    <p className="text-primary text-[10px] mt-1">
                      +{achievement.points} pts
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivational Message */}
      {!showingRecent && (
        <p className="text-xs text-center text-muted-foreground mt-4">
          Complete hábitos para desbloquear conquistas! 🌟
        </p>
      )}
    </div>
  );
};

export default RecentAchievements;

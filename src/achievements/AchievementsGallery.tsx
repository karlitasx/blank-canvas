import { useState } from "react";
import { Trophy, Filter, Sparkles } from "lucide-react";
import { 
  AchievementCategory, 
  CATEGORY_LABELS, 
  CATEGORY_EMOJIS,
  Achievement
} from "@/types/achievements";
import { useAchievementsContext } from "@/contexts/AchievementsContext";
import { useAchievementSharing } from "@/hooks/useAchievementSharing";
import AchievementCard from "./AchievementCard";
import { ShareAchievementModal } from "./ShareAchievementModal";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type FilterType = 'all' | 'unlocked' | 'locked' | AchievementCategory;

const filters: { id: FilterType; name: string; emoji?: string }[] = [
  { id: 'all', name: 'Todas' },
  { id: 'unlocked', name: 'Desbloqueadas', emoji: '✨' },
  { id: 'locked', name: 'Bloqueadas', emoji: '🔒' },
];

const categoryFilters = Object.entries(CATEGORY_LABELS).map(([id, name]) => ({
  id: id as AchievementCategory,
  name,
  emoji: CATEGORY_EMOJIS[id as AchievementCategory],
}));

const AchievementsGallery = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const {
    state,
    getAllAchievements,
    getUnlockedCount,
    getTotalCount,
    getAchievementProgress,
    getMotivationalHints,
  } = useAchievementsContext();

  const { shareAchievement } = useAchievementSharing();

  const allAchievements = getAllAchievements();
  const unlockedCount = getUnlockedCount();
  const totalCount = getTotalCount();
  const overallProgress = (unlockedCount / totalCount) * 100;
  const hints = getMotivationalHints();

  // Filter achievements
  const filteredAchievements = allAchievements.filter(achievement => {
    if (filter === 'unlocked') return achievement.isUnlocked;
    if (filter === 'locked') return !achievement.isUnlocked;
    if (['habits', 'streaks', 'finance', 'selfcare', 'community', 'special'].includes(filter)) {
      return achievement.category === filter;
    }
    return true;
  });

  // Sort: unlocked first, then by rarity
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    if (a.isUnlocked && !b.isUnlocked) return -1;
    if (!a.isUnlocked && b.isUnlocked) return 1;
    
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });

  const handleShare = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowShareModal(true);
  };

  const handleShareSubmit = async (achievementId: string, message?: string) => {
    const result = await shareAchievement(achievementId, message);
    return !!result;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl logo-gradient">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Conquistas</h2>
              <p className="text-sm text-muted-foreground">
                {unlockedCount} de {totalCount} desbloqueadas
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="text-2xl font-bold text-accent">{state.totalPoints}</span>
            </div>
            <p className="text-xs text-muted-foreground">pontos totais</p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso geral</span>
            <span className="font-medium">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </div>

        {/* Level */}
        <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground">Nível atual</span>
              <p className="font-bold text-lg">{state.level}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Próximo nível</span>
              <Progress value={state.levelProgress} className="w-24 h-2 mt-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Hints */}
      {hints.length > 0 && (
        <div className="glass-card p-4 space-y-2">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <span>💡</span> Dicas motivacionais
          </h3>
          {hints.map((hint, index) => (
            <p key={index} className="text-sm text-muted-foreground">
              {hint}
            </p>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-1",
              filter === f.id
                ? "btn-gradient"
                : "bg-glass hover:bg-glass-hover text-muted-foreground hover:scale-105"
            )}
          >
            {f.emoji && <span>{f.emoji}</span>}
            {f.name}
          </button>
        ))}

        {/* Category Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowCategoryFilter(!showCategoryFilter)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2",
              categoryFilters.some(c => c.id === filter)
                ? "btn-gradient"
                : "bg-glass hover:bg-glass-hover text-muted-foreground hover:scale-105"
            )}
          >
            <Filter className="w-4 h-4" />
            Categoria
          </button>

          {showCategoryFilter && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowCategoryFilter(false)}
              />
              <div className="absolute left-0 top-full mt-2 w-48 glass-card py-2 z-20 animate-scale-in">
                {categoryFilters.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setFilter(cat.id);
                      setShowCategoryFilter(false);
                    }}
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-glass-hover transition-all duration-300",
                      filter === cat.id && "text-primary"
                    )}
                  >
                    <span>{cat.emoji}</span>
                    {cat.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedAchievements.map((achievement, index) => (
          <div
            key={achievement.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <AchievementCard
              achievement={achievement}
              progress={getAchievementProgress(achievement.id)}
              onShare={achievement.isUnlocked ? handleShare : undefined}
            />
          </div>
        ))}
      </div>

      {/* Empty state */}
      {sortedAchievements.length === 0 && (
        <div className="glass-card p-8 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">Nenhuma conquista encontrada</h3>
          <p className="text-sm text-muted-foreground">
            Tente mudar os filtros para ver outras conquistas
          </p>
        </div>
      )}

      {/* Share Modal */}
      <ShareAchievementModal
        achievement={selectedAchievement}
        open={showShareModal}
        onOpenChange={setShowShareModal}
        onShare={handleShareSubmit}
      />
    </div>
  );
};

export default AchievementsGallery;
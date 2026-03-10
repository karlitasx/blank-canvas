import { useState, useEffect, useMemo } from "react";
import { Trophy, Filter, Sparkles, Clock, Crown, Flame, Star } from "lucide-react";
import { 
  AchievementCategory, 
  CATEGORY_LABELS, 
  CATEGORY_EMOJIS,
  Achievement,
  LEVEL_EMOJIS,
} from "@/types/achievements";
import { useAchievementsContext } from "@/contexts/AchievementsContext";
import { useAchievementSharing } from "@/hooks/useAchievementSharing";
import { supabase } from "@/integrations/supabase/client";
import AchievementCard from "./AchievementCard";
import { ShareAchievementModal } from "./ShareAchievementModal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type FilterType = 'all' | 'unlocked' | 'locked' | 'event' | AchievementCategory;

const filters: { id: FilterType; name: string; emoji?: string }[] = [
  { id: 'all', name: 'Todas' },
  { id: 'unlocked', name: 'Desbloqueadas', emoji: '✨' },
  { id: 'locked', name: 'Bloqueadas', emoji: '🔒' },
  { id: 'event', name: 'Temporárias', emoji: '⏳' },
];

const categoryFilters = Object.entries(CATEGORY_LABELS).map(([id, name]) => ({
  id: id as AchievementCategory,
  name,
  emoji: CATEGORY_EMOJIS[id as AchievementCategory],
}));

interface AdminAchievement {
  id: string;
  achievement_key: string;
  name: string;
  description: string;
  emoji: string;
  xp_reward: number;
  unlock_condition: string;
  is_active: boolean;
  is_permanent: boolean;
  expires_at: string | null;
}

const AchievementsGallery = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [adminAchievements, setAdminAchievements] = useState<AdminAchievement[]>([]);
  
  const {
    state,
    getAllAchievements,
    getUnlockedCount,
    getTotalCount,
    getAchievementProgress,
    getMotivationalHints,
  } = useAchievementsContext();

  const { shareAchievement } = useAchievementSharing();

  useEffect(() => {
    const fetchAdminAchievements = async () => {
      const { data } = await supabase
        .from("admin_achievements")
        .select("*")
        .eq("is_active", true);
      setAdminAchievements(data || []);
    };
    fetchAdminAchievements();
  }, []);

  const adminAsAchievements = useMemo(() => {
    const now = new Date();
    return adminAchievements
      .filter(a => !a.expires_at || new Date(a.expires_at) > now)
      .map(a => ({
        id: `admin_${a.achievement_key}`,
        name: a.name,
        description: a.description,
        emoji: a.emoji,
        category: 'special' as AchievementCategory,
        rarity: (a.is_permanent ? 'epic' : 'legendary') as any,
        points: a.xp_reward,
        requirement: { type: 'first_action' as const, value: 1 },
        isUnlocked: state.unlockedAchievements.includes(`admin_${a.achievement_key}`),
        _isAdminCreated: true,
        _isTemporary: !a.is_permanent,
        _expiresAt: a.expires_at,
      }));
  }, [adminAchievements, state.unlockedAchievements]);

  const allAchievements = getAllAchievements();
  const combinedAchievements = [...allAchievements, ...adminAsAchievements];
  const unlockedCount = getUnlockedCount();
  const totalCount = getTotalCount() + adminAsAchievements.length;
  const overallProgress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;
  const hints = getMotivationalHints();

  const filteredAchievements = combinedAchievements.filter(achievement => {
    if (filter === 'unlocked') return achievement.isUnlocked;
    if (filter === 'locked') return !achievement.isUnlocked;
    if (filter === 'event') return (achievement as any)._isTemporary === true;
    if (['habits', 'streaks', 'finance', 'selfcare', 'community', 'routine', 'special'].includes(filter)) {
      return achievement.category === filter;
    }
    return true;
  });

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
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border/40">
        {/* Background gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-card to-accent/5" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative p-6 sm:p-8">
          {/* Top row: Trophy + XP */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl shadow-primary/20">
                  <Trophy className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary to-primary/40 blur-lg opacity-30 -z-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Conquistas</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {unlockedCount} de {totalCount} desbloqueadas
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <Sparkles className="w-5 h-5 text-accent" />
                <span className="text-3xl font-black tabular-nums text-accent">
                  {state.totalPoints}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">pontos totais</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground font-medium">Progresso geral</span>
              <span className="font-bold text-foreground">{Math.round(overallProgress)}%</span>
            </div>
            <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary via-primary/80 to-accent transition-all duration-1000 ease-out relative"
                style={{ width: `${overallProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
              </div>
            </div>
          </div>

          {/* Level card */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-muted/60 to-muted/30 border border-border/30">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl">
              {LEVEL_EMOJIS[state.level]}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground font-medium">Nível atual</span>
                  <p className="font-bold text-lg text-foreground leading-tight">{state.level}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground font-medium">Próximo nível</span>
                  <div className="w-28 h-2.5 bg-muted/50 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
                      style={{ width: `${state.levelProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Hints */}
      {hints.length > 0 && (
        <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 space-y-2">
          <h3 className="text-sm font-bold flex items-center gap-2 text-accent">
            <Flame className="w-4 h-4" />
            Dicas para avançar
          </h3>
          {hints.map((hint, index) => (
            <p key={index} className="text-sm text-muted-foreground leading-relaxed pl-6">
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
              "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-1.5",
              filter === f.id
                ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-muted/40 border border-border/30 text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            {f.emoji && <span className="text-sm">{f.emoji}</span>}
            {f.name}
          </button>
        ))}

        {/* Category Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowCategoryFilter(!showCategoryFilter)}
            className={cn(
              "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2",
              categoryFilters.some(c => c.id === filter)
                ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-muted/40 border border-border/30 text-muted-foreground hover:text-foreground hover:bg-muted/60"
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
              <div className="absolute left-0 top-full mt-2 w-52 rounded-2xl border border-border/40 bg-card/95 backdrop-blur-xl py-2 z-20 shadow-2xl animate-scale-in">
                {categoryFilters.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setFilter(cat.id);
                      setShowCategoryFilter(false);
                    }}
                    className={cn(
                      "w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-muted/40 transition-all duration-200",
                      filter === cat.id && "text-primary font-semibold bg-primary/5"
                    )}
                  >
                    <span className="text-base">{cat.emoji}</span>
                    {cat.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="max-h-[650px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sortedAchievements.map((achievement, index) => {
            const isTemp = (achievement as any)._isTemporary;
            const expiresAt = (achievement as any)._expiresAt;
            return (
              <div
                key={achievement.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {isTemp && (
                  <div className="flex items-center gap-1.5 mb-1.5 ml-1">
                    <Badge variant="outline" className="text-[10px] gap-1 border-accent/40 text-accent font-semibold">
                      <Clock className="h-3 w-3" />
                      Temporária
                    </Badge>
                    {expiresAt && (
                      <span className="text-[10px] text-muted-foreground">
                        até {new Date(expiresAt).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                )}
                <AchievementCard
                  achievement={achievement}
                  progress={getAchievementProgress(achievement.id)}
                  onShare={achievement.isUnlocked ? handleShare : undefined}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {sortedAchievements.length === 0 && (
        <div className="rounded-2xl border border-border/30 p-10 text-center bg-muted/10">
          <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="font-bold text-foreground mb-1">Nenhuma conquista encontrada</h3>
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

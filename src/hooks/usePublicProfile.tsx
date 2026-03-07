import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Achievement, ALL_ACHIEVEMENTS, UserLevel, LEVEL_THRESHOLDS } from "@/types/achievements";

export interface PublicProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  show_achievements: boolean;
  created_at: string;
  followers_count: number;
  following_count: number;
}

export interface PublicUserStats {
  total_points: number;
  level: UserLevel;
  current_streak: number;
  longest_streak: number;
  habits_completed: number;
}

export interface PublicUserData {
  profile: PublicProfile;
  stats: PublicUserStats | null;
  achievements: Achievement[];
  achievementCount: number;
}

const calculateLevelProgress = (points: number, level: UserLevel): number => {
  const levels = Object.entries(LEVEL_THRESHOLDS) as [UserLevel, number][];
  const sortedLevels = [...levels].sort((a, b) => a[1] - b[1]);
  
  const currentLevelIndex = sortedLevels.findIndex(([l]) => l === level);
  const nextLevelIndex = currentLevelIndex + 1;
  
  if (nextLevelIndex >= sortedLevels.length) return 100;
  
  const currentThreshold = sortedLevels[currentLevelIndex][1];
  const nextThreshold = sortedLevels[nextLevelIndex][1];
  
  const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(Math.max(progress, 0), 100);
};

export const usePublicProfile = (userId: string | undefined) => {
  const [data, setData] = useState<PublicUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setError("ID de usuário não fornecido");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, show_achievements, created_at, followers_count, following_count")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileError) throw profileError;
      
      if (!profileData) {
        setError("Usuário não encontrado");
        setLoading(false);
        return;
      }

      // Fetch stats
      const { data: statsData } = await supabase
        .from("user_stats")
        .select("total_points, level, current_streak, longest_streak, habits_completed")
        .eq("user_id", userId)
        .maybeSingle();

      // Fetch achievements if user allows
      let achievements: Achievement[] = [];
      let achievementCount = 0;

      if (profileData.show_achievements) {
        const { data: userAchievements } = await supabase
          .from("user_achievements")
          .select("achievement_id, unlocked_at")
          .eq("user_id", userId);

        if (userAchievements) {
          achievementCount = userAchievements.length;
          const unlockedIds = new Set(userAchievements.map(a => a.achievement_id));
          achievements = ALL_ACHIEVEMENTS
            .filter(a => unlockedIds.has(a.id))
            .map(achievement => {
              const unlockData = userAchievements.find(d => d.achievement_id === achievement.id);
              return {
                ...achievement,
                unlockedAt: unlockData?.unlocked_at,
              };
            })
            .sort((a, b) => {
              const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
              return rarityOrder[a.rarity] - rarityOrder[b.rarity];
            });
        }
      }

      setData({
        profile: profileData as PublicProfile,
        stats: statsData as PublicUserStats | null,
        achievements,
        achievementCount,
      });
    } catch (err) {
      console.error("Error fetching public profile:", err);
      setError("Erro ao carregar perfil");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPublicProfile();
  }, [fetchPublicProfile]);

  const getLevelProgress = () => {
    if (!data?.stats) return 0;
    return calculateLevelProgress(data.stats.total_points, data.stats.level as UserLevel);
  };

  return {
    data,
    loading,
    error,
    refetch: fetchPublicProfile,
    getLevelProgress,
  };
};

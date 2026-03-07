import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AchievementShare, PublicUserAchievement } from "@/types/achievement-sharing";
import { ALL_ACHIEVEMENTS, Achievement } from "@/types/achievements";
import { toast } from "sonner";

export const useAchievementSharing = () => {
  const { user } = useAuth();
  const [shares, setShares] = useState<AchievementShare[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShares = useCallback(async () => {
    try {
      const { data: sharesData, error } = await supabase
        .from("achievement_shares")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch profiles for authors
      const userIds = [...new Set(sharesData?.map(s => s.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      const enrichedShares = (sharesData || []).map(share => {
        const profile = profileMap.get(share.user_id);
        return {
          ...share,
          author_name: profile?.display_name || "Usuário",
          author_avatar: profile?.avatar_url,
        } as AchievementShare;
      });

      setShares(enrichedShares);
    } catch (error) {
      console.error("Error fetching achievement shares:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShares();
  }, [fetchShares]);

  const shareAchievement = async (achievementId: string, message?: string) => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return null;
    }

    const achievement = ALL_ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) {
      toast.error("Conquista não encontrada");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("achievement_shares")
        .insert({
          user_id: user.id,
          achievement_id: achievementId,
          message: message?.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Conquista compartilhada!");
      await fetchShares();
      return data as AchievementShare;
    } catch (error) {
      console.error("Error sharing achievement:", error);
      toast.error("Erro ao compartilhar conquista");
      return null;
    }
  };

  const deleteShare = async (shareId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("achievement_shares")
        .delete()
        .eq("id", shareId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Compartilhamento removido");
      await fetchShares();
      return true;
    } catch (error) {
      console.error("Error deleting share:", error);
      toast.error("Erro ao remover compartilhamento");
      return false;
    }
  };

  const getUserAchievements = async (userId: string): Promise<Achievement[]> => {
    try {
      const { data, error } = await supabase
        .from("user_achievements")
        .select("achievement_id, unlocked_at")
        .eq("user_id", userId);

      if (error) throw error;

      const unlockedIds = new Set(data?.map(a => a.achievement_id) || []);
      return ALL_ACHIEVEMENTS.filter(a => unlockedIds.has(a.id)).map(achievement => {
        const unlockData = data?.find(d => d.achievement_id === achievement.id);
        return {
          ...achievement,
          unlockedAt: unlockData?.unlocked_at,
        };
      });
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      return [];
    }
  };

  const getAchievementById = (achievementId: string): Achievement | undefined => {
    return ALL_ACHIEVEMENTS.find(a => a.id === achievementId);
  };

  return {
    shares,
    loading,
    shareAchievement,
    deleteShare,
    getUserAchievements,
    getAchievementById,
    refetch: fetchShares,
  };
};

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { UserLevel, LEVEL_THRESHOLDS } from "@/types/achievements";

export interface RankingUser {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  totalPoints: number;
  level: UserLevel;
  currentStreak: number;
  longestStreak: number;
  habitsCompleted: number;
  position: number;
  isCurrentUser: boolean;
}

export type RankingPeriod = "all" | "monthly" | "weekly";

const ITEMS_PER_PAGE = 10;

const getUserLevel = (points: number): UserLevel => {
  const levels = Object.entries(LEVEL_THRESHOLDS) as [UserLevel, number][];
  const sortedLevels = [...levels].sort((a, b) => b[1] - a[1]);
  
  for (const [level, threshold] of sortedLevels) {
    if (points >= threshold) {
      return level;
    }
  }
  return 'Novata';
};

export const useGlobalRanking = () => {
  const { user } = useAuth();
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<RankingPeriod>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [userPosition, setUserPosition] = useState<number | null>(null);
  const [currentUserData, setCurrentUserData] = useState<RankingUser | null>(null);

  const fetchRanking = useCallback(async () => {
    setLoading(true);
    try {
      // Get total count
      const { count } = await supabase
        .from("user_stats")
        .select("*", { count: "exact", head: true });
      
      setTotalUsers(count || 0);

      // Fetch user_stats with profiles
      const { data: statsData, error: statsError } = await supabase
        .from("user_stats")
        .select(`
          user_id,
          total_points,
          level,
          current_streak,
          longest_streak,
          habits_completed
        `)
        .order("total_points", { ascending: false });

      if (statsError) throw statsError;

      // Fetch all profiles
      const userIds = statsData?.map(s => s.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      // Create profile map
      const profileMap = new Map(
        profilesData?.map(p => [p.user_id, p]) || []
      );

      // Combine data
      const fullRanking: RankingUser[] = (statsData || []).map((stat, index) => {
        const profile = profileMap.get(stat.user_id);
        return {
          id: stat.user_id,
          userId: stat.user_id,
          displayName: profile?.display_name || "Usuário",
          avatarUrl: profile?.avatar_url || null,
          totalPoints: stat.total_points,
          level: getUserLevel(stat.total_points),
          currentStreak: stat.current_streak,
          longestStreak: stat.longest_streak,
          habitsCompleted: stat.habits_completed,
          position: index + 1,
          isCurrentUser: stat.user_id === user?.id,
        };
      });

      // Find current user position
      const currentUserIndex = fullRanking.findIndex(u => u.isCurrentUser);
      if (currentUserIndex >= 0) {
        setUserPosition(currentUserIndex + 1);
        setCurrentUserData(fullRanking[currentUserIndex]);
      }

      // Apply period filter (simulated - in real app would use date filtering)
      let filteredRanking = fullRanking;
      if (period === "weekly") {
        filteredRanking = fullRanking.map(u => ({
          ...u,
          totalPoints: Math.round(u.totalPoints * 0.15),
        })).sort((a, b) => b.totalPoints - a.totalPoints)
          .map((u, i) => ({ ...u, position: i + 1 }));
      } else if (period === "monthly") {
        filteredRanking = fullRanking.map(u => ({
          ...u,
          totalPoints: Math.round(u.totalPoints * 0.4),
        })).sort((a, b) => b.totalPoints - a.totalPoints)
          .map((u, i) => ({ ...u, position: i + 1 }));
      }

      // Paginate
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const paginatedRanking = filteredRanking.slice(startIndex, startIndex + ITEMS_PER_PAGE);

      setRanking(paginatedRanking);
    } catch (error) {
      console.error("Error fetching ranking:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, period, currentPage]);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getTopThree = useCallback(async (): Promise<RankingUser[]> => {
    try {
      const { data: statsData, error: statsError } = await supabase
        .from("user_stats")
        .select("user_id, total_points, current_streak, longest_streak, habits_completed")
        .order("total_points", { ascending: false })
        .limit(3);

      if (statsError) throw statsError;

      const userIds = statsData?.map(s => s.user_id) || [];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

      return (statsData || []).map((stat, index) => {
        const profile = profileMap.get(stat.user_id);
        return {
          id: stat.user_id,
          userId: stat.user_id,
          displayName: profile?.display_name || "Usuário",
          avatarUrl: profile?.avatar_url || null,
          totalPoints: stat.total_points,
          level: getUserLevel(stat.total_points),
          currentStreak: stat.current_streak,
          longestStreak: stat.longest_streak,
          habitsCompleted: stat.habits_completed,
          position: index + 1,
          isCurrentUser: stat.user_id === user?.id,
        };
      });
    } catch (error) {
      console.error("Error fetching top 3:", error);
      return [];
    }
  }, [user?.id]);

  return {
    ranking,
    loading,
    period,
    setPeriod,
    currentPage,
    totalPages,
    totalUsers,
    goToPage,
    userPosition,
    currentUserData,
    refresh: fetchRanking,
    getTopThree,
  };
};

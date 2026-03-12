import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Achievement, ALL_ACHIEVEMENTS, UserLevel, LEVEL_THRESHOLDS } from "@/types/achievements";

export interface PublicProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  interests: string[] | null;
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

export interface PublicPost {
  id: string;
  content: string;
  emoji: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

export interface PublicFollowUser {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export interface PublicUserData {
  profile: PublicProfile;
  stats: PublicUserStats | null;
  achievements: Achievement[];
  achievementCount: number;
  posts: PublicPost[];
  followers: PublicFollowUser[];
  following: PublicFollowUser[];
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
        .select("user_id, display_name, avatar_url, bio, interests, show_achievements, created_at, followers_count, following_count")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) {
        setError("Usuário não encontrado");
        setLoading(false);
        return;
      }

      // Fetch stats, posts, followers, following in parallel
      const [statsRes, postsRes, followersRes, followingRes, achievementsRes] = await Promise.all([
        supabase
          .from("user_stats")
          .select("total_points, level, current_streak, longest_streak, habits_completed")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("posts")
          .select("id, content, emoji, created_at, likes_count, comments_count")
          .eq("user_id", userId)
          .eq("is_hidden", false)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("follows")
          .select("follower_id")
          .eq("following_id", userId),
        supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", userId),
        profileData.show_achievements
          ? supabase
              .from("user_achievements")
              .select("achievement_id, unlocked_at")
              .eq("user_id", userId)
          : Promise.resolve({ data: null }),
      ]);

      // Process achievements
      let achievements: Achievement[] = [];
      let achievementCount = 0;
      if (achievementsRes.data) {
        achievementCount = achievementsRes.data.length;
        const unlockedIds = new Set(achievementsRes.data.map((a: any) => a.achievement_id));
        achievements = ALL_ACHIEVEMENTS
          .filter(a => unlockedIds.has(a.id))
          .sort((a, b) => {
            const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
            return rarityOrder[a.rarity] - rarityOrder[b.rarity];
          });
      }

      // Fetch follower/following profiles
      const followerIds = followersRes.data?.map((f: any) => f.follower_id) || [];
      const followingIds = followingRes.data?.map((f: any) => f.following_id) || [];
      const allUserIds = [...new Set([...followerIds, ...followingIds])];

      let profilesMap = new Map<string, PublicFollowUser>();
      if (allUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", allUserIds);
        profiles?.forEach((p: any) => profilesMap.set(p.user_id, p));
      }

      const followers: PublicFollowUser[] = followerIds.map((id: string) =>
        profilesMap.get(id) || { user_id: id, display_name: null, avatar_url: null }
      );
      const following: PublicFollowUser[] = followingIds.map((id: string) =>
        profilesMap.get(id) || { user_id: id, display_name: null, avatar_url: null }
      );

      setData({
        profile: profileData as PublicProfile,
        stats: statsRes.data as PublicUserStats | null,
        achievements,
        achievementCount,
        posts: (postsRes.data as PublicPost[]) || [],
        followers,
        following,
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

  return { data, loading, error, refetch: fetchPublicProfile, getLevelProgress };
};

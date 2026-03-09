import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  activeChallenges: number;
}

interface AdminPost {
  id: string;
  content: string;
  emoji: string | null;
  created_at: string;
  is_hidden: boolean;
  user_id: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface AdminUser {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_suspended: boolean;
  created_at: string;
  total_points?: number;
}

interface AdminChallenge {
  id: string;
  title: string;
  description: string | null;
  emoji: string;
  start_date: string;
  end_date: string;
  target_value: number;
  is_public: boolean;
  participants_count?: number;
}

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

export const useAdminData = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalPosts: 0,
    activeChallenges: 0,
  });
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [challenges, setChallenges] = useState<AdminChallenge[]>([]);
  const [achievements, setAchievements] = useState<AdminAchievement[]>([]);
  const [publicEvents, setPublicEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPublicEvents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, description, event_date, event_time, is_public")
        .eq("is_public", true)
        .order("event_date", { ascending: true });
      if (error) throw error;
      setPublicEvents(data || []);
    } catch (error) {
      console.error("Error fetching public events:", error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const [usersRes, postsRes, challengesRes] = await Promise.all([
        supabase.from("profiles").select("id, created_at", { count: "exact" }),
        supabase.from("posts").select("id", { count: "exact" }).eq("is_hidden", false),
        supabase.from("challenges").select("id", { count: "exact" })
          .gte("end_date", new Date().toISOString().split("T")[0]),
      ]);

      // Calculate active users (users with activity in last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: activeCount } = await supabase
        .from("user_stats")
        .select("id", { count: "exact" })
        .gte("last_activity_date", sevenDaysAgo.toISOString().split("T")[0]);

      setStats({
        totalUsers: usersRes.count || 0,
        activeUsers: activeCount || 0,
        totalPosts: postsRes.count || 0,
        activeChallenges: challengesRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("id, content, emoji, created_at, is_hidden, user_id")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const postsData = data as unknown as Array<{
        id: string;
        content: string;
        emoji: string | null;
        created_at: string;
        is_hidden: boolean;
        user_id: string;
      }>;

      // Fetch profiles separately
      const userIds = [...new Set(postsData.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = (profiles || []).reduce((acc, p) => {
        acc[p.user_id] = p;
        return acc;
      }, {} as Record<string, any>);

      setPosts(postsData.map(post => ({
        ...post,
        profile: profileMap[post.user_id],
      })));
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, user_id, display_name, avatar_url, is_suspended, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const profilesData = profiles as unknown as Array<{
        id: string;
        user_id: string;
        display_name: string | null;
        avatar_url: string | null;
        is_suspended: boolean;
        created_at: string;
      }>;

      // Fetch stats for each user
      const userIds = profilesData.map(p => p.user_id);
      const { data: statsData } = await supabase
        .from("user_stats")
        .select("user_id, total_points")
        .in("user_id", userIds);

      const statsMap = (statsData || []).reduce((acc, s) => {
        acc[s.user_id] = s.total_points;
        return acc;
      }, {} as Record<string, number>);

      setUsers(profilesData.map(p => ({
        ...p,
        total_points: statsMap[p.user_id] || 0,
      })));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  const fetchChallenges = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get participant counts
      const challengeIds = (data || []).map(c => c.id);
      const { data: participants } = await supabase
        .from("challenge_participants")
        .select("challenge_id")
        .in("challenge_id", challengeIds);

      const countMap = (participants || []).reduce((acc, p) => {
        acc[p.challenge_id] = (acc[p.challenge_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setChallenges((data || []).map(c => ({
        ...c,
        participants_count: countMap[c.id] || 0,
      })));
    } catch (error) {
      console.error("Error fetching challenges:", error);
    }
  }, []);

  const fetchAchievements = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("admin_achievements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchPosts(),
      fetchUsers(),
      fetchChallenges(),
      fetchAchievements(),
      fetchPublicEvents(),
    ]);
    setLoading(false);
  }, [fetchStats, fetchPosts, fetchUsers, fetchChallenges, fetchAchievements, fetchPublicEvents]);

  useEffect(() => {
    if (user) {
      fetchAll();
    }
  }, [user, fetchAll]);

  // Post moderation
  const hidePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("posts")
        .update({ is_hidden: true })
        .eq("id", postId);

      if (error) throw error;
      toast.success("Post ocultado");
      fetchPosts();
    } catch (error) {
      console.error("Error hiding post:", error);
      toast.error("Erro ao ocultar post");
    }
  };

  const unhidePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("posts")
        .update({ is_hidden: false })
        .eq("id", postId);

      if (error) throw error;
      toast.success("Post restaurado");
      fetchPosts();
    } catch (error) {
      console.error("Error unhiding post:", error);
      toast.error("Erro ao restaurar post");
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;
      toast.success("Post excluído");
      fetchPosts();
      fetchStats();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Erro ao excluir post");
    }
  };

  // User management
  const suspendUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_suspended: true })
        .eq("user_id", userId);

      if (error) throw error;
      toast.success("Usuário suspenso");
      fetchUsers();
    } catch (error) {
      console.error("Error suspending user:", error);
      toast.error("Erro ao suspender usuário");
    }
  };

  const reactivateUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_suspended: false })
        .eq("user_id", userId);

      if (error) throw error;
      toast.success("Usuário reativado");
      fetchUsers();
    } catch (error) {
      console.error("Error reactivating user:", error);
      toast.error("Erro ao reativar usuário");
    }
  };

  // Challenge management
  const createChallenge = async (challenge: {
    title: string;
    description?: string;
    emoji: string;
    start_date: string;
    end_date: string;
    target_value: number;
    is_public: boolean;
  }) => {
    if (!user) return false;
    try {
      const { error } = await supabase.from("challenges").insert({
        ...challenge,
        created_by: user.id,
        challenge_type: "habits",
      });
      if (error) throw error;
      toast.success("Desafio criado");
      fetchChallenges();
      fetchStats();
      return true;
    } catch (error) {
      console.error("Error creating challenge:", error);
      toast.error("Erro ao criar desafio");
      return false;
    }
  };

  const editChallenge = async (id: string, data: {
    title: string;
    description?: string;
    emoji: string;
    start_date: string;
    end_date: string;
    target_value: number;
    is_public: boolean;
  }) => {
    try {
      const { error } = await supabase.from("challenges").update(data).eq("id", id);
      if (error) throw error;
      toast.success("Desafio atualizado");
      fetchChallenges();
      return true;
    } catch (error) {
      console.error("Error editing challenge:", error);
      toast.error("Erro ao editar desafio");
      return false;
    }
  };

  const toggleChallengeVisibility = async (challengeId: string, isPublic: boolean) => {
    try {
      const { error } = await supabase.from("challenges").update({ is_public: isPublic }).eq("id", challengeId);
      if (error) throw error;
      toast.success(isPublic ? "Desafio ativado" : "Desafio desativado");
      fetchChallenges();
    } catch (error) {
      console.error("Error toggling challenge:", error);
      toast.error("Erro ao alterar desafio");
    }
  };

  const deleteChallenge = async (challengeId: string) => {
    try {
      const { error } = await supabase.from("challenges").delete().eq("id", challengeId);
      if (error) throw error;
      toast.success("Desafio excluído");
      fetchChallenges();
      fetchStats();
    } catch (error) {
      console.error("Error deleting challenge:", error);
      toast.error("Erro ao excluir desafio");
    }
  };

  // Achievement management
  const createAchievement = async (achievement: {
    achievement_key: string;
    name: string;
    description: string;
    emoji: string;
    xp_reward: number;
    unlock_condition: string;
    is_permanent: boolean;
    expires_at?: string;
  }) => {
    try {
      const { error } = await supabase.from("admin_achievements").insert(achievement);
      if (error) throw error;
      toast.success("Conquista criada");
      fetchAchievements();
      return true;
    } catch (error) {
      console.error("Error creating achievement:", error);
      toast.error("Erro ao criar conquista");
      return false;
    }
  };

  const editAchievement = async (id: string, data: {
    name: string;
    description: string;
    emoji: string;
    xp_reward: number;
    unlock_condition: string;
    is_permanent: boolean;
    expires_at?: string;
  }) => {
    try {
      const { error } = await supabase.from("admin_achievements").update(data).eq("id", id);
      if (error) throw error;
      toast.success("Conquista atualizada");
      fetchAchievements();
      return true;
    } catch (error) {
      console.error("Error editing achievement:", error);
      toast.error("Erro ao editar conquista");
      return false;
    }
  };

  const toggleAchievementActive = async (achievementId: string, isActive: boolean) => {
    try {
      const { error } = await supabase.from("admin_achievements").update({ is_active: isActive }).eq("id", achievementId);
      if (error) throw error;
      toast.success(isActive ? "Conquista ativada" : "Conquista desativada");
      fetchAchievements();
    } catch (error) {
      console.error("Error toggling achievement:", error);
      toast.error("Erro ao alterar conquista");
    }
  };

  const deleteAchievement = async (achievementId: string) => {
    try {
      const { error } = await supabase.from("admin_achievements").delete().eq("id", achievementId);
      if (error) throw error;
      toast.success("Conquista excluída");
      fetchAchievements();
    } catch (error) {
      console.error("Error deleting achievement:", error);
      toast.error("Erro ao excluir conquista");
    }
  };

  return {
    stats,
    posts,
    users,
    challenges,
    achievements,
    publicEvents,
    loading,
    refetch: fetchAll,
    // Post actions
    hidePost,
    unhidePost,
    deletePost,
    // User actions
    suspendUser,
    reactivateUser,
    // Challenge actions
    createChallenge,
    editChallenge,
    toggleChallengeVisibility,
    deleteChallenge,
    // Achievement actions
    createAchievement,
    editAchievement,
    toggleAchievementActive,
    deleteAchievement,
  };
};

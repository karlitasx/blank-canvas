import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationsContext } from "@/contexts/NotificationsContext";
import { toast } from "sonner";

export interface FollowRelation {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface FollowUser {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  followedAt: string;
}

export const useFollows = () => {
  const { user } = useAuth();
  const { notifyNewFollower } = useNotificationsContext();
  const [following, setFollowing] = useState<string[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFollows = useCallback(async () => {
    if (!user) {
      setFollowing([]);
      setFollowers([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch who the user follows
      const { data: followingData, error: followingError } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);

      if (followingError) throw followingError;
      setFollowing(followingData?.map(f => f.following_id) || []);

      // Fetch user's followers
      const { data: followersData, error: followersError } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", user.id);

      if (followersError) throw followersError;
      setFollowers(followersData?.map(f => f.follower_id) || []);
    } catch (error) {
      console.error("Error fetching follows:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFollows();
  }, [fetchFollows]);

  const follow = async (targetUserId: string) => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return false;
    }

    if (targetUserId === user.id) {
      toast.error("Você não pode seguir a si mesmo");
      return false;
    }

    try {
      const { error } = await supabase
        .from("follows")
        .insert({
          follower_id: user.id,
          following_id: targetUserId,
        });

      if (error) throw error;

      setFollowing(prev => [...prev, targetUserId]);
      
      // Fetch follower's display name and notify the target user
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .single();
      
      const followerName = profile?.display_name || "Alguém";
      notifyNewFollower(followerName, user.id);
      
      toast.success("Seguindo!");
      return true;
    } catch (error: any) {
      console.error("Error following:", error);
      if (error.code === "23505") {
        toast.error("Você já está seguindo este usuário");
      } else {
        toast.error("Erro ao seguir usuário");
      }
      return false;
    }
  };

  const unfollow = async (targetUserId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId);

      if (error) throw error;

      setFollowing(prev => prev.filter(id => id !== targetUserId));
      toast.success("Deixou de seguir");
      return true;
    } catch (error) {
      console.error("Error unfollowing:", error);
      toast.error("Erro ao deixar de seguir");
      return false;
    }
  };

  const isFollowing = (userId: string) => following.includes(userId);
  const isFollowedBy = (userId: string) => followers.includes(userId);

  const getFollowingList = async (): Promise<FollowUser[]> => {
    if (!user) return [];

    try {
      const { data: followsData } = await supabase
        .from("follows")
        .select("following_id, created_at")
        .eq("follower_id", user.id);

      if (!followsData?.length) return [];

      const userIds = followsData.map(f => f.following_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      return followsData.map(f => {
        const profile = profileMap.get(f.following_id);
        return {
          userId: f.following_id,
          displayName: profile?.display_name || "Usuário",
          avatarUrl: profile?.avatar_url || null,
          followedAt: f.created_at,
        };
      });
    } catch (error) {
      console.error("Error fetching following list:", error);
      return [];
    }
  };

  const getFollowersList = async (): Promise<FollowUser[]> => {
    if (!user) return [];

    try {
      const { data: followsData } = await supabase
        .from("follows")
        .select("follower_id, created_at")
        .eq("following_id", user.id);

      if (!followsData?.length) return [];

      const userIds = followsData.map(f => f.follower_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      return followsData.map(f => {
        const profile = profileMap.get(f.follower_id);
        return {
          userId: f.follower_id,
          displayName: profile?.display_name || "Usuário",
          avatarUrl: profile?.avatar_url || null,
          followedAt: f.created_at,
        };
      });
    } catch (error) {
      console.error("Error fetching followers list:", error);
      return [];
    }
  };

  return {
    following,
    followers,
    followingCount: following.length,
    followersCount: followers.length,
    loading,
    follow,
    unfollow,
    isFollowing,
    isFollowedBy,
    getFollowingList,
    getFollowersList,
    refetch: fetchFollows,
  };
};

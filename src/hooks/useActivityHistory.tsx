import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ActivityItem {
  id: string;
  type: "habit_completion" | "transaction" | "post" | "achievement" | "comment" | "follow" | "challenge_join";
  title: string;
  emoji: string;
  timestamp: string;
}

export interface DetailedStats {
  totalLikes: number;
  postsCreated: number;
  commentsMade: number;
  challengesJoined: number;
  connections: number;
  transactionsLogged: number;
  eventsCreated: number;
  wishlistItems: number;
}

export const useActivityHistory = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [detailedStats, setDetailedStats] = useState<DetailedStats>({
    totalLikes: 0,
    postsCreated: 0,
    commentsMade: 0,
    challengesJoined: 0,
    connections: 0,
    transactionsLogged: 0,
    eventsCreated: 0,
    wishlistItems: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch all data in parallel
      const [
        habitCompletions,
        transactions,
        posts,
        comments,
        achievements,
        follows,
        challengeParticipants,
        postLikes,
        events,
        wishlist,
      ] = await Promise.all([
        supabase
          .from("habit_completions")
          .select("id, completed_at, habit_id, habits(name, emoji)")
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false })
          .limit(20),
        supabase
          .from("transactions")
          .select("id, created_at, description, category, type, amount")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("posts")
          .select("id, created_at, content, emoji")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("comments")
          .select("id, created_at, content")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("user_achievements")
          .select("id, unlocked_at, achievement_id")
          .eq("user_id", user.id)
          .order("unlocked_at", { ascending: false })
          .limit(20),
        supabase
          .from("follows")
          .select("id, created_at")
          .eq("follower_id", user.id),
        supabase
          .from("challenge_participants")
          .select("id, joined_at")
          .eq("user_id", user.id),
        supabase
          .from("post_likes")
          .select("id")
          .eq("user_id", user.id),
        supabase
          .from("events")
          .select("id")
          .eq("user_id", user.id),
        supabase
          .from("wishlist")
          .select("id")
          .eq("user_id", user.id),
      ]);

      // Build activity items
      const items: ActivityItem[] = [];

      habitCompletions.data?.forEach((hc: any) => {
        items.push({
          id: hc.id,
          type: "habit_completion",
          title: `Hábito completado: ${hc.habits?.name || "Hábito"}`,
          emoji: hc.habits?.emoji || "✅",
          timestamp: hc.completed_at,
        });
      });

      transactions.data?.forEach((tx) => {
        items.push({
          id: tx.id,
          type: "transaction",
          title: `${tx.type === "income" ? "Receita" : "Despesa"}: ${tx.description || tx.category}`,
          emoji: tx.type === "income" ? "💰" : "💸",
          timestamp: tx.created_at,
        });
      });

      posts.data?.forEach((p) => {
        items.push({
          id: p.id,
          type: "post",
          title: `Post publicado`,
          emoji: p.emoji || "📝",
          timestamp: p.created_at,
        });
      });

      comments.data?.forEach((c) => {
        items.push({
          id: c.id,
          type: "comment",
          title: "Comentário feito",
          emoji: "💬",
          timestamp: c.created_at,
        });
      });

      achievements.data?.forEach((a) => {
        items.push({
          id: a.id,
          type: "achievement",
          title: "Conquista desbloqueada",
          emoji: "🏆",
          timestamp: a.unlocked_at,
        });
      });

      // Sort by timestamp descending
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setActivities(items);

      // Build detailed stats
      setDetailedStats({
        totalLikes: postLikes.data?.length || 0,
        postsCreated: posts.data?.length || 0,
        commentsMade: comments.data?.length || 0,
        challengesJoined: challengeParticipants.data?.length || 0,
        connections: follows.data?.length || 0,
        transactionsLogged: transactions.data?.length || 0,
        eventsCreated: events.data?.length || 0,
        wishlistItems: wishlist.data?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching activity history:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { activities, detailedStats, isLoading, refetch: fetchData };
};

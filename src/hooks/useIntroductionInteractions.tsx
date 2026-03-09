import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePoints } from "@/hooks/usePoints";
import { toast } from "@/hooks/use-toast";

export interface IntroComment {
  id: string;
  introduction_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export const useIntroductionInteractions = (introductionId: string) => {
  const { user } = useAuth();
  const { awardPoints } = usePoints();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState<IntroComment[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [loadingComments, setLoadingComments] = useState(false);

  // Check if user liked this introduction
  const checkLike = useCallback(async () => {
    if (!user) return;
    const { count } = await supabase
      .from("introduction_likes" as any)
      .select("*", { count: "exact", head: true })
      .eq("introduction_id", introductionId)
      .eq("user_id", user.id);
    setLiked((count || 0) > 0);
  }, [user, introductionId]);

  // Get likes count
  const fetchLikesCount = useCallback(async () => {
    const { count } = await supabase
      .from("introduction_likes" as any)
      .select("*", { count: "exact", head: true })
      .eq("introduction_id", introductionId);
    setLikesCount(count || 0);
  }, [introductionId]);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const { data } = await (supabase as any)
        .from("introduction_comments")
        .select("*")
        .eq("introduction_id", introductionId)
        .order("created_at", { ascending: true });

      if (data && data.length > 0) {
        const userIds = data.map((c: any) => c.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", userIds);

        const profileMap = Object.fromEntries(
          (profiles || []).map(p => [p.user_id, p])
        );

        setComments(data.map((c: any) => ({
          ...c,
          profile: profileMap[c.user_id] || null,
        })));
      } else {
        setComments([]);
      }
      setCommentsCount(data?.length || 0);
    } finally {
      setLoadingComments(false);
    }
  }, [introductionId]);

  useEffect(() => {
    checkLike();
    fetchLikesCount();
  }, [checkLike, fetchLikesCount]);

  // Toggle like
  const toggleLike = useCallback(async () => {
    if (!user) return;

    if (liked) {
      await (supabase as any)
        .from("introduction_likes")
        .delete()
        .eq("introduction_id", introductionId)
        .eq("user_id", user.id);
      setLiked(false);
      setLikesCount(prev => Math.max(0, prev - 1));
    } else {
      await (supabase as any)
        .from("introduction_likes")
        .insert({ introduction_id: introductionId, user_id: user.id });
      setLiked(true);
      setLikesCount(prev => prev + 1);
      await awardPoints("introduction_like", `intro_like_${introductionId}`);
    }
  }, [user, liked, introductionId, awardPoints]);

  // Add comment
  const addComment = useCallback(async (content: string) => {
    if (!user || !content.trim()) return;

    const { error } = await (supabase as any)
      .from("introduction_comments")
      .insert({
        introduction_id: introductionId,
        user_id: user.id,
        content: content.trim(),
      });

    if (error) {
      toast({ title: "Erro ao comentar", variant: "destructive" });
      return;
    }

    await awardPoints("introduction_comment", `intro_comment_${introductionId}_${Date.now()}`);
    await fetchComments();
  }, [user, introductionId, awardPoints, fetchComments]);

  // Delete comment
  const deleteComment = useCallback(async (commentId: string) => {
    await (supabase as any)
      .from("introduction_comments")
      .delete()
      .eq("id", commentId);
    await fetchComments();
  }, [fetchComments]);

  return {
    liked,
    likesCount,
    comments,
    commentsCount,
    loadingComments,
    toggleLike,
    addComment,
    deleteComment,
    fetchComments,
  };
};

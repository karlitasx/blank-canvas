import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePoints } from "@/hooks/usePoints";
import { toast } from "sonner";

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  author?: {
    display_name: string;
    avatar_url: string | null;
  };
}

export const useComments = (postId: string) => {
  const { user } = useAuth();
  const { awardPoints } = usePoints();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const { data: commentsData, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (commentsData?.length) {
        const userIds = [...new Set(commentsData.map(c => c.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

        const enrichedComments = commentsData.map(comment => ({
          ...comment,
          author: profileMap.get(comment.user_id) || {
            display_name: "Usuário",
            avatar_url: null,
          },
        }));

        setComments(enrichedComments);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const addComment = useCallback(async (content: string) => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return false;
    }

    if (!content.trim()) {
      toast.error("O comentário não pode estar vazio");
      return false;
    }

    if (content.length > 500) {
      toast.error("O comentário deve ter no máximo 500 caracteres");
      return false;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          user_id: user.id,
          post_id: postId,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      // Award 5 points for commenting
      await awardPoints("comment_create", data.id);

      // Fetch author info
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .eq("user_id", user.id)
        .single();

      const newComment: Comment = {
        ...data,
        author: profile || { display_name: "Usuário", avatar_url: null },
      };

      setComments(prev => [...prev, newComment]);
      toast.success("Comentário adicionado! +5 pontos 🎉");
      return true;
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Erro ao adicionar comentário");
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [user, postId, awardPoints]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (error) throw error;

      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success("Comentário removido");
      return true;
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Erro ao remover comentário");
      return false;
    }
  }, [user]);

  return {
    comments,
    loading,
    submitting,
    fetchComments,
    addComment,
    deleteComment,
    commentsCount: comments.length,
  };
};

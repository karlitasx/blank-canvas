import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePoints } from "@/hooks/usePoints";
import { Post, CreatePostInput } from "@/types/posts";
import { toast } from "sonner";

export const useSupabasePosts = (filterByFollowing: boolean = false) => {
  const { user } = useAuth();
  const { awardPoints } = usePoints();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<string[]>([]);

  const fetchPosts = useCallback(async () => {
    try {
      // If filtering by following, first get who user follows
      let followingUserIds: string[] = [];
      if (filterByFollowing && user) {
        const { data: followsData } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.id);
        
        followingUserIds = followsData?.map(f => f.following_id) || [];
        setFollowingIds(followingUserIds);
        
        // Include own posts in "following" feed
        followingUserIds.push(user.id);
      }

      // Fetch posts
      let query = supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply filter if needed
      if (filterByFollowing && followingUserIds.length > 0) {
        query = query.in("user_id", followingUserIds);
      } else if (filterByFollowing) {
        // User follows nobody, only show own posts
        query = query.eq("user_id", user?.id || "");
      }

      const { data: postsData, error: postsError } = await query;

      if (postsError) throw postsError;

      // Fetch user's likes
      let userLikes: string[] = [];
      if (user) {
        const { data: likesData } = await supabase
          .from("post_likes")
          .select("post_id")
          .eq("user_id", user.id);
        userLikes = likesData?.map(l => l.post_id) || [];
      }

      // Fetch profiles for all post authors
      const authorIds = [...new Set(postsData?.map(p => p.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", authorIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      // Combine data
      const enrichedPosts = (postsData || []).map(post => {
        const profile = profileMap.get(post.user_id);
        return {
          ...post,
          author_name: profile?.display_name || "Usuário",
          author_avatar: profile?.avatar_url,
          is_liked: userLikes.includes(post.id),
          is_own: user?.id === post.user_id,
        } as Post;
      });

      setPosts(enrichedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Erro ao carregar posts");
    } finally {
      setLoading(false);
    }
  }, [user, filterByFollowing]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = async (input: CreatePostInput) => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return null;
    }

    if (!input.content.trim()) {
      toast.error("O post não pode estar vazio");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: input.content.trim(),
          emoji: input.emoji || '💭',
        })
        .select()
        .single();

      if (error) throw error;

      // Award 10 points for creating a post
      await awardPoints("post_create", data.id);

      toast.success("Post publicado! +10 pontos 🎉");
      await fetchPosts();
      return data as Post;
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Erro ao publicar post");
      return null;
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Post excluído");
      await fetchPosts();
      return true;
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Erro ao excluir post");
      return false;
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) {
      toast.error("Você precisa estar logado para curtir");
      return false;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return false;

    try {
      if (post.is_liked) {
        // Unlike
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from("post_likes")
          .insert({
            post_id: postId,
            user_id: user.id,
          });

        if (error) throw error;

        // Award 2 points to the liker (dar curtida)
        await awardPoints("post_like", `like_${postId}`);

        // Award 2 points to the post owner (receber curtida) - only if not self-like
        if (post.user_id !== user.id) {
          await supabase.rpc("award_points_to_user", {
            target_user_id: post.user_id,
            p_action_type: "post_liked_received",
            p_action_id: `received_${postId}_${user.id}`,
            p_points: 2,
          });
        }
      }

      await fetchPosts();
      return true;
    } catch (error) {
      console.error("Error toggling like:", error);
      return false;
    }
  };

  return {
    posts,
    loading,
    followingIds,
    createPost,
    deletePost,
    toggleLike,
    refetch: fetchPosts,
  };
};

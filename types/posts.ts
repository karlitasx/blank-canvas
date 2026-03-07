export interface Post {
  id: string;
  user_id: string;
  content: string;
  emoji: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  // Joined from profiles
  author_name?: string;
  author_avatar?: string;
  // Computed
  is_liked?: boolean;
  is_own?: boolean;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface CreatePostInput {
  content: string;
  emoji?: string;
}

export const POST_EMOJIS = ['💭', '🎯', '💪', '🔥', '✨', '🏆', '💰', '🌱', '❤️', '🚀'];

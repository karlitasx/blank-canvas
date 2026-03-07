import { useState } from "react";
import { MessageSquare, Users, Globe } from "lucide-react";
import { Post } from "@/types/posts";
import { AchievementShare } from "@/types/achievement-sharing";
import { Achievement } from "@/types/achievements";
import { PostCard } from "./PostCard";
import { CreatePostForm } from "./CreatePostForm";
import { AchievementShareCard } from "@/components/achievements/AchievementShareCard";
import { ContentSkeleton } from "@/components/ui/content-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

// Combined feed item type
type FeedItem = 
  | { type: 'post'; data: Post; timestamp: string }
  | { type: 'achievement'; data: AchievementShare; achievement?: Achievement; timestamp: string };

type FeedFilter = "all" | "following";

interface SocialFeedProps {
  posts: Post[];
  achievementShares?: AchievementShare[];
  getAchievementById?: (id: string) => Achievement | undefined;
  loading: boolean;
  onCreatePost: (content: string, emoji: string) => Promise<boolean>;
  onLikePost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  userAvatar?: string | null;
  userName?: string;
  showFilters?: boolean;
  onFilterChange?: (filter: FeedFilter) => void;
}

export const SocialFeed = ({
  posts,
  achievementShares = [],
  getAchievementById,
  loading,
  onCreatePost,
  onLikePost,
  onDeletePost,
  userAvatar,
  userName,
  showFilters = false,
  onFilterChange,
}: SocialFeedProps) => {
  const [filter, setFilter] = useState<FeedFilter>("all");

  const handleFilterChange = (newFilter: FeedFilter) => {
    setFilter(newFilter);
    onFilterChange?.(newFilter);
  };

  // Combine and sort all feed items by timestamp
  const feedItems: FeedItem[] = [
    ...posts.map(post => ({
      type: 'post' as const,
      data: post,
      timestamp: post.created_at,
    })),
    ...achievementShares.map(share => ({
      type: 'achievement' as const,
      data: share,
      achievement: getAchievementById?.(share.achievement_id),
      timestamp: share.created_at,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (loading) {
    return (
      <div className="space-y-4">
        <ContentSkeleton type="card" count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Feed filter tabs */}
      {showFilters && (
        <div className="flex gap-2 p-1 bg-muted rounded-xl w-fit">
          <button
            onClick={() => handleFilterChange("all")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              filter === "all"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Globe className="w-4 h-4" />
            Todos
          </button>
          <button
            onClick={() => handleFilterChange("following")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              filter === "following"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="w-4 h-4" />
            Seguindo
          </button>
        </div>
      )}

      {/* Create post form */}
      <CreatePostForm
        onSubmit={onCreatePost}
        userAvatar={userAvatar}
        userName={userName}
      />

      {/* Combined feed */}
      {feedItems.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={filter === "following" ? "Nenhum post de quem você segue" : "Nenhum post ainda"}
          description={
            filter === "following" 
              ? "Siga outros usuários para ver suas publicações aqui!"
              : "Seja o primeiro a compartilhar algo com a comunidade!"
          }
        />
      ) : (
        <div className="space-y-3">
          {feedItems.map((item) => {
            if (item.type === 'post') {
              return (
                <PostCard
                  key={`post-${item.data.id}`}
                  post={item.data}
                  onLike={onLikePost}
                  onDelete={onDeletePost}
                />
              );
            } else {
              return (
                <AchievementShareCard
                  key={`achievement-${item.data.id}`}
                  share={item.data}
                  achievement={item.achievement}
                />
              );
            }
          })}
        </div>
      )}
    </div>
  );
};

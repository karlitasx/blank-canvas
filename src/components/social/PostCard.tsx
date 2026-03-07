import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Heart, Trash2, MoreVertical, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CommentSection } from "@/components/social/CommentSection";
import { Post } from "@/types/posts";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
}

export const PostCard = ({ post, onLike, onDelete }: PostCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const navigate = useNavigate();

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    await onLike(post.id);
    setIsLiking(false);
  };

  const handleDelete = () => {
    onDelete(post.id);
    setShowDeleteDialog(false);
  };

  const handleProfileClick = () => {
    if (!post.is_own) {
      navigate(`/user/${post.user_id}`);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <>
      <Card className="border-border/50 hover:border-border transition-colors">
        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* Avatar */}
            <Avatar 
              className={cn(
                "h-10 w-10 shrink-0",
                !post.is_own && "cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
              )}
              onClick={handleProfileClick}
            >
              <AvatarImage src={post.author_avatar || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {post.author_name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleProfileClick}
                    className={cn(
                      "font-semibold text-foreground",
                      !post.is_own && "hover:text-primary hover:underline transition-colors"
                    )}
                  >
                    {post.author_name}
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {timeAgo}
                  </span>
                </div>

                {post.is_own && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir post
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Post content */}
              <div className="mt-2 flex items-start gap-2">
                <span className="text-lg">{post.emoji}</span>
                <p className="text-foreground whitespace-pre-wrap break-words">
                  {post.content}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-3 flex items-center gap-4">
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={cn(
                    "flex items-center gap-1.5 text-sm transition-colors",
                    post.is_liked
                      ? "text-destructive"
                      : "text-muted-foreground hover:text-destructive"
                  )}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4 transition-all",
                      post.is_liked && "fill-current",
                      isLiking && "scale-125"
                    )}
                  />
                  <span>{post.likes_count}</span>
                </button>
              </div>

              {/* Comments Section */}
              <div className="mt-4 pt-3 border-t border-border/50">
                <CommentSection 
                  postId={post.id} 
                  initialCount={post.comments_count || 0} 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir post?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O post será permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

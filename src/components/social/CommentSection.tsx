import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircle, Send, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useComments } from "@/hooks/useComments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface CommentSectionProps {
  postId: string;
  initialCount?: number;
}

export const CommentSection = ({ postId, initialCount = 0 }: CommentSectionProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const { comments, loading, submitting, fetchComments, addComment, deleteComment } = useComments(postId);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, fetchComments]);

  const handleSubmit = async () => {
    const success = await addComment(newComment);
    if (success) {
      setNewComment("");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayCount = isOpen ? comments.length : initialCount;

  return (
    <div className="space-y-3">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
      >
        <MessageCircle className="w-4 h-4" />
        <span>{displayCount} {displayCount === 1 ? "comentário" : "comentários"}</span>
      </button>

      {/* Comments section */}
      {isOpen && (
        <div className="space-y-4 animate-fade-in">
          {/* Comment input */}
          {user && (
            <div className="flex gap-3">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escreva um comentário..."
                className="min-h-[60px] resize-none bg-muted/50 border-border"
                maxLength={500}
              />
              <Button
                size="icon"
                onClick={handleSubmit}
                disabled={submitting || !newComment.trim()}
                className="shrink-0"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}

          {/* Comments list */}
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum comentário ainda. Seja o primeiro!
            </p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={cn(
                    "flex gap-3 p-3 rounded-lg bg-muted/30",
                    comment.user_id === user?.id && "bg-primary/5"
                  )}
                >
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={comment.author?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {getInitials(comment.author?.display_name || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {comment.author?.display_name || "Usuário"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 mt-1 break-words">
                      {comment.content}
                    </p>
                  </div>
                  {comment.user_id === user?.id && (
                    <button
                      onClick={() => deleteComment(comment.id)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

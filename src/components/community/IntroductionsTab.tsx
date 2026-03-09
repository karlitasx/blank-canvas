import { useState } from "react";
import { Plus, Edit2, Clock, TrendingUp, RefreshCw, UserPlus, Heart, MessageCircle, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContentSkeleton } from "@/components/ui/content-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useIntroductions, type Introduction } from "@/hooks/useIntroductions";
import { useIntroductionInteractions, type IntroComment } from "@/hooks/useIntroductionInteractions";
import { useConnections } from "@/hooks/useConnections";
import { useAuth } from "@/hooks/useAuth";
import { usePoints } from "@/hooks/usePoints";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

type SortMode = "recent" | "popular";

const IntroductionsTab = () => {
  const { introductions, myIntroduction, loading, createOrUpdateIntroduction, refetch } = useIntroductions();
  const { user } = useAuth();
  const { awardPoints } = usePoints();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState("");
  const [goals, setGoals] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("recent");

  const handleOpenModal = () => {
    setContent(myIntroduction?.content || "");
    setGoals(myIntroduction?.goals || "");
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    const isNew = !myIntroduction;
    await createOrUpdateIntroduction(content.trim(), goals.trim());
    if (isNew) {
      await awardPoints("introduction_create", `intro_create_${user?.id}`);
    }
    setIsModalOpen(false);
  };

  const sortedIntroductions = [...introductions].sort((a, b) => {
    if (sortMode === "popular") {
      return (b as any).likes_count - (a as any).likes_count || 
             new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (loading) {
    return <ContentSkeleton type="card" count={4} />;
  }

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/80 via-primary/60 to-accent/50 p-6 sm:p-8 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.3),transparent_70%)]" />
        <div className="relative z-10 space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-primary-foreground">
            Apresentações da comunidade
          </h2>
          <p className="text-primary-foreground/80 max-w-lg mx-auto text-xs sm:text-sm">
            Conheça outros membros, compartilhe seus objetivos financeiros e mostre pro clubinho que você chegou pra ficar!
          </p>
          <Button
            onClick={handleOpenModal}
            variant="secondary"
            className="gap-2 bg-background/90 hover:bg-background text-foreground"
          >
            {myIntroduction ? (
              <><Edit2 className="w-4 h-4" /> Editar apresentação</>
            ) : (
              <><Plus className="w-4 h-4" /> Faça sua apresentação</>
            )}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-base sm:text-lg font-bold">Apresentações recentes</h3>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setSortMode("recent")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all",
                sortMode === "recent"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Clock className="w-3.5 h-3.5" /> Recentes
            </button>
            <button
              onClick={() => setSortMode("popular")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all",
                sortMode === "popular"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <TrendingUp className="w-3.5 h-3.5" /> Populares
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={refetch} className="gap-1.5 text-xs sm:text-sm">
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
        </div>
      </div>

      {/* Introductions List */}
      {sortedIntroductions.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="Nenhuma apresentação ainda"
          description="Seja a primeira a se apresentar para a comunidade!"
          action={{ label: "Fazer apresentação", onClick: handleOpenModal }}
        />
      ) : (
        <div className="space-y-4">
          {sortedIntroductions.map((intro) => (
            <IntroductionCard
              key={intro.id}
              introduction={intro}
              isOwn={intro.user_id === user?.id}
              onNavigate={(userId) => navigate(`/user/${userId}`)}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {myIntroduction ? "Editar sua apresentação" : "Faça sua apresentação"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <p className="text-sm text-muted-foreground">
              Compartilhe um pouco sobre você e seus objetivos com a comunidade.
            </p>

            <div className="space-y-2">
              <Label>Sobre mim</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Conte um pouco sobre você, seus interesses, profissão, hobbies..."
                className="min-h-[120px] bg-input border-border resize-none"
                maxLength={1000}
              />
              <span className="text-xs text-muted-foreground">{content.length}/1000</span>
            </div>

            <div className="space-y-2">
              <Label>Meus objetivos financeiros</Label>
              <Textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="Quais são seus objetivos financeiros? O que você quer alcançar?"
                className="min-h-[100px] bg-input border-border resize-none"
                maxLength={1000}
              />
              <span className="text-xs text-muted-foreground">{goals.length}/1000</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={!content.trim()} className="btn-gradient">
                {myIntroduction ? "Salvar" : "Publicar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Card Component ───────────────────────────────────────────────
interface IntroductionCardProps {
  introduction: Introduction;
  isOwn: boolean;
  onNavigate: (userId: string) => void;
}

const IntroductionCard = ({ introduction, isOwn, onNavigate }: IntroductionCardProps) => {
  const { connect } = useConnections();
  const { user } = useAuth();
  const {
    liked, likesCount, comments, commentsCount,
    toggleLike, addComment, deleteComment, fetchComments, loadingComments,
  } = useIntroductionInteractions(introduction.id);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const displayName = introduction.profile?.display_name || "Usuária";
  const avatarUrl = introduction.profile?.avatar_url;
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleConnect = async () => {
    setConnecting(true);
    const success = await connect(introduction.user_id);
    if (success) setConnected(true);
    setConnecting(false);
  };

  const handleToggleComments = () => {
    if (!showComments) fetchComments();
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    await addComment(commentText);
    setCommentText("");
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden transition-all hover:shadow-md">
      {/* Header */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div
            className="flex items-center gap-3 cursor-pointer min-w-0"
            onClick={() => onNavigate(introduction.user_id)}
          >
            <Avatar className="h-12 w-12 sm:h-14 sm:w-14 border-2 border-primary/30 shrink-0">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm sm:text-base">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-bold text-foreground truncate text-base sm:text-lg">{displayName}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(introduction.created_at), "dd/MM/yyyy, HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>

          {!isOwn && !connected && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleConnect}
              disabled={connecting}
              className="gap-1.5 shrink-0 rounded-full border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <UserPlus className="w-4 h-4" />
              Conectar
            </Button>
          )}
          {connected && (
            <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              ✓ Conectada
            </span>
          )}
        </div>

        {/* Content */}
        <div className="space-y-3">
          <div>
            <p className="text-sm font-bold text-foreground mb-1">Sobre mim:</p>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
              {introduction.content}
            </p>
          </div>
          {introduction.goals && (
            <div>
              <p className="text-sm font-bold text-foreground mb-1">Meus objetivos financeiros:</p>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                {introduction.goals}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Divider + Actions */}
      <div className="border-t border-border px-4 sm:px-5 py-3 flex items-center gap-4">
        <button
          onClick={toggleLike}
          className={cn(
            "flex items-center gap-1.5 text-sm transition-all",
            liked ? "text-pink-500" : "text-muted-foreground hover:text-pink-500"
          )}
        >
          <Heart className={cn("w-5 h-5", liked && "fill-current")} />
          <span className="font-medium">{likesCount}</span>
        </button>

        <button
          onClick={handleToggleComments}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">{commentsCount}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-border px-4 sm:px-5 py-3 space-y-3 bg-muted/20">
          {/* Comment input */}
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {user?.email?.slice(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escreva um comentário..."
                className="text-sm bg-background"
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              />
              <Button
                size="icon"
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="shrink-0 btn-gradient h-9 w-9"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Comments list */}
          {loadingComments ? (
            <p className="text-xs text-muted-foreground text-center py-2">Carregando...</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">Nenhum comentário ainda. Seja a primeira!</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  isOwn={comment.user_id === user?.id}
                  onDelete={deleteComment}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Comment Item ─────────────────────────────────────────────────
interface CommentItemProps {
  comment: IntroComment;
  isOwn: boolean;
  onDelete: (id: string) => void;
}

const CommentItem = ({ comment, isOwn, onDelete }: CommentItemProps) => {
  const displayName = comment.profile?.display_name || "Usuária";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex gap-2 group">
      <Avatar className="h-7 w-7 shrink-0 mt-0.5">
        <AvatarImage src={comment.profile?.avatar_url || undefined} />
        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="bg-muted/50 rounded-xl px-3 py-2">
          <p className="text-xs font-semibold text-foreground">{displayName}</p>
          <p className="text-xs text-foreground/80">{comment.content}</p>
        </div>
        <div className="flex items-center gap-2 mt-0.5 px-1">
          <span className="text-[10px] text-muted-foreground">
            {format(new Date(comment.created_at), "dd/MM, HH:mm", { locale: ptBR })}
          </span>
          {isOwn && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-[10px] text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntroductionsTab;

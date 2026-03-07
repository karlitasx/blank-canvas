import { useState } from "react";
import { Eye, EyeOff, Trash2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Post {
  id: string;
  content: string;
  emoji: string | null;
  created_at: string;
  is_hidden: boolean;
  user_id: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface AdminPostsTableProps {
  posts: Post[];
  onHide: (id: string) => void;
  onUnhide: (id: string) => void;
  onDelete: (id: string) => void;
}

const AdminPostsTable = ({ posts, onHide, onUnhide, onDelete }: AdminPostsTableProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <>
      <Card className="p-4 bg-card border-border">
        <h3 className="font-semibold text-foreground mb-4">Moderação de Posts</h3>
        
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum post encontrado
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {posts.map((post) => (
              <div
                key={post.id}
                className={`p-3 rounded-lg border ${
                  post.is_hidden ? "bg-muted/50 border-destructive/30" : "bg-muted/30 border-border"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.profile?.avatar_url || ""} />
                    <AvatarFallback>
                      {post.profile?.display_name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {post.profile?.display_name || "Usuário"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(post.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </span>
                      {post.is_hidden && (
                        <Badge variant="destructive" className="text-xs">
                          Oculto
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.emoji} {post.content}
                    </p>
                  </div>

                  <div className="flex gap-1">
                    {post.is_hidden ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUnhide(post.id)}
                        title="Restaurar"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onHide(post.id)}
                        title="Ocultar"
                      >
                        <EyeOff className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(post.id)}
                      className="text-destructive hover:text-destructive"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Excluir Post
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O post será permanentemente removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) onDelete(deleteId);
                setDeleteId(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminPostsTable;

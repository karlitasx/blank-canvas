import { UserX, UserCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface User {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_suspended: boolean;
  created_at: string;
  total_points?: number;
}

interface AdminUsersTableProps {
  users: User[];
  onSuspend: (userId: string) => void;
  onReactivate: (userId: string) => void;
}

const AdminUsersTable = ({ users, onSuspend, onReactivate }: AdminUsersTableProps) => {
  return (
    <Card className="p-4 bg-card border-border">
      <h3 className="font-semibold text-foreground mb-4">Gestão de Usuários</h3>
      
      {users.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhum usuário encontrado
        </p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {users.map((user) => (
            <div
              key={user.id}
              className={`p-3 rounded-lg border ${
                user.is_suspended ? "bg-destructive/5 border-destructive/30" : "bg-muted/30 border-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url || ""} />
                  <AvatarFallback>
                    {user.display_name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {user.display_name || "Usuário"}
                    </span>
                    {user.is_suspended && (
                      <Badge variant="destructive" className="text-xs">
                        Suspenso
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{user.total_points || 0} pontos</span>
                    <span>•</span>
                    <span>
                      Desde {format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </div>

                {user.is_suspended ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReactivate(user.user_id)}
                    className="gap-1"
                  >
                    <UserCheck className="h-4 w-4" />
                    Reativar
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSuspend(user.user_id)}
                    className="gap-1 text-destructive hover:text-destructive"
                  >
                    <UserX className="h-4 w-4" />
                    Suspender
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default AdminUsersTable;

import { useState } from "react";
import { Challenge, CHALLENGE_TYPES } from "@/types/challenges";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Users, Calendar, LogIn, LogOut, Trophy, Trash2 } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ChallengeCardProps {
  challenge: Challenge;
  onJoin: (id: string) => void;
  onLeave: (id: string) => void;
  onViewLeaderboard: (challenge: Challenge) => void;
  onDelete?: (id: string) => void;
}

const ChallengeCard = ({ challenge, onJoin, onLeave, onViewLeaderboard, onDelete }: ChallengeCardProps) => {
  const { user } = useAuth();
  const challengeType = CHALLENGE_TYPES.find(t => t.value === challenge.challenge_type);
  const progress = challenge.my_progress || 0;
  const progressPercent = Math.min((progress / challenge.target_value) * 100, 100);
  const daysLeft = differenceInDays(parseISO(challenge.end_date), new Date());
  const isEnded = daysLeft < 0;
  const isCompleted = progress >= challenge.target_value;
  const isCreator = user?.id === challenge.created_by;

  const [confirmName, setConfirmName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleConfirmDelete = () => {
    if (confirmName.trim().toLowerCase() === challenge.title.trim().toLowerCase()) {
      onDelete?.(challenge.id);
      setDialogOpen(false);
      setConfirmName("");
    }
  };

  return (
    <Card className={`p-4 border-border transition-all hover:border-primary/50 ${isEnded ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-4">
        {/* Emoji */}
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
          {challenge.emoji}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-foreground truncate">{challenge.title}</h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {challenge.participants_count} participantes
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {isEnded ? 'Encerrado' : daysLeft === 0 ? 'Último dia!' : `${daysLeft} dias restantes`}
                </span>
              </div>
            </div>

            {/* Badge */}
            <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${
              isCompleted ? 'bg-green-500/20 text-green-500' :
              challenge.is_joined ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              {isCompleted ? '✓ Concluído' : challenge.is_joined ? 'Participando' : 'Disponível'}
            </span>
          </div>

          {/* Description */}
          {challenge.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {challenge.description}
            </p>
          )}

          {/* Goal */}
          <div className="flex items-center gap-2 mb-3 text-sm">
            <span className="text-muted-foreground">Meta:</span>
            <span className="font-medium text-foreground">
              {challengeType?.unit === 'R$' ? `R$ ${challenge.target_value.toLocaleString()}` : `${challenge.target_value} ${challengeType?.unit || 'pontos'}`}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{challengeType?.label}</span>
          </div>

          {/* Progress (if joined) */}
          {challenge.is_joined && (
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Seu progresso</span>
                <span className="font-medium text-foreground">
                  {progress} / {challenge.target_value}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {!isEnded && (
              challenge.is_joined ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewLeaderboard(challenge)}
                    className="gap-1"
                  >
                    <Trophy className="h-3 w-3" />
                    Ranking
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLeave(challenge.id)}
                    className="gap-1 text-muted-foreground hover:text-destructive"
                  >
                    <LogOut className="h-3 w-3" />
                    Sair
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => onJoin(challenge.id)}
                  className="gap-1"
                >
                  <LogIn className="h-3 w-3" />
                  Participar
                </Button>
              )
            )}

            {/* Delete button for creator */}
            {isCreator && onDelete && (
              <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-muted-foreground hover:text-destructive ml-auto"
                  >
                    <Trash2 className="h-3 w-3" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir desafio</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                      <p>
                        Esta ação é irreversível. Para confirmar, digite o nome do desafio:
                      </p>
                      <p className="font-semibold text-foreground">"{challenge.title}"</p>
                      <Input
                        placeholder="Digite o nome do desafio"
                        value={confirmName}
                        onChange={(e) => setConfirmName(e.target.value)}
                        className="mt-2"
                      />
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setConfirmName("")}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleConfirmDelete}
                      disabled={confirmName.trim().toLowerCase() !== challenge.title.trim().toLowerCase()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Excluir definitivamente
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChallengeCard;

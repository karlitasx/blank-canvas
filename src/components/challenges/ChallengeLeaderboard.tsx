import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Challenge, ChallengeParticipant, CHALLENGE_TYPES } from "@/types/challenges";
import { useSupabaseChallenges } from "@/hooks/useSupabaseChallenges";
import { Trophy, Medal, Crown, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

interface ChallengeLeaderboardProps {
  challenge: Challenge | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ChallengeLeaderboard = ({ challenge, open, onOpenChange }: ChallengeLeaderboardProps) => {
  const { getParticipants } = useSupabaseChallenges();
  const { user } = useAuth();
  const [participants, setParticipants] = useState<ChallengeParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (challenge && open) {
      setLoading(true);
      getParticipants(challenge.id).then((data) => {
        setParticipants(data);
        setLoading(false);
      });
    }
  }, [challenge, open]);

  if (!challenge) return null;

  const challengeType = CHALLENGE_TYPES.find(t => t.value === challenge.challenge_type);

  const formatProgress = (value: number) => {
    if (challengeType?.unit === 'R$') {
      return `R$ ${value.toLocaleString()}`;
    }
    return `${value} ${challengeType?.unit || 'pts'}`;
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 1: return <Medal className="h-5 w-5 text-gray-400" />;
      case 2: return <Medal className="h-5 w-5 text-orange-500" />;
      default: return <span className="text-sm font-medium text-muted-foreground w-5 text-center">{index + 1}</span>;
    }
  };

  const getRankBg = (index: number) => {
    switch (index) {
      case 0: return "bg-yellow-500/10 border-yellow-500/30";
      case 1: return "bg-gray-500/10 border-gray-500/30";
      case 2: return "bg-orange-500/10 border-orange-500/30";
      default: return "bg-muted/50";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Trophy className="h-5 w-5 text-primary" />
            Ranking do Desafio
          </DialogTitle>
        </DialogHeader>

        {/* Challenge Info */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
            {challenge.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{challenge.title}</h4>
            <p className="text-xs text-muted-foreground">
              Meta: {formatProgress(challenge.target_value)}
            </p>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="w-5 h-5" />
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))
          ) : participants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>Nenhum participante ainda</p>
            </div>
          ) : (
            participants.map((participant, index) => {
              const isCurrentUser = participant.user_id === user?.id;
              const progressPercent = Math.min((participant.current_progress / challenge.target_value) * 100, 100);
              const isCompleted = participant.current_progress >= challenge.target_value;

              return (
                <div
                  key={participant.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    isCurrentUser ? "border-primary/50 bg-primary/10" : getRankBg(index)
                  }`}
                >
                  {/* Rank */}
                  <div className="w-6 flex justify-center">
                    {getRankIcon(index)}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={participant.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-sm">
                      {participant.display_name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  {/* Name & Progress */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
                      {participant.display_name || "Usuário"}
                      {isCurrentUser && " (Você)"}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-primary'}`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {Math.round(progressPercent)}%
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className={`font-bold ${isCompleted ? 'text-green-500' : 'text-foreground'}`}>
                      {formatProgress(participant.current_progress)}
                    </p>
                    {isCompleted && (
                      <span className="text-xs text-green-500">✓</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChallengeLeaderboard;

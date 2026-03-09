import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Trophy, Calendar, Users, Flame, Zap, Crown, Medal, ChevronDown, ChevronUp, Camera, Plus, X } from "lucide-react";
import { useSupabaseChallenges } from "@/hooks/useSupabaseChallenges";
import { useGymRatsChallenges } from "@/hooks/useGymRatsChallenges";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { differenceInDays, parseISO, format, getDaysInMonth, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Challenge, ChallengeParticipant } from "@/types/challenges";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  className?: string;
}

const GymRatsChallenges = ({ className }: Props) => {
  const { user } = useAuth();
  const { challenges, loading, joinChallenge, leaveChallenge, getParticipants, getActiveChallenges, getAvailableChallenges, refetch } = useSupabaseChallenges();
  const { uploadCheckinPhoto, getChallengeCheckins, getUserMonthlyCheckins, loading: uploadLoading } = useGymRatsChallenges();
  
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [participants, setParticipants] = useState<ChallengeParticipant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ calendar: true });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [monthlyCheckins, setMonthlyCheckins] = useState<any[]>([]);
  const [recentCheckins, setRecentCheckins] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const activeChallenges = getActiveChallenges();
  const availableChallenges = getAvailableChallenges();

  // Auto-select first active challenge
  useEffect(() => {
    if (activeChallenges.length > 0 && !selectedChallenge) {
      handleSelectChallenge(activeChallenges[0]);
    }
  }, [activeChallenges.length]);

  const handleSelectChallenge = async (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setLoadingParticipants(true);
    const data = await getParticipants(challenge.id);
    setParticipants(data);
    setLoadingParticipants(false);
  };

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="h-4 w-4 text-yellow-500" />;
      case 1: return <Medal className="h-4 w-4 text-gray-400" />;
      case 2: return <Medal className="h-4 w-4 text-orange-500" />;
      default: return <span className="text-xs font-medium text-muted-foreground">{index + 1}</span>;
    }
  };

  if (loading) {
    return (
      <div className={cn("glass-card p-6", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-muted rounded-xl" />
          <div className="h-12 bg-muted rounded-lg" />
          <div className="h-12 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  // Empty state
  if (challenges.length === 0) {
    return (
      <div className={cn("glass-card p-6", className)}>
        <div className="text-center py-8">
          <Trophy className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-1">Nenhum desafio disponível</p>
          <p className="text-xs text-muted-foreground">Desafios aparecerão aqui quando criados pela comunidade</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Active Challenge Card (GymRats style) */}
      {selectedChallenge && (
        <div className="glass-card overflow-hidden animate-fade-in">
          {/* User Stats Header */}
          <div className="bg-gradient-to-br from-primary/20 to-accent/10 p-5">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10 border-2 border-primary/30">
                <AvatarFallback className="bg-primary/20 text-primary text-sm">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground">{selectedChallenge.title}</p>
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(selectedChallenge.start_date), "dd MMM", { locale: ptBR })} — {format(parseISO(selectedChallenge.end_date), "dd MMM yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              {(() => {
                const daysLeft = Math.max(0, differenceInDays(parseISO(selectedChallenge.end_date), new Date()));
                const myPosition = participants.findIndex(p => p.user_id === user?.id) + 1;
                return (
                  <>
                    <div className="text-center">
                      <Calendar className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-bold text-foreground">{daysLeft}</p>
                      <p className="text-[10px] text-muted-foreground">dias restantes</p>
                    </div>
                    <div className="text-center">
                      <Zap className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-bold text-foreground">{selectedChallenge.my_progress || 0}</p>
                      <p className="text-[10px] text-muted-foreground">check-ins</p>
                    </div>
                    <div className="text-center">
                      <Trophy className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-bold text-foreground">#{myPosition || "—"}</p>
                      <p className="text-[10px] text-muted-foreground">posição</p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Progress bar */}
            {selectedChallenge.is_joined && (
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="text-foreground font-medium">
                    {selectedChallenge.my_progress || 0} / {selectedChallenge.target_value}
                  </span>
                </div>
                <Progress
                  value={Math.min(((selectedChallenge.my_progress || 0) / selectedChallenge.target_value) * 100, 100)}
                  className="h-1.5"
                />
              </div>
            )}
          </div>

          {/* Expandable Sections */}
          <div className="divide-y divide-border">
            {/* Rules */}
            {selectedChallenge.description && (
              <button
                onClick={() => toggleSection("rules")}
                className="w-full flex items-center justify-between p-4 text-sm text-muted-foreground hover:bg-muted/30 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="text-xs">ℹ️</span> Regras do Desafio
                </span>
                {expandedSections.rules ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
            {expandedSections.rules && selectedChallenge.description && (
              <div className="px-4 pb-4 text-sm text-muted-foreground animate-fade-in">
                {selectedChallenge.description}
              </div>
            )}

            {/* Ranking */}
            <div>
              <button
                onClick={() => toggleSection("ranking")}
                className="w-full flex items-center justify-between p-4 text-sm hover:bg-muted/30 transition-colors"
              >
                <span className="flex items-center gap-2 text-foreground font-medium">
                  <Trophy className="w-4 h-4 text-primary" /> Ranking do Desafio
                </span>
                {expandedSections.ranking ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              {expandedSections.ranking && (
                <div className="px-4 pb-4 animate-fade-in">
                  {/* Tabs */}
                  <div className="flex bg-muted/50 rounded-lg p-1 mb-3">
                    <button
                      onClick={() => setRankingTab("constancy")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all",
                        rankingTab === "constancy" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                      )}
                    >
                      <Flame className="w-3.5 h-3.5" /> Constância
                    </button>
                    <button
                      onClick={() => setRankingTab("performance")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all",
                        rankingTab === "performance" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                      )}
                    >
                      <Zap className="w-3.5 h-3.5" /> Performance
                    </button>
                  </div>

                  {/* Participants List */}
                  <div className="space-y-1.5">
                    {loadingParticipants ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
                      ))
                    ) : participants.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">Nenhum participante ainda</p>
                    ) : (
                      participants
                        .sort((a, b) => rankingTab === "constancy"
                          ? b.current_progress - a.current_progress
                          : b.current_progress - a.current_progress
                        )
                        .map((p, i) => {
                          const isMe = p.user_id === user?.id;
                          return (
                            <div
                              key={p.id}
                              className={cn(
                                "flex items-center gap-3 p-2.5 rounded-lg transition-all",
                                isMe ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/30"
                              )}
                            >
                              <div className="w-5 flex justify-center">{getRankIcon(i)}</div>
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={p.avatar_url || undefined} />
                                <AvatarFallback className="bg-primary/15 text-primary text-xs">
                                  {p.display_name?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className={cn("text-sm font-medium truncate", isMe && "text-primary")}>
                                  {p.display_name || "Usuário"}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {p.current_progress} check-ins
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-foreground">{p.current_progress}</p>
                                <p className="text-[10px] text-muted-foreground">pts</p>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Join/Leave */}
          {!selectedChallenge.is_joined && (
            <div className="p-4 border-t border-border">
              <button
                onClick={() => joinChallenge(selectedChallenge.id)}
                className="w-full btn-accent py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Participar do Desafio
              </button>
            </div>
          )}
        </div>
      )}

      {/* Challenge Selector (if multiple) */}
      {(activeChallenges.length + availableChallenges.length) > 1 && (
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">Desafios</p>
          <div className="space-y-2">
            {[...activeChallenges, ...availableChallenges].map((ch) => {
              const isSelected = selectedChallenge?.id === ch.id;
              const daysLeft = Math.max(0, differenceInDays(parseISO(ch.end_date), new Date()));
              return (
                <button
                  key={ch.id}
                  onClick={() => handleSelectChallenge(ch)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                    isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/30"
                  )}
                >
                  <span className="text-xl">{ch.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ch.title}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                      <Users className="w-3 h-3" /> {ch.participants_count} · {daysLeft}d restantes
                    </p>
                  </div>
                  {ch.is_joined && (
                    <span className="text-[10px] text-primary font-medium px-2 py-0.5 bg-primary/10 rounded-full">
                      Participando
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default GymRatsChallenges;

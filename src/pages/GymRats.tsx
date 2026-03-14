import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Dumbbell, Trophy, Search, Archive, Calendar, Users, Flame, Zap, Crown, Medal, ChevronDown, ChevronUp, Camera, Plus, X, Check, Target } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabaseChallenges } from "@/hooks/useSupabaseChallenges";
import { useGymRatsChallenges } from "@/hooks/useGymRatsChallenges";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { differenceInDays, parseISO, format, getDaysInMonth, startOfMonth, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Challenge, ChallengeParticipant, DIFFICULTY_LEVELS } from "@/types/challenges";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CreateChallengeModal from "@/components/challenges/CreateChallengeModal";
import DashboardLayout from "@/components/layout/DashboardLayout";

const GymRats = () => {
  const { user } = useAuth();
  const { challenges, loading, createChallenge, joinChallenge, leaveChallenge, getParticipants, refetch } = useSupabaseChallenges();
  const { uploadCheckinPhoto, getUserMonthlyCheckins, loading: uploadLoading } = useGymRatsChallenges();
  
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [participants, setParticipants] = useState<ChallengeParticipant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ calendar: true, ranking: true });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [monthlyCheckins, setMonthlyCheckins] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date().toISOString().split("T")[0];
  
  // Filter challenges by tab
  const myChallenges = challenges.filter(c => c.is_joined && c.end_date >= today);
  const discoverChallenges = challenges.filter(c => !c.is_joined && c.end_date >= today);
  const endedChallenges = challenges.filter(c => c.end_date < today);

  const handleSelectChallenge = async (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setLoadingParticipants(true);
    const data = await getParticipants(challenge.id);
    setParticipants(data);
    setLoadingParticipants(false);
    
    if (challenge.is_joined) {
      loadMonthlyCheckins(challenge.id);
    }
  };

  const loadMonthlyCheckins = async (challengeId: string) => {
    const checkins = await getUserMonthlyCheckins(
      challengeId,
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1
    );
    setMonthlyCheckins(checkins);
  };

  useEffect(() => {
    if (selectedChallenge?.is_joined) {
      loadMonthlyCheckins(selectedChallenge.id);
    }
  }, [currentMonth]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadCheckin = async () => {
    if (!selectedFile || !selectedChallenge) return;

    const result = await uploadCheckinPhoto(
      selectedChallenge.id,
      selectedFile,
      caption,
      selectedChallenge.points_per_checkin
    );
    if (result) {
      setShowUploadModal(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption("");
      await handleSelectChallenge(selectedChallenge);
      await refetch();
    }
  };

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="h-4 w-4 text-yellow-500" />;
      case 1: return <Medal className="h-4 w-4 text-gray-400" />;
      case 2: return <Medal className="h-4 w-4 text-amber-600" />;
      default: return <span className="text-xs font-bold text-muted-foreground w-4 text-center">{index + 1}</span>;
    }
  };

  const handleJoin = async (challenge: Challenge) => {
    await joinChallenge(challenge.id);
    await refetch();
  };

  const handleLeave = async (challengeId: string) => {
    await leaveChallenge(challengeId);
    setSelectedChallenge(null);
    await refetch();
  };

  // Challenge Card Component
  const ChallengeCard = ({ challenge, showJoin = false }: { challenge: Challenge; showJoin?: boolean }) => {
    const daysLeft = Math.max(0, differenceInDays(parseISO(challenge.end_date), new Date()));
    const isEnded = challenge.end_date < today;
    const progress = challenge.target_value > 0 ? Math.min(((challenge.my_progress || 0) / challenge.target_value) * 100, 100) : 0;
    
    return (
      <div 
        className={cn(
          "group relative bg-card rounded-2xl border border-border/50 p-4 cursor-pointer transition-all duration-200",
          "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
          selectedChallenge?.id === challenge.id && "ring-2 ring-primary border-primary/50 shadow-lg shadow-primary/10"
        )}
        onClick={() => handleSelectChallenge(challenge)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{challenge.title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-muted-foreground">
                {format(parseISO(challenge.start_date), "dd MMM", { locale: ptBR })} — {format(parseISO(challenge.end_date), "dd MMM", { locale: ptBR })}
              </p>
              {(() => {
                const diff = DIFFICULTY_LEVELS.find(d => d.value === challenge.difficulty);
                return diff ? (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {diff.icon} {diff.points}pts
                  </span>
                ) : null;
              })()}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span>{challenge.participants_count}</span>
            </div>
            {!isEnded && (
              <span className={cn(
                "text-[10px] font-medium px-2 py-0.5 rounded-full",
                daysLeft <= 3 ? "bg-orange-500/10 text-orange-600" : "bg-primary/10 text-primary"
              )}>
                {daysLeft}d
              </span>
            )}
          </div>
        </div>
        
        {challenge.is_joined && (
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-semibold text-foreground">
                {challenge.my_progress || 0}<span className="text-muted-foreground font-normal">/{challenge.target_value}</span>
              </span>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {showJoin && !challenge.is_joined && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleJoin(challenge);
            }}
            className="mt-3 w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Participar
          </button>
        )}
      </div>
    );
  };

  // Selected Challenge Detail View
  const ChallengeDetail = () => {
    if (!selectedChallenge) return null;
    
    const daysLeft = Math.max(0, differenceInDays(parseISO(selectedChallenge.end_date), new Date()));
    const myPosition = participants.findIndex(p => p.user_id === user?.id) + 1;
    const isEnded = selectedChallenge.end_date < today;
    const progress = selectedChallenge.target_value > 0 ? Math.min(((selectedChallenge.my_progress || 0) / selectedChallenge.target_value) * 100, 100) : 0;

    return (
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          <div className="relative">
            <h2 className="font-bold text-xl text-foreground">{selectedChallenge.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {format(parseISO(selectedChallenge.start_date), "dd MMM", { locale: ptBR })} — {format(parseISO(selectedChallenge.end_date), "dd MMM yyyy", { locale: ptBR })}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mt-5">
              <div className="text-center p-3 rounded-xl bg-background/50 backdrop-blur-sm">
                <Calendar className="w-5 h-5 mx-auto mb-1.5 text-primary" />
                <p className="text-xl font-bold text-foreground">{isEnded ? "—" : daysLeft}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {isEnded ? "encerrado" : "dias"}
                </p>
              </div>
              <div className="text-center p-3 rounded-xl bg-background/50 backdrop-blur-sm">
                <Target className="w-5 h-5 mx-auto mb-1.5 text-primary" />
                <p className="text-xl font-bold text-foreground">{selectedChallenge.my_progress || 0}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">check-ins</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-background/50 backdrop-blur-sm">
                <Trophy className="w-5 h-5 mx-auto mb-1.5 text-primary" />
                <p className="text-xl font-bold text-foreground">#{myPosition || "—"}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">posição</p>
              </div>
            </div>

            {/* Progress */}
            {selectedChallenge.is_joined && (
              <div className="mt-5">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-muted-foreground">Meta do desafio</span>
                  <span className="font-semibold text-foreground">
                    {selectedChallenge.my_progress || 0} / {selectedChallenge.target_value}
                  </span>
                </div>
                <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary to-accent rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sections */}
        <div className="divide-y divide-border/50">
          {/* Rules */}
          {selectedChallenge.description && (
            <div>
              <button
                onClick={() => toggleSection("rules")}
                className="w-full flex items-center justify-between p-4 text-sm hover:bg-muted/30 transition-colors"
              >
                <span className="flex items-center gap-2.5 text-foreground font-medium">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-blue-500" />
                  </div>
                  Regras do Desafio
                </span>
                {expandedSections.rules ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {expandedSections.rules && (
                <div className="px-4 pb-4 pl-[60px] animate-fade-in">
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedChallenge.description}</p>
                </div>
              )}
            </div>
          )}

          {/* Calendar */}
          {selectedChallenge.is_joined && (
            <div>
              <button
                onClick={() => toggleSection("calendar")}
                className="w-full flex items-center justify-between p-4 text-sm hover:bg-muted/30 transition-colors"
              >
                <span className="flex items-center gap-2.5 text-foreground font-medium">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-green-500" />
                  </div>
                  {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                </span>
                {expandedSections.calendar ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              {expandedSections.calendar && (
                <div className="px-4 pb-4 animate-fade-in">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-3">
                    <button 
                      onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <ChevronDown className="w-4 h-4 rotate-90" />
                    </button>
                    <span className="text-sm font-medium capitalize">
                      {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                    </span>
                    <button 
                      onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <ChevronUp className="w-4 h-4 rotate-90" />
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                      <div key={i} className="text-center text-[10px] text-muted-foreground font-medium py-2">
                        {day}
                      </div>
                    ))}
                    {(() => {
                      const year = currentMonth.getFullYear();
                      const month = currentMonth.getMonth();
                      const firstDay = startOfMonth(currentMonth).getDay();
                      const daysInMonth = getDaysInMonth(currentMonth);
                      const days = [];

                      for (let i = 0; i < firstDay; i++) {
                        days.push(<div key={`empty-${i}`} className="aspect-square" />);
                      }

                      for (let day = 1; day <= daysInMonth; day++) {
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const checkin = monthlyCheckins.find(c => c.checkin_date === dateStr);
                        const isToday = new Date().toISOString().split('T')[0] === dateStr;
                        const isPast = new Date(dateStr) < new Date(new Date().toISOString().split('T')[0]);

                        days.push(
                          <div
                            key={day}
                            className={cn(
                              "aspect-square rounded-lg flex items-center justify-center text-xs relative overflow-hidden transition-all",
                              isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                              checkin && "shadow-sm",
                              !checkin && isPast && "opacity-50"
                            )}
                          >
                            {checkin ? (
                              <img
                                src={checkin.photo_url}
                                alt={`Check-in ${day}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className={cn(
                                "text-foreground",
                                isToday && "font-bold text-primary"
                              )}>
                                {day}
                              </span>
                            )}
                          </div>
                        );
                      }

                      return days;
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ranking */}
          <div>
            <button
              onClick={() => toggleSection("ranking")}
              className="w-full flex items-center justify-between p-4 text-sm hover:bg-muted/30 transition-colors"
            >
              <span className="flex items-center gap-2.5 text-foreground font-medium">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                </div>
                Ranking
              </span>
              {expandedSections.ranking ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {expandedSections.ranking && (
              <div className="px-4 pb-4 animate-fade-in">
                <div className="space-y-2">
                  {loadingParticipants ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-14 bg-muted/50 rounded-xl animate-pulse" />
                    ))
                  ) : participants.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      Nenhum participante ainda
                    </p>
                  ) : (
                    participants
                      .sort((a, b) => b.current_progress - a.current_progress)
                      .map((p, i) => {
                        const isMe = p.user_id === user?.id;
                        return (
                          <div
                            key={p.id}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-xl transition-all",
                              isMe ? "bg-primary/10 border border-primary/20" : "bg-muted/30 hover:bg-muted/50"
                            )}
                          >
                            <div className="w-6 flex justify-center">{getRankIcon(i)}</div>
                            <Avatar className="h-9 w-9 border-2 border-background">
                              <AvatarImage src={p.avatar_url || undefined} />
                              <AvatarFallback className={cn(
                                "text-xs font-medium",
                                isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                              )}>
                                {p.display_name?.charAt(0).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-sm font-medium truncate",
                                isMe && "text-primary"
                              )}>
                                {p.display_name || "Usuário"}
                                {isMe && <span className="text-xs font-normal ml-1">(você)</span>}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {p.current_progress} check-ins
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-foreground">{p.current_progress}</p>
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

        {/* Action Buttons */}
        <div className="p-4 border-t border-border/50">
          {selectedChallenge.is_joined && !isEnded ? (
            <div className="flex gap-2">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <Camera className="w-4 h-4" />
                Fazer Check-in
              </button>
              <button
                onClick={() => handleLeave(selectedChallenge.id)}
                className="px-4 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                Sair
              </button>
            </div>
          ) : !isEnded ? (
            <button
              onClick={() => handleJoin(selectedChallenge)}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Participar do Desafio
            </button>
          ) : (
            <div className="text-center py-3 text-muted-foreground text-sm font-medium">
              Desafio encerrado
            </div>
          )}
        </div>
      </div>
    );
  };

  // Empty State Component
  const EmptyState = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
    <div className="text-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">{description}</p>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout activeNav="/gymrats">
      <div className="space-y-6">
        <PageHeader icon={Dumbbell} title="GymRats" description="Desafios fitness com a comunidade" />
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded-xl" />
          <div className="h-48 bg-muted rounded-2xl" />
        </div>
      </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeNav="/gymrats">
    <div className="space-y-6 animate-fade-in">
      <PageHeader icon={Dumbbell} title="GymRats" description="Desafios fitness com a comunidade">
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Criar Desafio
        </button>
      </PageHeader>

      <Tabs defaultValue="my" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 p-1 bg-muted/50 rounded-xl">
          <TabsTrigger value="my" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Flame className="w-4 h-4" />
            <span className="hidden sm:inline">Meus</span>
            {myChallenges.length > 0 && (
              <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">
                {myChallenges.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="discover" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Descobrir</span>
          </TabsTrigger>
          <TabsTrigger value="ended" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Archive className="w-4 h-4" />
            <span className="hidden sm:inline">Encerrados</span>
          </TabsTrigger>
        </TabsList>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Challenge List */}
          <div className="space-y-3">
            <TabsContent value="my" className="mt-0 space-y-3">
              {myChallenges.length === 0 ? (
                <EmptyState
                  icon={Flame}
                  title="Nenhum desafio ativo"
                  description="Explore a aba 'Descobrir' para encontrar desafios"
                />
              ) : (
                myChallenges.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))
              )}
            </TabsContent>

            <TabsContent value="discover" className="mt-0 space-y-3">
              {discoverChallenges.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="Nenhum desafio disponível"
                  description="Crie um novo desafio para a comunidade"
                />
              ) : (
                discoverChallenges.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} showJoin />
                ))
              )}
            </TabsContent>

            <TabsContent value="ended" className="mt-0 space-y-3">
              {endedChallenges.length === 0 ? (
                <EmptyState
                  icon={Archive}
                  title="Nenhum desafio encerrado"
                  description="Desafios finalizados aparecerão aqui"
                />
              ) : (
                endedChallenges.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))
              )}
            </TabsContent>
          </div>

          {/* Challenge Detail */}
          <div className="lg:sticky lg:top-20">
            {selectedChallenge ? (
              <ChallengeDetail />
            ) : (
              <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Selecione um desafio para ver detalhes
                </p>
              </div>
            )}
          </div>
        </div>
      </Tabs>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Novo Check-in
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {previewUrl ? (
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-border cursor-pointer hover:bg-muted/30 hover:border-primary/50 transition-all">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">Toque para tirar foto</p>
                <p className="text-xs text-muted-foreground mt-1">ou selecione da galeria</p>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            )}

            <Input
              placeholder="Adicione uma legenda (opcional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="rounded-xl"
            />

            <button
              onClick={handleUploadCheckin}
              disabled={!selectedFile || uploadLoading}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            >
              {uploadLoading ? "Enviando..." : `Enviar Check-in (+${selectedChallenge?.points_per_checkin || 10} pts)`}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Challenge Modal */}
      <CreateChallengeModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={createChallenge}
      />
    </div>
    </DashboardLayout>
  );
};

export default GymRats;

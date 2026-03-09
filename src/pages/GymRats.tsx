import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Dumbbell, Trophy, Search, Archive, Calendar, Users, Flame, Zap, Crown, Medal, ChevronDown, ChevronUp, Camera, Plus, X } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import CreateChallengeModal from "@/components/challenges/CreateChallengeModal";
import { Card, CardContent } from "@/components/ui/card";

const GymRats = () => {
  const { user } = useAuth();
  const { challenges, loading, joinChallenge, leaveChallenge, getParticipants, refetch } = useSupabaseChallenges();
  const { uploadCheckinPhoto, getChallengeCheckins, getUserMonthlyCheckins, loading: uploadLoading } = useGymRatsChallenges();
  
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
  const [recentCheckins, setRecentCheckins] = useState<any[]>([]);
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
      loadRecentCheckins(challenge.id);
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

  const loadRecentCheckins = async (challengeId: string) => {
    const checkins = await getChallengeCheckins(challengeId);
    setRecentCheckins(checkins.slice(0, 6));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadCheckin = async () => {
    if (!selectedFile || !selectedChallenge) return;

    const result = await uploadCheckinPhoto(selectedChallenge.id, selectedFile, caption);
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
      case 2: return <Medal className="h-4 w-4 text-orange-500" />;
      default: return <span className="text-xs font-medium text-muted-foreground">{index + 1}</span>;
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
    
    return (
      <Card 
        className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          selectedChallenge?.id === challenge.id && "ring-2 ring-primary"
        )}
        onClick={() => handleSelectChallenge(challenge)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{challenge.emoji}</div>
              <div>
                <h3 className="font-semibold text-foreground">{challenge.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(challenge.start_date), "dd MMM", { locale: ptBR })} — {format(parseISO(challenge.end_date), "dd MMM", { locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                {challenge.participants_count}
              </div>
              {!isEnded && (
                <p className="text-xs text-primary font-medium mt-1">{daysLeft}d restantes</p>
              )}
            </div>
          </div>
          
          {challenge.is_joined && (
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progresso</span>
                <span className="text-foreground font-medium">
                  {challenge.my_progress || 0} / {challenge.target_value}
                </span>
              </div>
              <Progress
                value={Math.min(((challenge.my_progress || 0) / challenge.target_value) * 100, 100)}
                className="h-1.5"
              />
            </div>
          )}

          {showJoin && !challenge.is_joined && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleJoin(challenge);
              }}
              className="mt-3 w-full py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              Participar
            </button>
          )}
        </CardContent>
      </Card>
    );
  };

  // Selected Challenge Detail View
  const ChallengeDetail = () => {
    if (!selectedChallenge) return null;
    
    const daysLeft = Math.max(0, differenceInDays(parseISO(selectedChallenge.end_date), new Date()));
    const myPosition = participants.findIndex(p => p.user_id === user?.id) + 1;
    const isEnded = selectedChallenge.end_date < today;

    return (
      <div className="glass-card overflow-hidden animate-fade-in">
        {/* Header Stats */}
        <div className="bg-gradient-to-br from-primary/20 to-accent/10 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">{selectedChallenge.emoji}</div>
            <div className="flex-1">
              <h2 className="font-bold text-lg text-foreground">{selectedChallenge.title}</h2>
              <p className="text-xs text-muted-foreground">
                {format(parseISO(selectedChallenge.start_date), "dd MMM", { locale: ptBR })} — {format(parseISO(selectedChallenge.end_date), "dd MMM yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <Calendar className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-bold text-foreground">{isEnded ? "0" : daysLeft}</p>
              <p className="text-[10px] text-muted-foreground">{isEnded ? "encerrado" : "dias restantes"}</p>
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
          </div>

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
                className="h-2"
              />
            </div>
          )}
        </div>

        {/* Expandable Sections */}
        <div className="divide-y divide-border">
          {/* Rules */}
          {selectedChallenge.description && (
            <>
              <button
                onClick={() => toggleSection("rules")}
                className="w-full flex items-center justify-between p-4 text-sm text-muted-foreground hover:bg-muted/30 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="text-xs">ℹ️</span> Regras do Desafio
                </span>
                {expandedSections.rules ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedSections.rules && (
                <div className="px-4 pb-4 text-sm text-muted-foreground animate-fade-in">
                  {selectedChallenge.description}
                </div>
              )}
            </>
          )}

          {/* Calendar (only for joined challenges) */}
          {selectedChallenge.is_joined && (
            <>
              <button
                onClick={() => toggleSection("calendar")}
                className="w-full flex items-center justify-between p-4 text-sm hover:bg-muted/30 transition-colors"
              >
                <span className="flex items-center gap-2 text-foreground font-medium">
                  <Calendar className="w-4 h-4 text-primary" /> {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                </span>
                {expandedSections.calendar ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              {expandedSections.calendar && (
                <div className="px-4 pb-4 animate-fade-in">
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'].map((day) => (
                      <div key={day} className="text-center text-[10px] text-muted-foreground font-medium py-1">
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

                        days.push(
                          <div
                            key={day}
                            className={cn(
                              "aspect-square rounded-lg flex items-center justify-center text-xs relative",
                              isToday && "ring-2 ring-primary",
                              checkin ? "bg-primary/10" : "hover:bg-muted/30"
                            )}
                          >
                            {checkin ? (
                              <img
                                src={checkin.photo_url}
                                alt={`Check-in ${day}`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <span className={cn("text-foreground", isToday && "font-bold")}>{day}</span>
                            )}
                          </div>
                        );
                      }

                      return days;
                    })()}
                  </div>

                  {recentCheckins.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Check-ins Recentes</p>
                      <div className="grid grid-cols-3 gap-2">
                        {recentCheckins.map((checkin) => (
                          <div key={checkin.id} className="aspect-square rounded-lg overflow-hidden relative group">
                            <img
                              src={checkin.photo_url}
                              alt="Check-in"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="absolute bottom-1 left-1 right-1">
                                <p className="text-[10px] text-white font-medium truncate">
                                  {checkin.display_name}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
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
                <div className="space-y-1.5">
                  {loadingParticipants ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
                    ))
                  ) : participants.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">Nenhum participante ainda</p>
                  ) : (
                    participants
                      .sort((a, b) => b.current_progress - a.current_progress)
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

        {/* Action Buttons */}
        <div className="p-4 border-t border-border flex gap-2">
          {selectedChallenge.is_joined && !isEnded ? (
            <>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex-1 btn-accent py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Fazer Check-in
              </button>
              <button
                onClick={() => handleLeave(selectedChallenge.id)}
                className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                Sair
              </button>
            </>
          ) : !isEnded ? (
            <button
              onClick={() => handleJoin(selectedChallenge)}
              className="flex-1 btn-primary py-2.5 rounded-lg text-sm font-medium"
            >
              Participar do Desafio
            </button>
          ) : (
            <div className="flex-1 text-center py-2.5 text-muted-foreground text-sm">
              Desafio encerrado
            </div>
          )}
        </div>
      </div>
    );
  };

  // Empty State Component
  const EmptyState = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
    <div className="text-center py-12">
      <Icon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
      <h3 className="text-sm font-medium text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader icon={Dumbbell} title="GymRats" description="Desafios fitness com a comunidade" />
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded-lg" />
          <div className="h-48 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader icon={Dumbbell} title="GymRats" description="Desafios fitness com a comunidade">
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Criar Desafio
        </button>
      </PageHeader>

      <Tabs defaultValue="my" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my" className="flex items-center gap-2">
            <Flame className="w-4 h-4" />
            <span className="hidden sm:inline">Meus Desafios</span>
            <span className="sm:hidden">Meus</span>
            {myChallenges.length > 0 && (
              <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 rounded-full">
                {myChallenges.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="discover" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Descobrir</span>
            <span className="sm:hidden">Descobrir</span>
          </TabsTrigger>
          <TabsTrigger value="ended" className="flex items-center gap-2">
            <Archive className="w-4 h-4" />
            <span className="hidden sm:inline">Encerrados</span>
            <span className="sm:hidden">Encerrados</span>
          </TabsTrigger>
        </TabsList>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Challenge List */}
          <div className="space-y-4">
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
              <div className="glass-card p-8 text-center">
                <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
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
              <Camera className="w-5 h-5" />
              Novo Check-in
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {previewUrl ? (
              <div className="relative aspect-square rounded-xl overflow-hidden">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-border cursor-pointer hover:bg-muted/30 transition-colors">
                <Camera className="w-10 h-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Toque para tirar foto</p>
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
            />

            <button
              onClick={handleUploadCheckin}
              disabled={!selectedFile || uploadLoading}
              className="w-full btn-primary py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadLoading ? "Enviando..." : "Enviar Check-in 🔥"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Challenge Modal */}
      <CreateChallengeModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={async (input) => {
          const { createChallenge } = useSupabaseChallengesRef;
          return createChallenge(input);
        }}
      />
    </div>
  );
};

export default GymRats;

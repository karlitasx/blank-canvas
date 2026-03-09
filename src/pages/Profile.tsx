import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useActivityHistory } from "@/hooks/useActivityHistory";
import { useAchievementsContext } from "@/contexts/AchievementsContext";
import { useThemeContext } from "@/contexts/ThemeContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Camera, 
  Trophy, 
  Target, 
  DollarSign, 
  Flame, 
  Bell, 
  Moon, 
  Globe, 
  LogOut,
  Edit3,
  Check,
  X,
  Star,
  TrendingUp,
  Heart,
  Loader2,
  Clock,
  Calendar,
  BarChart3,
  CheckCircle2,
  MessageSquare,
  Users,
  Wallet,
  CalendarDays,
  Gift,
  Crown,
  CreditCard,
  Bookmark,
  Settings,
  Activity,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import XPProgressBar from "@/components/achievements/XPProgressBar";
import { LEVEL_EMOJIS, RARITY_COLORS, RARITY_LABELS, Achievement } from "@/types/achievements";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  language: 'pt-BR' | 'en-US' | 'es';
  currency: 'BRL' | 'USD' | 'EUR';
  notifications: {
    habits: boolean;
    finances: boolean;
    achievements: boolean;
    streaks: boolean;
    community: boolean;
  };
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const { 
    profile, 
    stats: dbStats, 
    isLoading, 
    isUploading, 
    displayName, 
    getInitials, 
    updateProfile, 
    uploadAvatar 
  } = useProfile();
  const { state, getUnlockedCount, getTotalCount } = useAchievementsContext();
  const { activities, detailedStats, isLoading: isLoadingActivity } = useActivityHistory();
  const { theme, setTheme } = useThemeContext();
  const { currency, language, setCurrency, setLanguage, t } = usePreferences();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('vidaflow_preferences');
    return saved ? JSON.parse(saved) : {
      theme: 'dark',
      language: 'pt-BR',
      currency: 'BRL',
      notifications: {
        habits: true,
        finances: true,
        achievements: true,
        streaks: true,
        community: true
      }
    };
  });

  // Get level info from state
  const currentLevel = state.level;
  const totalPoints = dbStats?.total_points || state.totalPoints;
  const levelProgress = state.levelProgress;

  // Computed stats
  const achievementsUnlocked = getUnlockedCount();
  const totalAchievements = getTotalCount();
  const currentStreak = dbStats?.current_streak || 0;
  const longestStreak = dbStats?.longest_streak || 0;
  const habitsCompleted = dbStats?.habits_completed || 0;
  const memberSince = user?.created_at 
    ? format(new Date(user.created_at), "MMMM 'de' yyyy", { locale: ptBR })
    : 'recentemente';

  // Update edited name when profile loads
  useEffect(() => {
    if (displayName) {
      setEditedName(displayName);
    }
  }, [displayName]);

  // Save preferences
  useEffect(() => {
    localStorage.setItem('vidaflow_preferences', JSON.stringify(preferences));
  }, [preferences]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
  };

  const handleSaveName = async () => {
    if (editedName.trim()) {
      await updateProfile({ display_name: editedName.trim() });
      setIsEditingName(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success(t('profile.goodbye'));
  };

  const updateNotificationPreference = (key: keyof UserPreferences['notifications'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
    toast.success(t('profile.preferenceSaved'));
  };

  const ProfileStatCard = ({ icon: Icon, label, value, subValue }: { 
    icon: React.ElementType; 
    label: string; 
    value: string | number; 
    subValue?: string;
  }) => (
    <div className="bg-card border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xl font-semibold text-foreground truncate">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {subValue && <p className="text-xs text-accent">{subValue}</p>}
        </div>
      </div>
    </div>
  );

  // Achievements Grid Component for Profile
  const ProfileAchievementsGrid = () => {
    const { getAllAchievements, getAchievementProgress } = useAchievementsContext();
    const achievements = getAllAchievements();
    const [selectedAchievement, setSelectedAchievement] = useState<(typeof achievements)[0] | null>(null);
    
    // Show first 6 achievements, prioritizing unlocked ones
    const sortedAchievements = [...achievements].sort((a, b) => {
      if (a.isUnlocked && !b.isUnlocked) return -1;
      if (!a.isUnlocked && b.isUnlocked) return 1;
      return 0;
    }).slice(0, 6);

    const getCategoryLabel = (category: string) => {
      const labels: Record<string, string> = {
        habits: 'Hábitos',
        streaks: 'Streaks',
        finance: 'Finanças',
        selfcare: 'Autocuidado',
        community: 'Comunidade',
        routine: 'Rotina',
        special: 'Especial',
      };
      return labels[category] || category;
    };

    return (
      <>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {sortedAchievements.map((achievement) => (
            <div
              key={achievement.id}
              onClick={() => setSelectedAchievement(achievement)}
              className={cn(
                "relative p-3 rounded-xl border transition-all cursor-pointer",
                achievement.isUnlocked
                  ? "bg-card border-primary/30 hover:shadow-md hover:scale-[1.02]"
                  : "bg-muted/30 border-muted/20 opacity-60 hover:opacity-80"
              )}
            >
              {/* Rarity Badge */}
              <div 
                className={cn(
                  "absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                  achievement.isUnlocked 
                    ? `bg-gradient-to-r ${RARITY_COLORS[achievement.rarity]} text-white` 
                    : "bg-muted text-muted-foreground"
                )}
              >
                {RARITY_LABELS[achievement.rarity]}
              </div>

              <div className="flex flex-col items-center text-center">
                <div 
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-2",
                    achievement.isUnlocked 
                      ? `bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]}` 
                      : "bg-muted"
                  )}
                >
                  {achievement.isUnlocked ? achievement.emoji : <Lock className="w-5 h-5 text-muted-foreground" />}
                </div>
                <p className={cn(
                  "text-xs font-semibold line-clamp-1",
                  achievement.isUnlocked ? "text-foreground" : "text-muted-foreground"
                )}>
                  {achievement.name}
                </p>
                {achievement.isUnlocked ? (
                  <p className="text-[10px] text-accent font-medium mt-1">+{achievement.points} pts</p>
                ) : (
                  <div className="w-full mt-1">
                    <Progress value={getAchievementProgress(achievement.id)} className="h-1" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Achievement Detail Dialog */}
        <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
          <DialogContent className="sm:max-w-md">
            {selectedAchievement && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div 
                      className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center text-3xl",
                        selectedAchievement.isUnlocked 
                          ? `bg-gradient-to-br ${RARITY_COLORS[selectedAchievement.rarity]}` 
                          : "bg-muted"
                      )}
                    >
                      {selectedAchievement.isUnlocked ? selectedAchievement.emoji : <Lock className="w-6 h-6 text-muted-foreground" />}
                    </div>
                    <div>
                      <span className="text-foreground">{selectedAchievement.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span 
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                            `bg-gradient-to-r ${RARITY_COLORS[selectedAchievement.rarity]} text-white`
                          )}
                        >
                          {RARITY_LABELS[selectedAchievement.rarity]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {getCategoryLabel(selectedAchievement.category)}
                        </span>
                      </div>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">
                    {selectedAchievement.description}
                  </p>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium">Recompensa</span>
                    </div>
                    <span className="text-sm font-bold text-accent">+{selectedAchievement.points} pts</span>
                  </div>
                  
                  {selectedAchievement.isUnlocked ? (
                    <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg border border-success/30">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <div>
                        <p className="text-sm font-medium text-success">Conquistada!</p>
                        {selectedAchievement.unlockedAt && (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(selectedAchievement.unlockedAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">{getAchievementProgress(selectedAchievement.id)}%</span>
                      </div>
                      <Progress value={getAchievementProgress(selectedAchievement.id)} className="h-2" />
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout activeNav="/profile">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeNav="/profile">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Profile Header */}
        <Card className="bg-card border-border overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-primary/80 to-secondary/80" />
          <CardContent className="relative pt-0 pb-6">
            {/* Avatar */}
            <div className="absolute -top-10 left-6">
              <div className="relative group">
                <Avatar className="w-20 h-20 border-4 border-card shadow-lg">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute inset-0 flex items-center justify-center bg-background/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 text-foreground animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-foreground" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>
            {/* Upload button visible on mobile */}
            <label className="absolute -top-2 left-[72px] bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer shadow-md hover:bg-primary/90 transition-colors md:hidden">
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarChange}
                className="hidden"
                disabled={isUploading}
              />
            </label>

            {/* User Info */}
            <div className="ml-28 pt-2">
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="h-8 w-48 bg-muted border-border"
                      autoFocus
                    />
                    <Button size="icon" variant="ghost" onClick={handleSaveName} className="h-8 w-8">
                      <Check className="w-4 h-4 text-success" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setIsEditingName(false)} className="h-8 w-8">
                      <X className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-xl font-semibold text-foreground">{displayName}</h1>
                    <Button size="icon" variant="ghost" onClick={() => setIsEditingName(true)} className="h-8 w-8">
                      <Edit3 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </>
                )}
              </div>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Membra desde {memberSince}</span>
              </div>
              
              {/* Subscription Badge */}
              <div className="mt-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary to-accent text-white text-sm font-medium shadow-md">
                  <Crown className="w-4 h-4" />
                  Período de teste
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* XP Progress */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <XPProgressBar 
              currentPoints={totalPoints} 
              level={currentLevel}
              levelProgress={levelProgress}
            />
          </CardContent>
        </Card>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col items-center gap-2 bg-card hover:bg-muted border-border"
          >
            <CreditCard className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium">Assinatura</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col items-center gap-2 bg-card hover:bg-muted border-border"
          >
            <Trophy className="w-5 h-5 text-accent" />
            <span className="text-xs font-medium">Conquistas</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col items-center gap-2 bg-card hover:bg-muted border-border"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs font-medium">Config</span>
          </Button>
        </div>

        {/* Social Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">0</p>
              <p className="text-sm text-muted-foreground">Grupos</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-accent" />
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">0</p>
              <p className="text-sm text-muted-foreground">Curtidas recebidas</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="stats" className="space-y-4">
          <TabsList className="bg-card border border-border p-1 w-full">
            <TabsTrigger value="stats" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">
              <BarChart3 className="w-4 h-4 mr-1" />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">
              <Activity className="w-4 h-4 mr-1" />
              Atividades
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">
              <Settings className="w-4 h-4 mr-1" />
              Config
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">
              <Bell className="w-4 h-4 mr-1" />
              Notificações
            </TabsTrigger>
          </TabsList>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <ProfileStatCard 
                icon={Target} 
                label={t('profile.habitsCompleted')}
                value={habitsCompleted}
              />
              <ProfileStatCard 
                icon={Flame} 
                label={t('profile.currentStreak')}
                value={`${currentStreak} ${t('dashboard.days')}`}
                subValue={longestStreak > 0 ? `${t('profile.record')}: ${longestStreak} ${t('dashboard.days')}` : undefined}
              />
              <ProfileStatCard 
                icon={Trophy} 
                label={t('profile.achievements')}
                value={`${achievementsUnlocked}/${totalAchievements}`}
              />
              <ProfileStatCard 
                icon={Star} 
                label={t('profile.totalXP')}
                value={totalPoints.toLocaleString()}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Progresso de Hábitos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total completados</span>
                    <span className="font-medium">{habitsCompleted}</span>
                  </div>
                  <Progress value={Math.min((habitsCompleted / 100) * 100, 100)} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Continue completando hábitos para subir de nível!
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-accent" />
                    Conquistas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Desbloqueadas</span>
                    <span className="font-medium">{achievementsUnlocked} de {totalAchievements}</span>
                  </div>
                  <Progress value={totalAchievements > 0 ? (achievementsUnlocked / totalAchievements) * 100 : 0} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Complete ações para desbloquear conquistas!
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Achievements Gallery */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-accent" />
                  Minhas Conquistas
                </CardTitle>
                <p className="text-xs text-muted-foreground">{achievementsUnlocked} desbloqueadas de {totalAchievements}</p>
              </CardHeader>
              <CardContent>
                <ProfileAchievementsGrid />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab - History + Stats */}
          <TabsContent value="activity" className="space-y-4 animate-fade-in">
            {/* Detailed Stats */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Estatísticas Detalhadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border">
                  {[
                    { label: "Total de curtidas", value: detailedStats.totalLikes, icon: Heart },
                    { label: "Posts criados", value: detailedStats.postsCreated, icon: MessageSquare },
                    { label: "Comentários feitos", value: detailedStats.commentsMade, icon: MessageSquare },
                    { label: "Desafios participando", value: detailedStats.challengesJoined, icon: Trophy },
                    { label: "Conexões", value: detailedStats.connections, icon: Users },
                    { label: "Transações registradas", value: detailedStats.transactionsLogged, icon: Wallet },
                    { label: "Eventos criados", value: detailedStats.eventsCreated, icon: CalendarDays },
                    { label: "Itens na wishlist", value: detailedStats.wishlistItems, icon: Gift },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <stat.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{stat.label}</span>
                      </div>
                      <span className="text-sm font-bold text-foreground">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity History */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Histórico de Atividades
                </CardTitle>
                <p className="text-sm text-muted-foreground">Todas suas ações na plataforma</p>
              </CardHeader>
              <CardContent>
                {isLoadingActivity ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Nenhuma atividade registrada ainda</p>
                    <p className="text-muted-foreground/60 text-xs mt-1">Suas ações aparecerão aqui</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activities.slice(0, 20).map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-lg">
                          {activity.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{activity.title}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(activity.timestamp), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {format(new Date(activity.timestamp), "HH:mm")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="settings" className="animate-fade-in space-y-4">
            {/* Bio & Interests Card */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">{t('profile.publicProfile')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('profile.bio')}</label>
                  <textarea
                    value={profile?.bio || ""}
                    onChange={(e) => updateProfile({ bio: e.target.value } as any)}
                    placeholder={t('profile.bioPlaceholder')}
                    className="w-full min-h-[80px] p-3 rounded-lg bg-muted border border-border text-foreground text-sm resize-none"
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {(profile?.bio || "").length}/200 {t('profile.characters')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('profile.interests')}</label>
                  <input
                    type="text"
                    placeholder={t('profile.interestsPlaceholder')}
                    defaultValue={(profile?.interests || []).join(", ")}
                    onBlur={(e) => {
                      const interests = e.target.value.split(",").map(i => i.trim()).filter(Boolean);
                      updateProfile({ interests } as any);
                    }}
                    className="w-full p-3 rounded-lg bg-muted border border-border text-foreground text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('profile.interestsHelp')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Preferences Card */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">{t('profile.preferences')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Moon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t('profile.theme')}</p>
                        <p className="text-xs text-muted-foreground">{t('profile.themeDesc')}</p>
                      </div>
                    </div>
                    <select 
                      value={theme}
                      onChange={(e) => {
                        const newTheme = e.target.value as 'dark' | 'light' | 'system';
                        setTheme(newTheme);
                        setPreferences(p => ({ ...p, theme: newTheme }));
                        toast.success(t('profile.themeUpdated'));
                      }}
                      className="bg-muted border border-border text-foreground px-3 py-1.5 rounded-md text-sm"
                    >
                      <option value="dark">{t('profile.themeDark')}</option>
                      <option value="light">{t('profile.themeLight')}</option>
                      <option value="system">{t('profile.themeSystem')}</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Globe className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t('profile.language')}</p>
                        <p className="text-xs text-muted-foreground">{t('profile.languageDesc')}</p>
                      </div>
                    </div>
                    <select 
                      value={language}
                      onChange={(e) => {
                        const newLang = e.target.value as 'pt-BR' | 'en-US' | 'es';
                        setLanguage(newLang);
                        setPreferences(p => ({ ...p, language: newLang }));
                        updateProfile({ language: newLang });
                      }}
                      className="bg-muted border border-border text-foreground px-3 py-1.5 rounded-md text-sm"
                    >
                      <option value="pt-BR">Português (BR)</option>
                      <option value="en-US">English (US)</option>
                      <option value="es">Español</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-success" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t('profile.currency')}</p>
                        <p className="text-xs text-muted-foreground">{t('profile.currencyDesc')}</p>
                      </div>
                    </div>
                    <select 
                      value={currency}
                      onChange={(e) => {
                        const newCurrency = e.target.value as 'BRL' | 'USD' | 'EUR';
                        setCurrency(newCurrency);
                        setPreferences(p => ({ ...p, currency: newCurrency }));
                        updateProfile({ currency: newCurrency });
                      }}
                      className="bg-muted border border-border text-foreground px-3 py-1.5 rounded-md text-sm"
                    >
                      <option value="BRL">R$ (BRL)</option>
                      <option value="USD">$ (USD)</option>
                      <option value="EUR">€ (EUR)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('profile.logout')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="animate-fade-in">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Target className="w-4 h-4 text-accent" />
                    <div>
                      <p className="text-sm font-medium">Lembretes de Hábitos</p>
                      <p className="text-xs text-muted-foreground">Receber lembretes</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.notifications.habits}
                    onCheckedChange={(v) => updateNotificationPreference('habits', v)}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4 text-success" />
                    <div>
                      <p className="text-sm font-medium">Alertas Financeiros</p>
                      <p className="text-xs text-muted-foreground">Gastos e metas</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.notifications.finances}
                    onCheckedChange={(v) => updateNotificationPreference('finances', v)}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-4 h-4 text-warning" />
                    <div>
                      <p className="text-sm font-medium">Conquistas</p>
                      <p className="text-xs text-muted-foreground">Novas conquistas</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.notifications.achievements}
                    onCheckedChange={(v) => updateNotificationPreference('achievements', v)}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Flame className="w-4 h-4 text-destructive" />
                    <div>
                      <p className="text-sm font-medium">Streaks em Risco</p>
                      <p className="text-xs text-muted-foreground">Aviso de streak</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.notifications.streaks}
                    onCheckedChange={(v) => updateNotificationPreference('streaks', v)}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Comunidade</p>
                      <p className="text-xs text-muted-foreground">Grupos e desafios</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.notifications.community}
                    onCheckedChange={(v) => updateNotificationPreference('community', v)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Profile;

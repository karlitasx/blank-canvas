import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Flame, Target, Calendar, Lock, User, Users } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BadgeDisplay } from "@/components/achievements/BadgeDisplay";
import { FollowButton } from "@/components/social/FollowButton";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { useAuth } from "@/hooks/useAuth";
import { LEVEL_EMOJIS, LEVEL_COLORS, UserLevel, RARITY_COLORS, RARITY_LABELS } from "@/types/achievements";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const PublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading, error, getLevelProgress } = usePublicProfile(userId);

  // Redirect to own profile if viewing self
  if (user && userId === user.id) {
    navigate("/profile", { replace: true });
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout activeNav="">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout activeNav="">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Card className="text-center py-12">
            <CardContent>
              <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Usuário não encontrado</h2>
              <p className="text-muted-foreground">
                {error || "Este perfil não existe ou não está disponível."}
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const { profile, stats, achievements, achievementCount } = data;
  const level = (stats?.level || "Novata") as UserLevel;
  const levelProgress = getLevelProgress();

  const memberSince = formatDistanceToNow(new Date(profile.created_at), {
    addSuffix: false,
    locale: ptBR,
  });

  return (
    <DashboardLayout activeNav="">
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Back button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {/* Profile Header */}
        <Card className="mb-6 overflow-hidden">
          {/* Level gradient banner */}
          <div className={cn("h-24 bg-gradient-to-r", LEVEL_COLORS[level])} />
          
          <CardContent className="relative pt-0 pb-6">
            {/* Avatar */}
            <div className="absolute -top-12 left-6">
              <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-3xl bg-muted">
                  {profile.display_name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Profile info */}
            <div className="pt-14 pl-2">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {profile.display_name || "Usuário"}
                  </h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="secondary" className="gap-1">
                      {LEVEL_EMOJIS[level]} {level}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Membro há {memberSince}
                    </span>
                  </div>
                  
                  {/* Follower stats */}
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold text-foreground">
                        {profile.followers_count || 0}
                      </span>
                      <span className="text-muted-foreground">seguidores</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">
                        {profile.following_count || 0}
                      </span>
                      <span className="text-muted-foreground ml-1">seguindo</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Follow button */}
                  {userId && <FollowButton targetUserId={userId} />}
                  
                  {/* Top badges */}
                  {profile.show_achievements && achievements.length > 0 && (
                    <div className="hidden sm:block">
                      <BadgeDisplay achievements={achievements.slice(0, 5)} size="md" />
                    </div>
                  )}
                </div>
              </div>

              {/* Level progress */}
              {stats && (
                <div className="mt-4 max-w-md">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Progresso do nível</span>
                    <span className="font-medium">{stats.total_points} pts</span>
                  </div>
                  <Progress value={levelProgress} className="h-2" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-accent" />
                <p className="text-2xl font-bold text-foreground">{stats.total_points}</p>
                <p className="text-xs text-muted-foreground">Pontos Totais</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Flame className="w-8 h-8 mx-auto mb-2 text-destructive" />
                <p className="text-2xl font-bold text-foreground">{stats.current_streak}</p>
                <p className="text-xs text-muted-foreground">Streak Atual</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-foreground">{stats.habits_completed}</p>
                <p className="text-xs text-muted-foreground">Hábitos Feitos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-foreground">{stats.longest_streak}</p>
                <p className="text-xs text-muted-foreground">Melhor Streak</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Achievements Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Conquistas ({achievementCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!profile.show_achievements ? (
              <div className="text-center py-8">
                <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Este usuário optou por manter suas conquistas privadas.
                </p>
              </div>
            ) : achievements.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhuma conquista desbloqueada ainda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="p-4 rounded-xl bg-muted/50 text-center hover:bg-muted transition-colors"
                  >
                    <div
                      className={cn(
                        "w-14 h-14 mx-auto rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br mb-2",
                        RARITY_COLORS[achievement.rarity]
                      )}
                    >
                      {achievement.emoji}
                    </div>
                    <p className="font-medium text-sm text-foreground truncate">
                      {achievement.name}
                    </p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {RARITY_LABELS[achievement.rarity]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PublicProfile;

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Trophy, Flame, Target, Calendar, Lock, User, Users,
  MessageSquare, Heart, Sparkles, UserPlus
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeDisplay } from "@/components/achievements/BadgeDisplay";
import { FollowButton } from "@/components/social/FollowButton";
import { usePublicProfile, PublicFollowUser } from "@/hooks/usePublicProfile";
import { useAuth } from "@/hooks/useAuth";
import { useConnections } from "@/hooks/useConnections";
import { LEVEL_EMOJIS, LEVEL_COLORS, UserLevel, RARITY_COLORS, RARITY_LABELS } from "@/types/achievements";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const PublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading, error, getLevelProgress } = usePublicProfile(userId);
  const { connect } = useConnections();
  const [activeTab, setActiveTab] = useState("sobre");

  // Redirect to own profile if viewing self
  if (user && userId === user.id) {
    navigate("/profile", { replace: true });
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout activeNav="">
        <div className="max-w-4xl mx-auto space-y-6 p-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout activeNav="">
        <div className="max-w-4xl mx-auto p-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <Card className="text-center py-12 rounded-2xl">
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

  const { profile, stats, achievements, achievementCount, posts, followers, following } = data;
  const level = (stats?.level || "Novata") as UserLevel;
  const levelProgress = getLevelProgress();

  const memberSince = formatDistanceToNow(new Date(profile.created_at), {
    addSuffix: false,
    locale: ptBR,
  });

  const handleConnect = async () => {
    if (!userId) return;
    await connect(userId, "friendship");
  };

  return (
    <DashboardLayout activeNav="">
      <div className="max-w-4xl mx-auto animate-fade-in p-4">
        {/* Back button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>

        {/* Profile Header Card */}
        <Card className="mb-6 overflow-hidden rounded-2xl border-border/50">
          {/* Banner gradient */}
          <div className={cn("h-28 sm:h-36 bg-gradient-to-br relative", LEVEL_COLORS[level])}>
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
          </div>

          <CardContent className="relative pt-0 pb-6 px-4 sm:px-6">
            {/* Avatar */}
            <div className="absolute -top-14 left-4 sm:left-6">
              <Avatar className="w-28 h-28 border-4 border-card shadow-2xl">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-4xl bg-muted font-bold">
                  {profile.display_name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Profile info */}
            <div className="pt-16 sm:pt-16">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
                    {profile.display_name || "Usuário"}
                  </h1>

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge className={cn("gap-1 text-xs font-bold bg-gradient-to-r text-primary-foreground border-0", LEVEL_COLORS[level])}>
                      {LEVEL_EMOJIS[level]} {level}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Membro há {memberSince}
                    </span>
                  </div>

                  {profile.bio && (
                    <p className="text-sm text-muted-foreground mt-3 max-w-lg leading-relaxed">
                      {profile.bio}
                    </p>
                  )}

                  {/* Interests */}
                  {profile.interests && profile.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {profile.interests.map((interest, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-muted/50 border-border/50">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Follower stats */}
                  <div className="flex items-center gap-5 mt-4 text-sm">
                    <button
                      onClick={() => setActiveTab("conexoes")}
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                    >
                      <span className="font-bold text-foreground">{profile.followers_count || 0}</span>
                      <span className="text-muted-foreground">seguidores</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("conexoes")}
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                    >
                      <span className="font-bold text-foreground">{profile.following_count || 0}</span>
                      <span className="text-muted-foreground">seguindo</span>
                    </button>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {userId && <FollowButton targetUserId={userId} />}
                  {userId && user && (
                    <Button variant="outline" size="default" onClick={handleConnect} className="gap-2">
                      <UserPlus className="w-4 h-4" />
                      Conectar
                    </Button>
                  )}
                </div>
              </div>

              {/* Level progress */}
              {stats && (
                <div className="mt-5 max-w-md">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground font-medium">Progresso do nível</span>
                    <span className="font-bold text-foreground">{stats.total_points} XP</span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700 bg-gradient-to-r", LEVEL_COLORS[level])}
                      style={{ width: `${levelProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { icon: Trophy, label: "Pontos", value: stats.total_points, color: "text-accent" },
              { icon: Flame, label: "Streak Atual", value: stats.current_streak, color: "text-destructive" },
              { icon: Target, label: "Hábitos Feitos", value: stats.habits_completed, color: "text-primary" },
              { icon: Calendar, label: "Melhor Streak", value: stats.longest_streak, color: "text-secondary" },
            ].map((stat) => (
              <Card key={stat.label} className="rounded-xl border-border/50">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-muted/50">
                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full grid grid-cols-4 h-11 rounded-xl bg-muted/50">
            <TabsTrigger value="sobre" className="rounded-lg text-xs sm:text-sm gap-1.5">
              <User className="w-3.5 h-3.5 hidden sm:block" />
              Sobre
            </TabsTrigger>
            <TabsTrigger value="atividades" className="rounded-lg text-xs sm:text-sm gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 hidden sm:block" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="conquistas" className="rounded-lg text-xs sm:text-sm gap-1.5">
              <Trophy className="w-3.5 h-3.5 hidden sm:block" />
              Conquistas
            </TabsTrigger>
            <TabsTrigger value="conexoes" className="rounded-lg text-xs sm:text-sm gap-1.5">
              <Users className="w-3.5 h-3.5 hidden sm:block" />
              Conexões
            </TabsTrigger>
          </TabsList>

          {/* Sobre Tab */}
          <TabsContent value="sobre">
            <Card className="rounded-2xl border-border/50">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    Sobre
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {profile.bio || "Este usuário ainda não adicionou uma bio."}
                  </p>
                </div>

                {profile.interests && profile.interests.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Interesses</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest, i) => (
                        <Badge key={i} variant="secondary" className="rounded-full px-3 py-1">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.show_achievements && achievements.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Conquistas em Destaque</h3>
                    <BadgeDisplay achievements={achievements.slice(0, 8)} size="lg" maxDisplay={8} />
                  </div>
                )}

                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    Membro há {memberSince} • {profile.followers_count} seguidores
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="atividades">
            <div className="space-y-3">
              {posts.length === 0 ? (
                <Card className="rounded-2xl border-border/50">
                  <CardContent className="text-center py-12">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Nenhum post público ainda.</p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className="rounded-xl border-border/50 hover:bg-muted/20 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-9 h-9 shrink-0">
                          <AvatarImage src={profile.avatar_url || undefined} />
                          <AvatarFallback className="text-sm bg-muted">
                            {profile.display_name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-foreground">
                              {profile.display_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(post.created_at), "dd MMM", { locale: ptBR })}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                            {post.emoji && <span className="mr-1">{post.emoji}</span>}
                            {post.content}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3.5 h-3.5" />
                              {post.likes_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5" />
                              {post.comments_count}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Conquistas Tab */}
          <TabsContent value="conquistas">
            <Card className="rounded-2xl border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="w-5 h-5 text-accent" />
                  Conquistas ({achievementCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!profile.show_achievements ? (
                  <div className="text-center py-10">
                    <Lock className="w-14 h-14 mx-auto mb-4 text-muted-foreground/40" />
                    <p className="text-muted-foreground font-medium">Conquistas privadas</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Este usuário optou por manter suas conquistas privadas.
                    </p>
                  </div>
                ) : achievements.length === 0 ? (
                  <div className="text-center py-10">
                    <Trophy className="w-14 h-14 mx-auto mb-4 text-muted-foreground/40" />
                    <p className="text-muted-foreground">Nenhuma conquista desbloqueada ainda.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="group p-4 rounded-xl bg-muted/30 text-center hover:bg-muted/50 transition-all hover:scale-[1.02] cursor-default"
                      >
                        <div
                          className={cn(
                            "w-14 h-14 mx-auto rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br mb-2.5 shadow-lg transition-transform group-hover:scale-110",
                            RARITY_COLORS[achievement.rarity]
                          )}
                        >
                          {achievement.emoji}
                        </div>
                        <p className="font-semibold text-sm text-foreground truncate">
                          {achievement.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                          {achievement.description}
                        </p>
                        <Badge variant="outline" className="mt-2 text-[10px] px-2 py-0">
                          {RARITY_LABELS[achievement.rarity]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conexões Tab */}
          <TabsContent value="conexoes">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Seguidores */}
              <Card className="rounded-2xl border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Seguidores ({followers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {followers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Nenhum seguidor ainda.</p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
                      {followers.map((u) => (
                        <UserRow key={u.user_id} user={u} navigate={navigate} currentUserId={user?.id} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Seguindo */}
              <Card className="rounded-2xl border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-secondary" />
                    Seguindo ({following.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {following.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Não segue ninguém ainda.</p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
                      {following.map((u) => (
                        <UserRow key={u.user_id} user={u} navigate={navigate} currentUserId={user?.id} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

// Sub-component for user rows in connections tab
const UserRow = ({
  user: u,
  navigate,
  currentUserId,
}: {
  user: PublicFollowUser;
  navigate: (path: string) => void;
  currentUserId?: string;
}) => {
  const isMe = currentUserId === u.user_id;

  return (
    <div
      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group"
      onClick={() => {
        if (isMe) {
          navigate("/profile");
        } else {
          navigate(`/user/${u.user_id}`);
        }
      }}
    >
      <Avatar className="w-9 h-9">
        <AvatarImage src={u.avatar_url || undefined} />
        <AvatarFallback className="text-xs bg-muted">
          {u.display_name?.charAt(0).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {u.display_name || "Usuário"}
          {isMe && <span className="text-xs text-muted-foreground ml-1">(você)</span>}
        </p>
      </div>
      {!isMe && (
        <FollowButton targetUserId={u.user_id} size="sm" variant="outline" />
      )}
    </div>
  );
};

export default PublicProfile;

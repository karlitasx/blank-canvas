import { useState } from "react";
import { Trophy, Users, Plus, MessageCircle, Target, Flame, MessageSquare, Sparkles, Hand } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSocial } from "@/hooks/useSocial";
import { useAchievementsContext } from "@/contexts/AchievementsContext";
import { useSupabaseChallenges } from "@/hooks/useSupabaseChallenges";
import { useSupabasePosts } from "@/hooks/useSupabasePosts";
import { useAchievementSharing } from "@/hooks/useAchievementSharing";
import { useProfile } from "@/hooks/useProfile";
import XPProgressBar from "@/components/achievements/XPProgressBar";
import ChallengeCard from "@/components/challenges/ChallengeCard";
import CreateChallengeModal from "@/components/challenges/CreateChallengeModal";
import ChallengeLeaderboard from "@/components/challenges/ChallengeLeaderboard";
import GlobalRanking from "@/components/community/GlobalRanking";
import { SocialFeed } from "@/components/social/SocialFeed";
import { ConnectionsTab } from "@/components/social/ConnectionsTab";
import IntroductionsTab from "@/components/community/IntroductionsTab";
import GroupsTab from "@/components/community/GroupsTab";
import { Challenge } from "@/types/challenges";
import { Skeleton } from "@/components/ui/skeleton";

const Community = () => {
  const [activeTab, setActiveTab] = useState("introductions");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [feedFilter, setFeedFilter] = useState<"all" | "following">("all");
  
  const { groups, getFilteredRanking, getUserPosition } = useSocial();
  const { state } = useAchievementsContext();
  const { profile } = useProfile();
  const { 
    challenges, 
    loading: challengesLoading, 
    createChallenge, 
    joinChallenge, 
    leaveChallenge,
    getActiveChallenges,
    getAvailableChallenges,
  } = useSupabaseChallenges();

  const {
    posts,
    loading: postsLoading,
    createPost,
    deletePost,
    toggleLike,
    refetch: refetchPosts,
  } = useSupabasePosts(feedFilter === "following");

  const {
    shares: achievementShares,
    loading: sharesLoading,
    getAchievementById,
  } = useAchievementSharing();
  

  const activeChallenges = getActiveChallenges();
  const availableChallenges = getAvailableChallenges();

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "agora";
    if (hours < 24) return `${hours}h atrás`;
    return `${Math.floor(hours / 24)}d atrás`;
  };

  const handleViewLeaderboard = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setShowLeaderboard(true);
  };

  return (
    <DashboardLayout activeNav="/community">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 animate-fade-in">
          <div className="p-3 rounded-xl bg-primary">
            <Trophy className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Comunidade</h1>
            <p className="text-sm text-muted-foreground">Desafios, ranking e grupos</p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mb-6 animate-slide-up">
          <XPProgressBar 
            currentPoints={state.totalPoints} 
            level={state.level} 
            levelProgress={state.levelProgress} 
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full overflow-x-auto no-scrollbar mb-6 bg-muted gap-0">
            <TabsTrigger value="introductions" className="flex-shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm px-2.5 sm:px-4">
              <Hand className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Apresente-se</span>
            </TabsTrigger>
            <TabsTrigger value="feed" className="flex-shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm px-2.5 sm:px-4">
              <MessageSquare className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Feed</span>
            </TabsTrigger>
            <TabsTrigger value="connections" className="flex-shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm px-2.5 sm:px-4">
              <Sparkles className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Conexões</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex-shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm px-2.5 sm:px-4">
              <Target className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Desafios</span>
            </TabsTrigger>
            <TabsTrigger value="ranking" className="flex-shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm px-2.5 sm:px-4">
              <Trophy className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Ranking</span>
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex-shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm px-2.5 sm:px-4">
              <Users className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Grupos</span>
            </TabsTrigger>
          </TabsList>

          {/* Introductions Tab */}
          <TabsContent value="introductions" className="animate-fade-in">
            <IntroductionsTab />
          </TabsContent>

          {/* Feed Tab */}
          <TabsContent value="feed" className="animate-fade-in">
            <SocialFeed
              posts={posts}
              achievementShares={feedFilter === "all" ? achievementShares : []}
              getAchievementById={getAchievementById}
              loading={postsLoading || sharesLoading}
              onCreatePost={async (content, emoji) => {
                const result = await createPost({ content, emoji });
                return !!result;
              }}
              onLikePost={toggleLike}
              onDeletePost={deletePost}
              userAvatar={profile?.avatar_url}
              userName={profile?.display_name || "Usuário"}
              showFilters={true}
              onFilterChange={(filter) => {
                setFeedFilter(filter);
              }}
            />
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections" className="animate-fade-in">
            <ConnectionsTab />
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6 animate-fade-in">
            <div className="flex justify-end">
              <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Criar Desafio
              </Button>
            </div>

            {challengesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : (
              <>
                {/* Active Challenges */}
                {activeChallenges.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Flame className="h-5 w-5 text-orange-500" />
                      Seus Desafios Ativos
                    </h3>
                    <div className="space-y-4">
                      {activeChallenges.map((challenge) => (
                        <ChallengeCard
                          key={challenge.id}
                          challenge={challenge}
                          onJoin={joinChallenge}
                          onLeave={leaveChallenge}
                          onViewLeaderboard={handleViewLeaderboard}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Challenges */}
                {availableChallenges.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Desafios Disponíveis
                    </h3>
                    <div className="space-y-4">
                      {availableChallenges.map((challenge) => (
                        <ChallengeCard
                          key={challenge.id}
                          challenge={challenge}
                          onJoin={joinChallenge}
                          onLeave={leaveChallenge}
                          onViewLeaderboard={handleViewLeaderboard}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {challenges.length === 0 && (
                  <div className="text-center py-12 bg-card rounded-xl border border-border">
                    <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Nenhum desafio ainda</h3>
                    <p className="text-muted-foreground mb-4">
                      Crie o primeiro desafio e convide amigos para participar!
                    </p>
                    <Button onClick={() => setShowCreateModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Desafio
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Ranking Tab */}
          <TabsContent value="ranking" className="animate-fade-in">
            <GlobalRanking />
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="animate-fade-in">
            <GroupsTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <CreateChallengeModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={createChallenge}
      />

      <ChallengeLeaderboard
        challenge={selectedChallenge}
        open={showLeaderboard}
        onOpenChange={setShowLeaderboard}
      />
    </DashboardLayout>
  );
};

export default Community;

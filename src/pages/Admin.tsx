import { Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminData } from "@/hooks/useAdminData";
import AdminStatsCards from "@/components/admin/AdminStatsCards";
import AdminPostsTable from "@/components/admin/AdminPostsTable";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import AdminChallengesSection from "@/components/admin/AdminChallengesSection";
import AdminAchievementsSection from "@/components/admin/AdminAchievementsSection";
import AdminEventsSection from "@/components/admin/AdminEventsSection";

const Admin = () => {
  const {
    stats,
    posts,
    users,
    challenges,
    achievements,
    publicEvents,
    loading,
    refetch,
    hidePost,
    unhidePost,
    deletePost,
    suspendUser,
    reactivateUser,
    createChallenge,
    toggleChallengeVisibility,
    createAchievement,
    toggleAchievementActive,
  } = useAdminData();

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/20">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Painel Admin</h1>
              <p className="text-sm text-muted-foreground">
                Controle e moderação do aplicativo
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        {/* Stats */}
        <AdminStatsCards stats={stats} />

        {/* Tabs */}
        <Tabs defaultValue="posts" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
            <TabsTrigger value="posts">Moderação</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="challenges">Desafios</TabsTrigger>
            <TabsTrigger value="achievements">Conquistas</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <AdminPostsTable
              posts={posts}
              onHide={hidePost}
              onUnhide={unhidePost}
              onDelete={deletePost}
            />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsersTable
              users={users}
              onSuspend={suspendUser}
              onReactivate={reactivateUser}
            />
          </TabsContent>

          <TabsContent value="challenges">
            <AdminChallengesSection
              challenges={challenges}
              onCreate={createChallenge}
              onToggleVisibility={toggleChallengeVisibility}
            />
          </TabsContent>

          <TabsContent value="achievements">
            <AdminAchievementsSection
              achievements={achievements}
              onCreate={createAchievement}
              onToggleActive={toggleAchievementActive}
            />
          </TabsContent>

          <TabsContent value="events">
            <AdminEventsSection events={publicEvents} onRefetch={refetch} />
          </TabsContent>
        </Tabs>

        {/* Back link */}
        <div className="text-center pt-4">
          <a
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar ao Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default Admin;

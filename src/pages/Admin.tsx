import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Users, FileText, Trophy, Award, BarChart3, Search,
  Ban, CheckCircle, Trash2, Eye, EyeOff, Plus, Edit, Loader2, Shield
} from "lucide-react";

// ─── Users Tab ──────────────────────────────────────────
function UsersTab() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(100);
    setProfiles(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProfiles(); }, []);

  const toggleSuspend = async (profile: any) => {
    const { error } = await supabase.from("profiles").update({ is_suspended: !profile.is_suspended }).eq("id", profile.id);
    if (error) { toast.error(error.message); return; }
    toast.success(profile.is_suspended ? "Usuário reativado" : "Usuário suspenso");
    fetchProfiles();
  };

  const filtered = profiles.filter(p =>
    (p.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.user_id || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar usuários..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map(profile => (
            <Card key={profile.id} className="glass-card border-border/30">
              <CardContent className="flex items-center gap-4 p-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile.avatar_url || ""} />
                  <AvatarFallback className="text-xs bg-muted">{(profile.display_name || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{profile.display_name || "Sem nome"}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile.user_id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={profile.is_suspended ? "destructive" : "secondary"} className="text-xs">
                    {profile.is_suspended ? "Suspenso" : "Ativo"}
                  </Badge>
                  <Button size="sm" variant={profile.is_suspended ? "default" : "destructive"} onClick={() => toggleSuspend(profile)}>
                    {profile.is_suspended ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado</p>}
        </div>
      )}
    </div>
  );
}

// ─── Posts Tab ───────────────────────────────────────────
function PostsTab() {
  const [posts, setPosts] = useState<any[]>([]);
  const [profiles, setProfilesMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(100);
    setPosts(data || []);

    const userIds = [...new Set((data || []).map(p => p.user_id))];
    if (userIds.length > 0) {
      const { data: profs } = await supabase.from("profiles").select("user_id, display_name").in("user_id", userIds);
      const map: Record<string, any> = {};
      (profs || []).forEach(p => map[p.user_id] = p);
      setProfilesMap(map);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const toggleHide = async (post: any) => {
    const { error } = await supabase.from("posts").update({ is_hidden: !post.is_hidden }).eq("id", post.id);
    if (error) { toast.error(error.message); return; }
    toast.success(post.is_hidden ? "Post visível" : "Post ocultado");
    fetchPosts();
  };

  const deletePost = async (id: string) => {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Post excluído");
    fetchPosts();
  };

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : posts.map(post => (
        <Card key={post.id} className={`glass-card border-border/30 ${post.is_hidden ? "opacity-50" : ""}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">{profiles[post.user_id]?.display_name || "Usuário"} · {new Date(post.created_at).toLocaleDateString("pt-BR")}</p>
                <p className="text-sm line-clamp-2">{post.content}</p>
                <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                  <span>❤️ {post.likes_count}</span>
                  <span>💬 {post.comments_count}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => toggleHide(post)} title={post.is_hidden ? "Mostrar" : "Ocultar"}>
                  {post.is_hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deletePost(post.id)} title="Excluir">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {!loading && posts.length === 0 && <p className="text-center py-8 text-muted-foreground">Nenhum post</p>}
    </div>
  );
}

// ─── Challenges Tab ─────────────────────────────────────
function ChallengesTab() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", description: "", emoji: "🏆", target_value: 7, challenge_type: "habits", start_date: "", end_date: "", is_public: true });

  const fetchChallenges = async () => {
    setLoading(true);
    const { data } = await supabase.from("challenges").select("*").order("created_at", { ascending: false });
    setChallenges(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchChallenges(); }, []);

  const openNew = () => {
    setEditing(null);
    const today = new Date().toISOString().split("T")[0];
    const next = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
    setForm({ title: "", description: "", emoji: "🏆", target_value: 7, challenge_type: "habits", start_date: today, end_date: next, is_public: true });
    setDialogOpen(true);
  };

  const openEdit = (c: any) => {
    setEditing(c);
    setForm({ title: c.title, description: c.description || "", emoji: c.emoji, target_value: c.target_value, challenge_type: c.challenge_type, start_date: c.start_date, end_date: c.end_date, is_public: c.is_public });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!user || !form.title.trim()) return;
    if (editing) {
      const { error } = await supabase.from("challenges").update({ ...form }).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Desafio atualizado");
    } else {
      const { error } = await supabase.from("challenges").insert({ ...form, created_by: user.id });
      if (error) { toast.error(error.message); return; }
      toast.success("Desafio criado");
    }
    setDialogOpen(false);
    fetchChallenges();
  };

  const deleteChallenge = async (id: string) => {
    const { error } = await supabase.from("challenges").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Desafio excluído");
    fetchChallenges();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-2" />Novo Desafio</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : challenges.map(c => (
        <Card key={c.id} className="glass-card border-border/30">
          <CardContent className="flex items-center gap-4 p-4">
            <span className="text-2xl">{c.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium">{c.title}</p>
              <p className="text-xs text-muted-foreground">{c.start_date} → {c.end_date} · Meta: {c.target_value}</p>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Edit className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteChallenge(c.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Desafio" : "Novo Desafio"}</DialogTitle>
            <DialogDescription>Preencha os dados do desafio</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Título</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Descrição</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Emoji</Label><Input value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} /></div>
              <div><Label>Meta</Label><Input type="number" value={form.target_value} onChange={e => setForm({ ...form, target_value: Number(e.target.value) })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Início</Label><Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} /></div>
              <div><Label>Fim</Label><Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save}>{editing ? "Salvar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Achievements Tab ───────────────────────────────────
function AchievementsTab() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "", achievement_key: "", unlock_condition: "", emoji: "🏆", xp_reward: 100, is_active: true, is_permanent: true });

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("admin_achievements").select("*").order("created_at", { ascending: false });
    setAchievements(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", description: "", achievement_key: "", unlock_condition: "", emoji: "🏆", xp_reward: 100, is_active: true, is_permanent: true });
    setDialogOpen(true);
  };

  const openEdit = (a: any) => {
    setEditing(a);
    setForm({ name: a.name, description: a.description, achievement_key: a.achievement_key, unlock_condition: a.unlock_condition, emoji: a.emoji, xp_reward: a.xp_reward, is_active: a.is_active, is_permanent: a.is_permanent });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.achievement_key.trim()) return;
    if (editing) {
      const { error } = await supabase.from("admin_achievements").update(form).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Conquista atualizada");
    } else {
      const { error } = await supabase.from("admin_achievements").insert(form);
      if (error) { toast.error(error.message); return; }
      toast.success("Conquista criada");
    }
    setDialogOpen(false);
    fetch();
  };

  const deleteAchievement = async (id: string) => {
    const { error } = await supabase.from("admin_achievements").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Conquista excluída");
    fetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-2" />Nova Conquista</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : achievements.map(a => (
        <Card key={a.id} className="glass-card border-border/30">
          <CardContent className="flex items-center gap-4 p-4">
            <span className="text-2xl">{a.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium">{a.name}</p>
              <p className="text-xs text-muted-foreground">{a.description} · {a.xp_reward} XP</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={a.is_active ? "default" : "secondary"} className="text-xs">{a.is_active ? "Ativa" : "Inativa"}</Badge>
              <Button size="icon" variant="ghost" onClick={() => openEdit(a)}><Edit className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteAchievement(a.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Stats Tab ──────────────────────────────────────────
function StatsTab() {
  const [stats, setStats] = useState({ users: 0, posts: 0, habits: 0, transactions: 0, challenges: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("posts").select("id", { count: "exact", head: true }),
      supabase.from("habits").select("id", { count: "exact", head: true }),
      supabase.from("transactions").select("id", { count: "exact", head: true }),
      supabase.from("challenges").select("id", { count: "exact", head: true }),
    ]).then(([u, p, h, t, c]) => {
      setStats({ users: u.count || 0, posts: p.count || 0, habits: h.count || 0, transactions: t.count || 0, challenges: c.count || 0 });
      setLoading(false);
    });
  }, []);

  const cards = [
    { label: "Usuários", value: stats.users, icon: Users, color: "text-primary" },
    { label: "Posts", value: stats.posts, icon: FileText, color: "text-secondary" },
    { label: "Hábitos", value: stats.habits, icon: Trophy, color: "text-accent" },
    { label: "Transações", value: stats.transactions, icon: BarChart3, color: "text-success" },
    { label: "Desafios", value: stats.challenges, icon: Award, color: "text-warning" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {loading ? (
        <div className="col-span-full flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : cards.map(c => (
        <Card key={c.label} className="glass-card border-border/30">
          <CardContent className="flex items-center gap-4 p-6">
            <c.icon className={`h-8 w-8 ${c.color}`} />
            <div>
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-sm text-muted-foreground">{c.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Main Admin Page ────────────────────────────────────
const Admin = () => {
  const { isAdmin, loading } = useAdmin();

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground text-sm">Gerencie usuários, conteúdo e configurações</p>
        </div>
      </div>

      <Tabs defaultValue="stats">
        <TabsList className="bg-muted/50 w-full justify-start overflow-x-auto">
          <TabsTrigger value="stats"><BarChart3 className="h-4 w-4 mr-2" />Visão Geral</TabsTrigger>
          <TabsTrigger value="users"><Users className="h-4 w-4 mr-2" />Usuários</TabsTrigger>
          <TabsTrigger value="posts"><FileText className="h-4 w-4 mr-2" />Posts</TabsTrigger>
          <TabsTrigger value="challenges"><Trophy className="h-4 w-4 mr-2" />Desafios</TabsTrigger>
          <TabsTrigger value="achievements"><Award className="h-4 w-4 mr-2" />Conquistas</TabsTrigger>
        </TabsList>

        <TabsContent value="stats"><StatsTab /></TabsContent>
        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="posts"><PostsTab /></TabsContent>
        <TabsContent value="challenges"><ChallengesTab /></TabsContent>
        <TabsContent value="achievements"><AchievementsTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;

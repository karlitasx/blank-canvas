import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Camera, Save, Trophy, Star, Flame } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    const [profileRes, statsRes, achievementsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("user_stats").select("*").eq("user_id", user.id).single(),
      supabase.from("user_achievements").select("*").eq("user_id", user.id),
    ]);
    if (profileRes.data) {
      setProfile(profileRes.data);
      setDisplayName(profileRes.data.display_name || "");
      setBio(profileRes.data.bio || "");
    }
    setStats(statsRes.data);
    setAchievements(achievementsRes.data || []);
  };

  useEffect(() => { fetchData(); }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update({ display_name: displayName, bio }).eq("user_id", user.id);
    if (error) toast.error(error.message);
    else toast.success("Perfil atualizado!");
    setLoading(false);
    fetchData();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);
    if (uploadError) { toast.error(uploadError.message); return; }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("user_id", user.id);
    toast.success("Avatar atualizado!");
    fetchData();
  };

  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : "U";

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Perfil</h1>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Camera className="h-3.5 w-3.5" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Conte um pouco sobre você" />
              </div>
              <Button onClick={saveProfile} disabled={loading}>
                <Save className="h-4 w-4 mr-2" /> Salvar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 mx-auto text-yellow-500 mb-2" />
            <div className="text-2xl font-bold">{stats?.total_points || 0}</div>
            <p className="text-xs text-muted-foreground">Pontos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="h-6 w-6 mx-auto text-orange-500 mb-2" />
            <div className="text-2xl font-bold">{stats?.current_streak || 0}</div>
            <p className="text-xs text-muted-foreground">Sequência</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-6 w-6 mx-auto text-purple-500 mb-2" />
            <div className="text-2xl font-bold">{achievements.length}</div>
            <p className="text-xs text-muted-foreground">Conquistas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estatísticas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Nível</span>
            <Badge>{stats?.level || "Novata"}</Badge>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Hábitos completados</span>
            <span className="text-sm font-medium">{stats?.habits_completed || 0}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Transações registradas</span>
            <span className="text-sm font-medium">{stats?.transactions_logged || 0}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Maior sequência</span>
            <span className="text-sm font-medium">{stats?.longest_streak || 0} dias</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Seguidores</span>
            <span className="text-sm font-medium">{profile?.followers_count || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Seguindo</span>
            <span className="text-sm font-medium">{profile?.following_count || 0}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;

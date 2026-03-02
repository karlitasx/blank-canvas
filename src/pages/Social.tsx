import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Heart, MessageCircle, Send } from "lucide-react";

const Social = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [newPost, setNewPost] = useState("");
  const [likedPosts, setLikedPosts] = useState<string[]>([]);

  const fetchData = async () => {
    if (!user) return;
    const { data: postsData } = await supabase.from("posts").select("*").eq("is_hidden", false).order("created_at", { ascending: false }).limit(50);
    setPosts(postsData || []);

    const userIds = [...new Set((postsData || []).map((p) => p.user_id))];
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", userIds);
      const map: Record<string, any> = {};
      (profilesData || []).forEach((p) => (map[p.user_id] = p));
      setProfiles(map);
    }

    const { data: likes } = await supabase.from("post_likes").select("post_id").eq("user_id", user.id);
    setLikedPosts((likes || []).map((l) => l.post_id));
  };

  useEffect(() => { fetchData(); }, [user]);

  const createPost = async () => {
    if (!user || !newPost.trim()) return;
    const { error } = await supabase.from("posts").insert({ user_id: user.id, content: newPost });
    if (error) { toast.error(error.message); return; }
    setNewPost("");
    fetchData();
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;
    if (likedPosts.includes(postId)) {
      await supabase.from("post_likes").delete().eq("user_id", user.id).eq("post_id", postId);
    } else {
      await supabase.from("post_likes").insert({ user_id: user.id, post_id: postId });
    }
    fetchData();
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Comunidade</h1>
        <p className="text-muted-foreground">Compartilhe seu progresso</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <Textarea value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="Compartilhe algo com a comunidade..." className="mb-3" />
          <div className="flex justify-end">
            <Button onClick={createPost} disabled={!newPost.trim()} size="sm">
              <Send className="h-4 w-4 mr-2" /> Publicar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {posts.map((post) => {
          const profile = profiles[post.user_id];
          const liked = likedPosts.includes(post.id);
          return (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="text-xs">{(profile?.display_name || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{profile?.display_name || "Usuário"}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</p>
                  </div>
                </div>
                <p className="text-sm mb-3">{post.content}</p>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1 text-sm transition-colors ${liked ? "text-red-500" : "hover:text-red-500"}`}>
                    <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} /> {post.likes_count}
                  </button>
                  <span className="flex items-center gap-1 text-sm">
                    <MessageCircle className="h-4 w-4" /> {post.comments_count}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {posts.length === 0 && <p className="text-center py-8 text-muted-foreground">Nenhum post ainda. Seja o primeiro!</p>}
      </div>
    </div>
  );
};

export default Social;

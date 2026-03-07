import { useState } from "react";
import { Users, UserPlus, UserCheck, Loader2, Sparkles } from "lucide-react";
import { useConnections, UserProfile } from "@/hooks/useConnections";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

export const ConnectionsTab = () => {
  const {
    discoverProfiles,
    matches,
    loading,
    connect,
  } = useConnections();

  const [activeTab, setActiveTab] = useState<"discover" | "matches">("discover");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleConnect = async (userId: string) => {
    setProcessingId(userId);
    const success = await connect(userId);
    if (success) {
      setConnectedIds(prev => new Set(prev).add(userId));
    }
    setProcessingId(null);
  };

  // Check if user is already a match
  const isMatched = (userId: string) => {
    return matches.some(m => m.user.user_id === userId);
  };

  const isConnected = (userId: string) => {
    return connectedIds.has(userId) || isMatched(userId);
  };

  const ProfileCard = ({ profile }: { profile: UserProfile }) => {
    const connected = isConnected(profile.user_id);

    return (
      <Card className="bg-card border-border overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <Link to={`/user/${profile.user_id}`}>
              <Avatar className="w-14 h-14 border-2 border-primary/20 hover:scale-105 transition-transform">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-lg">
                  {getInitials(profile.display_name || "U")}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
              <Link to={`/user/${profile.user_id}`}>
                <h3 className="font-semibold text-foreground truncate hover:text-primary transition-colors">
                  {profile.display_name || "Usuário"}
                </h3>
              </Link>

              {profile.bio && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {profile.bio}
                </p>
              )}
            </div>

            {connected ? (
              <Button size="sm" variant="secondary" disabled className="shrink-0 gap-1.5">
                <UserCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Conectado</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleConnect(profile.user_id)}
                disabled={processingId === profile.user_id}
                className="shrink-0 gap-1.5"
              >
                {processingId === profile.user_id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Conectar</span>
                  </>
                )}
              </Button>
            )}
          </div>

          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {profile.interests.slice(0, 4).map((interest, idx) => (
                <Badge key={idx} variant="secondary" className="text-[10px] sm:text-xs">
                  {interest}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "discover" | "matches")}>
        <TabsList className="w-full bg-card border border-border">
          <TabsTrigger value="discover" className="flex-1">
            Descobrir
          </TabsTrigger>
          <TabsTrigger value="matches" className="flex-1">
            Conexões ({matches.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : discoverProfiles.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Nenhum perfil disponível no momento.
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Volte mais tarde para descobrir novas conexões!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {discoverProfiles.map((profile) => (
                <ProfileCard key={profile.user_id} profile={profile} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="matches" className="mt-4">
          {matches.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Você ainda não tem conexões.
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Conecte-se com pessoas na aba Descobrir!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => (
                <Card key={match.user.user_id} className="bg-card border-border">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Link to={`/user/${match.user.user_id}`}>
                      <Avatar className="w-12 h-12 border-2 border-primary/30 hover:scale-105 transition-transform">
                        <AvatarImage src={match.user.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {getInitials(match.user.display_name || "U")}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/user/${match.user.user_id}`}>
                        <h4 className="font-medium text-foreground truncate hover:text-primary transition-colors">
                          {match.user.display_name || "Usuário"}
                        </h4>
                      </Link>
                      {match.user.bio && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {match.user.bio}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

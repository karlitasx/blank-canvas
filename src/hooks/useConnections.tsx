import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type ConnectionType = "friendship" | "work" | "networking";
type ActionType = "like" | "skip";

export interface UserProfile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  interests: string[];
}

export interface Connection {
  id: string;
  user_id: string;
  target_user_id: string;
  action: ActionType;
  connection_type: ConnectionType;
  created_at: string;
}

export interface Match {
  user: UserProfile;
  matchedAt: string;
  connectionType: ConnectionType;
}

export const useConnections = () => {
  const { user } = useAuth();
  const [discoverProfiles, setDiscoverProfiles] = useState<UserProfile[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState<ConnectionType>("friendship"); // kept for API compat

  // Fetch all profiles except self
  const fetchDiscoverProfiles = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, bio, interests")
        .neq("user_id", user.id)
        .limit(50);

      if (error) throw error;

      setDiscoverProfiles(profiles || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch matches (mutual likes)
  const fetchMatches = useCallback(async () => {
    if (!user) return;

    try {
      // Get users I liked
      const { data: myLikes } = await supabase
        .from("connections")
        .select("target_user_id, connection_type, created_at")
        .eq("user_id", user.id)
        .eq("action", "like");

      if (!myLikes?.length) {
        setMatches([]);
        return;
      }

      const likedIds = myLikes.map(l => l.target_user_id);

      // Check who liked me back
      const { data: theirLikes } = await supabase
        .from("connections")
        .select("user_id")
        .eq("target_user_id", user.id)
        .eq("action", "like")
        .in("user_id", likedIds);

      if (!theirLikes?.length) {
        setMatches([]);
        return;
      }

      const mutualIds = theirLikes.map(l => l.user_id);

      // Get profiles of matches
      const { data: matchProfiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, bio, interests")
        .in("user_id", mutualIds);

      if (matchProfiles) {
        const matchList: Match[] = matchProfiles.map(profile => {
          const myLike = myLikes.find(l => l.target_user_id === profile.user_id);
          return {
            user: profile,
            matchedAt: myLike?.created_at || new Date().toISOString(),
            connectionType: (myLike?.connection_type as ConnectionType) || "friendship",
          };
        });

        setMatches(matchList);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchDiscoverProfiles();
    fetchMatches();
  }, [fetchDiscoverProfiles, fetchMatches]);

  // Connect with a user (like)
  const connect = useCallback(async (
    targetUserId: string,
    connectionType: ConnectionType = "friendship"
  ): Promise<boolean> => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return false;
    }

    try {
      const { error } = await supabase
        .from("connections")
        .insert({
          user_id: user.id,
          target_user_id: targetUserId,
          action: "like",
          connection_type: connectionType,
        });

      if (error) throw error;

      // Remove from discover list
      setDiscoverProfiles(prev => prev.filter(p => p.user_id !== targetUserId));

      // Check if it's a match
      const { data: theirLike } = await supabase
        .from("connections")
        .select("*")
        .eq("user_id", targetUserId)
        .eq("target_user_id", user.id)
        .eq("action", "like")
        .maybeSingle();

      if (theirLike) {
        toast.success("🎉 Match! Vocês se conectaram!");
        fetchMatches();
      } else {
        toast.success("Conexão enviada!");
      }

      return true;
    } catch (error: any) {
      console.error("Error connecting:", error);
      if (error.code === "23505") {
        toast.error("Você já interagiu com este usuário");
      } else {
        toast.error("Erro ao conectar");
      }
      return false;
    }
  }, [user, fetchMatches]);

  // Skip a user
  const skip = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("connections")
        .insert({
          user_id: user.id,
          target_user_id: targetUserId,
          action: "skip",
          connection_type: currentFilter,
        });

      if (error) throw error;

      // Remove from discover list
      setDiscoverProfiles(prev => prev.filter(p => p.user_id !== targetUserId));
      return true;
    } catch (error) {
      console.error("Error skipping:", error);
      return false;
    }
  }, [user, currentFilter]);

  // Get matches count
  const matchesCount = matches.length;

  return {
    discoverProfiles,
    matches,
    matchesCount,
    loading,
    currentFilter,
    setCurrentFilter,
    connect,
    skip,
    refetchDiscover: fetchDiscoverProfiles,
    refetchMatches: fetchMatches,
  };
};

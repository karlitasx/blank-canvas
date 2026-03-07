import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export interface Introduction {
  id: string;
  user_id: string;
  content: string;
  goals: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
  };
}

export const useIntroductions = () => {
  const { user } = useAuth();
  const [introductions, setIntroductions] = useState<Introduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [myIntroduction, setMyIntroduction] = useState<Introduction | null>(null);

  const fetchIntroductions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("introductions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for all introductions
      const userIds = (data || []).map((i: any) => i.user_id);
      let profilesMap: Record<string, any> = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url, bio")
          .in("user_id", userIds);

        if (profiles) {
          profilesMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));
        }
      }

      const enriched = (data || []).map((intro: any) => ({
        ...intro,
        profile: profilesMap[intro.user_id] || null,
      }));

      setIntroductions(enriched);

      if (user) {
        const mine = enriched.find((i: Introduction) => i.user_id === user.id);
        setMyIntroduction(mine || null);
      }
    } catch (err) {
      console.error("Error fetching introductions:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchIntroductions();
  }, [fetchIntroductions]);

  const createOrUpdateIntroduction = async (content: string, goals?: string) => {
    if (!user) return;

    try {
      if (myIntroduction) {
        const { error } = await (supabase as any)
          .from("introductions")
          .update({ content, goals: goals || null, updated_at: new Date().toISOString() })
          .eq("id", myIntroduction.id);
        if (error) throw error;
        toast({ title: "Apresentação atualizada! ✨" });
      } else {
        const { error } = await (supabase as any)
          .from("introductions")
          .insert({ user_id: user.id, content, goals: goals || null });
        if (error) throw error;
        toast({ title: "Apresentação criada! 🎉" });
      }
      await fetchIntroductions();
    } catch (err: any) {
      toast({ title: "Erro ao salvar apresentação", description: err.message, variant: "destructive" });
    }
  };

  const deleteIntroduction = async () => {
    if (!user || !myIntroduction) return;
    try {
      const { error } = await (supabase as any)
        .from("introductions")
        .delete()
        .eq("id", myIntroduction.id);
      if (error) throw error;
      toast({ title: "Apresentação removida" });
      await fetchIntroductions();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  return {
    introductions,
    myIntroduction,
    loading,
    createOrUpdateIntroduction,
    deleteIntroduction,
    refetch: fetchIntroductions,
  };
};

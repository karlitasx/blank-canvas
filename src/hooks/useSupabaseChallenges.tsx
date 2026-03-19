import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Challenge, ChallengeParticipant, CreateChallengeInput } from "@/types/challenges";
import { toast } from "sonner";

export const useSupabaseChallenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = useCallback(async () => {
    if (!user) {
      setChallenges([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch all public challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from("challenges")
        .select("*")
        .order("created_at", { ascending: false });

      if (challengesError) throw challengesError;

      // Fetch participants for each challenge
      const challengesWithParticipants = await Promise.all(
        (challengesData || []).map(async (challenge) => {
          const { data: participants } = await supabase
            .from("challenge_participants")
            .select("*")
            .eq("challenge_id", challenge.id);

          const myParticipation = participants?.find(p => p.user_id === user.id);

          return {
            ...challenge,
            participants_count: participants?.length || 0,
            is_joined: !!myParticipation,
            my_progress: myParticipation?.current_progress || 0,
          } as Challenge;
        })
      );

      setChallenges(challengesWithParticipants);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      toast.error("Erro ao carregar desafios");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const createChallenge = async (input: CreateChallengeInput) => {
    if (!user) return null;

    try {
      const newChallenge = {
        ...input,
        created_by: user.id,
        emoji: input.emoji || '🏆',
        is_public: input.is_public ?? true,
        difficulty: input.difficulty || 'medium',
        points_per_checkin: input.points_per_checkin || 10,
      };

      const { data, error } = await supabase
        .from("challenges")
        .insert(newChallenge)
        .select()
        .single();

      if (error) throw error;

      // Auto-join the creator
      await joinChallenge(data.id);

      toast.success("Desafio criado!");
      await fetchChallenges();
      return data as Challenge;
    } catch (error) {
      console.error("Error creating challenge:", error);
      toast.error("Erro ao criar desafio");
      return null;
    }
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("challenge_participants")
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          current_progress: 0,
        });

      if (error) {
        if (error.code === '23505') {
          toast.info("Você já está participando deste desafio");
          return true;
        }
        throw error;
      }

      toast.success("Você entrou no desafio!");
      await fetchChallenges();
      return true;
    } catch (error) {
      console.error("Error joining challenge:", error);
      toast.error("Erro ao entrar no desafio");
      return false;
    }
  };

  const leaveChallenge = async (challengeId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("challenge_participants")
        .delete()
        .eq("challenge_id", challengeId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Você saiu do desafio");
      await fetchChallenges();
      return true;
    } catch (error) {
      console.error("Error leaving challenge:", error);
      toast.error("Erro ao sair do desafio");
      return false;
    }
  };

  const updateProgress = async (challengeId: string, progress: number) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("challenge_participants")
        .update({ current_progress: progress })
        .eq("challenge_id", challengeId)
        .eq("user_id", user.id);

      if (error) throw error;

      await fetchChallenges();
      return true;
    } catch (error) {
      console.error("Error updating progress:", error);
      toast.error("Erro ao atualizar progresso");
      return false;
    }
  };

  const getParticipants = async (challengeId: string): Promise<ChallengeParticipant[]> => {
    try {
      const { data: participants, error } = await supabase
        .from("challenge_participants")
        .select("*")
        .eq("challenge_id", challengeId)
        .order("current_progress", { ascending: false });

      if (error) throw error;

      // Fetch profiles for participants
      const participantsWithProfiles = await Promise.all(
        (participants || []).map(async (p) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("user_id", p.user_id)
            .maybeSingle();

          return {
            ...p,
            display_name: profile?.display_name || "Usuário",
            avatar_url: profile?.avatar_url,
          } as ChallengeParticipant;
        })
      );

      return participantsWithProfiles;
    } catch (error) {
      console.error("Error fetching participants:", error);
      return [];
    }
  };

  const getActiveChallenges = () => {
    const today = new Date().toISOString().split("T")[0];
    return challenges.filter(c => c.end_date >= today && c.is_joined);
  };

  const getAvailableChallenges = () => {
    const today = new Date().toISOString().split("T")[0];
    return challenges.filter(c => c.end_date >= today && !c.is_joined);
  };

  const deleteChallenge = async (challengeId: string) => {
    if (!user) return false;

    try {
      // Delete participants first
      await supabase
        .from("challenge_participants")
        .delete()
        .eq("challenge_id", challengeId);

      // Delete checkins
      await supabase
        .from("challenge_checkins")
        .delete()
        .eq("challenge_id", challengeId);

      const { error } = await supabase
        .from("challenges")
        .delete()
        .eq("id", challengeId)
        .eq("created_by", user.id);

      if (error) throw error;

      toast.success("Desafio excluído com sucesso!");
      await fetchChallenges();
      return true;
    } catch (error) {
      console.error("Error deleting challenge:", error);
      toast.error("Erro ao excluir desafio");
      return false;
    }
  };

  return {
    challenges,
    loading,
    createChallenge,
    joinChallenge,
    leaveChallenge,
    updateProgress,
    deleteChallenge,
    getParticipants,
    getActiveChallenges,
    getAvailableChallenges,
    refetch: fetchChallenges,
  };
};

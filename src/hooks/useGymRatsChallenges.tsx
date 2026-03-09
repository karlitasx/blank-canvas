import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface CheckIn {
  id: string;
  challenge_id: string;
  user_id: string;
  photo_url: string;
  caption: string | null;
  checkin_date: string;
  created_at: string;
  display_name?: string;
  avatar_url?: string;
}

export const useGymRatsChallenges = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const uploadCheckinPhoto = async (challengeId: string, file: File, caption?: string) => {
    if (!user) return null;

    try {
      setLoading(true);

      // Upload photo to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('challenge-photos')
        .upload(fileName, file, {
          upsert: false,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('challenge-photos')
        .getPublicUrl(fileName);

      // Create check-in record
      const { data: checkin, error: checkinError } = await supabase
        .from('challenge_checkins')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          photo_url: publicUrl,
          caption: caption || null,
        })
        .select()
        .single();

      if (checkinError) throw checkinError;

      // Update participant progress
      const { data: participant } = await supabase
        .from('challenge_participants')
        .select('current_progress')
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id)
        .single();

      if (participant) {
        await supabase
          .from('challenge_participants')
          .update({ current_progress: participant.current_progress + 1 })
          .eq('challenge_id', challengeId)
          .eq('user_id', user.id);
      }

      // Award points for check-in
      await awardCheckinPoints(checkin.id);

      toast.success("Check-in enviado! +10 pontos 🔥");
      return checkin;
    } catch (error) {
      console.error("Error uploading check-in:", error);
      toast.error("Erro ao enviar check-in");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const awardCheckinPoints = async (checkinId: string) => {
    if (!user) return;

    try {
      // Check if already awarded for this checkin
      const { count } = await supabase
        .from("point_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("action_type", "challenge_checkin")
        .eq("action_id", checkinId);

      if ((count || 0) > 0) return;

      // Check daily limit (3 per day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: todayCount } = await supabase
        .from("point_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("action_type", "challenge_checkin")
        .gte("created_at", today.toISOString());

      if ((todayCount || 0) >= 3) return;

      // Award 10 points
      const { error: historyError } = await supabase
        .from("point_history")
        .insert({
          user_id: user.id,
          action_type: "challenge_checkin",
          action_id: checkinId,
          points: 10,
        });

      if (historyError) throw historyError;

      // Update user_stats
      const { data: currentStats } = await supabase
        .from("user_stats")
        .select("total_points")
        .eq("user_id", user.id)
        .single();

      await supabase
        .from("user_stats")
        .update({ total_points: (currentStats?.total_points || 0) + 10 })
        .eq("user_id", user.id);

    } catch (error) {
      console.error("Error awarding check-in points:", error);
    }
  };

  const getChallengeCheckins = async (challengeId: string): Promise<CheckIn[]> => {
    try {
      const { data: checkins, error } = await supabase
        .from('challenge_checkins')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for check-ins
      const checkinsWithProfiles = await Promise.all(
        (checkins || []).map(async (checkin) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', checkin.user_id)
            .maybeSingle();

          return {
            ...checkin,
            display_name: profile?.display_name || "Usuária",
            avatar_url: profile?.avatar_url,
          } as CheckIn;
        })
      );

      return checkinsWithProfiles;
    } catch (error) {
      console.error("Error fetching check-ins:", error);
      return [];
    }
  };

  const getUserMonthlyCheckins = async (challengeId: string, year: number, month: number) => {
    if (!user) return [];

    try {
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('challenge_checkins')
        .select('*')
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id)
        .gte('checkin_date', startDate)
        .lte('checkin_date', endDate)
        .order('checkin_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching monthly check-ins:", error);
      return [];
    }
  };

  const deleteCheckin = async (checkinId: string, photoUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = photoUrl.split('/challenge-photos/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        
        // Delete from storage
        await supabase.storage
          .from('challenge-photos')
          .remove([filePath]);
      }

      // Delete record
      const { error } = await supabase
        .from('challenge_checkins')
        .delete()
        .eq('id', checkinId);

      if (error) throw error;

      toast.success("Check-in removido");
      return true;
    } catch (error) {
      console.error("Error deleting check-in:", error);
      toast.error("Erro ao remover check-in");
      return false;
    }
  };

  return {
    loading,
    uploadCheckinPhoto,
    getChallengeCheckins,
    getUserMonthlyCheckins,
    deleteCheckin,
  };
};

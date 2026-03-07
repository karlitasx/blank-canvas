import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  language: string;
  currency: string;
  bio: string | null;
  interests: string[];
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  total_points: number;
  current_streak: number;
  longest_streak: number;
  habits_completed: number;
  transactions_logged: number;
  level: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch profile from Supabase
  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);

      // Fetch stats
      const { data: statsData, error: statsError } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (statsError) throw statsError;
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<Pick<Profile, 'display_name' | 'language' | 'currency' | 'bio' | 'interests'>>) => {
    if (!user?.id) return { error: new Error("Not authenticated") };

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({ user_id: user.id, ...updates }, { onConflict: 'user_id' });

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast.success("Perfil atualizado!");
      return { error: null };
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erro ao atualizar perfil");
      return { error };
    }
  }, [user?.id]);

  // Upload avatar
  const uploadAvatar = useCallback(async (file: File) => {
    if (!user?.id) return { error: new Error("Not authenticated"), url: null };

    setIsUploading(true);
    
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error("Por favor, selecione uma imagem");
      }
      
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        throw new Error("A imagem deve ter no máximo 2MB");
      }

      // Create file path with user ID
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL with cache-busting
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const avatarUrlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

      // Update profile with new avatar URL (upsert in case profile doesn't exist)
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({ user_id: user.id, avatar_url: avatarUrlWithCacheBust }, { onConflict: 'user_id' });

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrlWithCacheBust } : null);
      toast.success("Avatar atualizado!");
      
      return { error: null, url: publicUrl };
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error(error.message || "Erro ao enviar avatar");
      return { error, url: null };
    } finally {
      setIsUploading(false);
    }
  }, [user?.id]);

  // Update stats
  const incrementStats = useCallback(async (updates: Partial<Pick<UserStats, 'total_points' | 'habits_completed' | 'transactions_logged'>>) => {
    if (!user?.id || !stats) return;

    try {
      const newStats = {
        total_points: (stats.total_points || 0) + (updates.total_points || 0),
        habits_completed: (stats.habits_completed || 0) + (updates.habits_completed || 0),
        transactions_logged: (stats.transactions_logged || 0) + (updates.transactions_logged || 0),
      };

      const { error } = await supabase
        .from("user_stats")
        .update(newStats)
        .eq("user_id", user.id);

      if (error) throw error;
      
      setStats(prev => prev ? { ...prev, ...newStats } : null);
    } catch (error) {
      console.error("Error updating stats:", error);
    }
  }, [user?.id, stats]);

  // Get initials from display name
  const getInitials = useCallback((name?: string | null) => {
    const displayName = name || profile?.display_name || user?.email?.split('@')[0] || 'U';
    return displayName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [profile?.display_name, user?.email]);

  // Get display name
  const displayName = profile?.display_name 
    || user?.user_metadata?.full_name 
    || user?.email?.split('@')[0] 
    || 'Usuário';

  return {
    profile,
    stats,
    isLoading,
    isUploading,
    displayName,
    getInitials,
    updateProfile,
    uploadAvatar,
    incrementStats,
    refetch: fetchProfile,
  };
};

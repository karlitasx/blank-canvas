import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type BusinessType = "mei" | "simples" | "autonomo";

export interface BusinessSettings {
  id: string;
  business_type: BusinessType;
  cnpj: string | null;
  company_name: string | null;
}

export const useBusinessSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) { setSettings(null); setIsLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from("business_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setSettings({
          id: data.id,
          business_type: data.business_type as BusinessType,
          cnpj: data.cnpj,
          company_name: data.company_name,
        });
      }
    } catch (e) { console.error("Error fetching business settings:", e); }
    finally { setIsLoading(false); }
  }, [user]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const saveSettings = useCallback(async (type: BusinessType, cnpj?: string, companyName?: string) => {
    if (!user) return;
    try {
      const payload = {
        user_id: user.id,
        business_type: type,
        cnpj: cnpj || null,
        company_name: companyName || null,
      };
      if (settings) {
        const { error } = await supabase.from("business_settings").update(payload).eq("id", settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("business_settings").insert(payload);
        if (error) throw error;
      }
      await fetchSettings();
    } catch (e) { console.error("Error saving business settings:", e); }
  }, [user, settings, fetchSettings]);

  return { settings, isLoading, saveSettings, refetch: fetchSettings };
};

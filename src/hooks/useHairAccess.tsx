import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useHairAccess = () => {
  const { user } = useAuth();
  const [isHairAdmin, setIsHairAdmin] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAccess = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Check if user is hair_admin
      const { data: adminData } = await supabase.rpc("is_hair_admin" as any, {
        _user_id: user.id,
      });
      const isAdmin = !!adminData;
      setIsHairAdmin(isAdmin);

      if (isAdmin) {
        setHasAccess(true);
      } else {
        // Check if user has client access
        const { data: accessData } = await supabase.rpc("has_hair_access" as any, {
          _user_id: user.id,
        });
        setHasAccess(!!accessData);
      }
    } catch (err) {
      console.error("Error checking hair access:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  return { isHairAdmin, hasAccess, loading, refetch: checkAccess };
};

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSupervisorStatus = (userId: string | undefined) => {
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSupervisorStatus = async () => {
      if (!userId) {
        setIsSupervisor(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("employees")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "supervisor")
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error checking supervisor status:", error);
        }

        setIsSupervisor(!!data);
      } catch (error) {
        console.error("Error checking supervisor status:", error);
        setIsSupervisor(false);
      } finally {
        setLoading(false);
      }
    };

    checkSupervisorStatus();
  }, [userId]);

  return { isSupervisor, loading };
};

import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

// Convert hex color to HSL
function hexToHSL(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}

export const useThemeCustomization = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadAndApplyTheme = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("primary_color, secondary_color, accent_color, dashboard_income_color, dashboard_expense_color")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const root = document.documentElement;

          // Apply primary color if set
          if (data.primary_color) {
            const hsl = hexToHSL(data.primary_color);
            root.style.setProperty('--primary', hsl);
            root.style.setProperty('--ring', hsl);
          }

          // Apply secondary color if set
          if (data.secondary_color) {
            const hsl = hexToHSL(data.secondary_color);
            root.style.setProperty('--secondary', hsl);
          }

          // Apply accent color if set
          if (data.accent_color) {
            const hsl = hexToHSL(data.accent_color);
            root.style.setProperty('--accent', hsl);
          }

          // Apply dashboard colors if set (these are already HSL strings)
          if (data.dashboard_income_color) {
            // Extract HSL values from string like "hsl(142, 76%, 36%)"
            const hslMatch = data.dashboard_income_color.match(/hsl\(([^)]+)\)/);
            if (hslMatch) {
              const hslValues = hslMatch[1].replace(/%/g, '%').replace(/,/g, '');
              root.style.setProperty('--income', hslValues);
            }
          }

          if (data.dashboard_expense_color) {
            const hslMatch = data.dashboard_expense_color.match(/hsl\(([^)]+)\)/);
            if (hslMatch) {
              const hslValues = hslMatch[1].replace(/%/g, '%').replace(/,/g, '');
              root.style.setProperty('--expense', hslValues);
            }
          }
        }
      } catch (error) {
        console.error("Error loading theme customization:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAndApplyTheme();

    // Subscribe to changes in the profiles table
    const channel = supabase
      .channel('theme-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadAndApplyTheme();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { loading };
};

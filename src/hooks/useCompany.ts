import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CompanyData {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export const useCompany = (userId: string | undefined) => {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCompany = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCompany(data);
    } catch (error) {
      console.error('Error fetching company:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (name: string) => {
    if (!userId) return { error: 'No user ID' };

    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({ name, owner_id: userId })
        .select()
        .single();

      if (error) throw error;

      setCompany(data);
      toast({
        title: "Success",
        description: "Company created successfully",
      });
      return { data };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create company",
        variant: "destructive",
      });
      return { error: error.message };
    }
  };

  const updateCompany = async (updates: Partial<CompanyData>) => {
    if (!company) return { error: 'No company' };

    try {
      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', company.id)
        .select()
        .single();

      if (error) throw error;

      setCompany(data);
      toast({
        title: "Success",
        description: "Company updated successfully",
      });
      return { data };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update company",
        variant: "destructive",
      });
      return { error: error.message };
    }
  };

  useEffect(() => {
    fetchCompany();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('company-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'companies',
          filter: `owner_id=eq.${userId}`,
        },
        (payload: any) => {
          if (payload.eventType === 'DELETE') {
            setCompany(null);
          } else {
            setCompany(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return {
    company,
    loading,
    createCompany,
    updateCompany,
    refetch: fetchCompany,
  };
};
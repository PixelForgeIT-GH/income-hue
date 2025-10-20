import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TimeEntryData {
  id: string;
  employee_id: string;
  company_id: string;
  clock_in: string;
  clock_out: string | null;
  hours_worked: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useTimeEntries = (companyId: string | undefined, employeeId?: string) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentEntry, setCurrentEntry] = useState<TimeEntryData | null>(null);
  const { toast } = useToast();

  const fetchTimeEntries = async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('time_entries')
        .select('*')
        .eq('company_id', companyId);

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query.order('clock_in', { ascending: false });

      if (error) throw error;
      setTimeEntries(data || []);

      // Find current active entry (clocked in but not out)
      const active = data?.find(entry => !entry.clock_out) || null;
      setCurrentEntry(active);
    } catch (error) {
      console.error('Error fetching time entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const clockIn = async (employeeId: string, notes?: string) => {
    if (!companyId) return { error: 'No company ID' };

    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          employee_id: employeeId,
          company_id: companyId,
          clock_in: new Date().toISOString(),
          notes,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Clocked In",
        description: "Successfully clocked in",
      });
      await fetchTimeEntries();
      return { data };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clock in",
        variant: "destructive",
      });
      return { error: error.message };
    }
  };

  const clockOut = async (entryId: string, notes?: string) => {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .update({
          clock_out: new Date().toISOString(),
          notes,
        })
        .eq('id', entryId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Clocked Out",
        description: `Worked ${data.hours_worked?.toFixed(2)} hours`,
      });
      await fetchTimeEntries();
      return { data };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clock out",
        variant: "destructive",
      });
      return { error: error.message };
    }
  };

  const updateTimeEntry = async (id: string, updates: Partial<TimeEntryData>) => {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Time entry updated",
      });
      await fetchTimeEntries();
      return { data };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update time entry",
        variant: "destructive",
      });
      return { error: error.message };
    }
  };

  const deleteTimeEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Time entry deleted",
      });
      await fetchTimeEntries();
      return {};
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete time entry",
        variant: "destructive",
      });
      return { error: error.message };
    }
  };

  useEffect(() => {
    fetchTimeEntries();

    // Subscribe to realtime updates
    if (companyId) {
      const channel = supabase
        .channel('time-entries-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'time_entries',
            filter: `company_id=eq.${companyId}`,
          },
          () => {
            fetchTimeEntries();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [companyId, employeeId]);

  return {
    timeEntries,
    currentEntry,
    loading,
    clockIn,
    clockOut,
    updateTimeEntry,
    deleteTimeEntry,
    refetch: fetchTimeEntries,
  };
};
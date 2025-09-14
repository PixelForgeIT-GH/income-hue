import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { IncomeStreamData } from "@/components/income/IncomeStream";
import { useToast } from "@/hooks/use-toast";

export const useIncomeStreams = (userId: string | undefined) => {
  const [incomeStreams, setIncomeStreams] = useState<IncomeStreamData[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchIncomeStreams = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("income_streams")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const streamsWithDates: IncomeStreamData[] = data.map((stream: any) => ({
        id: stream.id,
        name: stream.name,
        amount: stream.amount,
        frequency: stream.frequency as "weekly" | "biweekly" | "monthly",
        lastPaidDate: new Date(stream.last_paid_date),
      }));
      
      setIncomeStreams(streamsWithDates);
    } catch (error: any) {
      console.error("Error fetching income streams:", error);
      toast({
        title: "Error",
        description: "Failed to load income streams",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addIncomeStream = async (streamData: Omit<IncomeStreamData, "id">) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("income_streams")
        .insert([{
          user_id: userId,
          name: streamData.name,
          amount: streamData.amount,
          frequency: streamData.frequency,
          last_paid_date: streamData.lastPaidDate.toISOString().split('T')[0],
        }])
        .select()
        .single();

      if (error) throw error;

      const newStream: IncomeStreamData = {
        id: data.id,
        name: data.name,
        amount: data.amount,
        frequency: data.frequency as "weekly" | "biweekly" | "monthly",
        lastPaidDate: new Date(data.last_paid_date),
      };
      
      setIncomeStreams(prev => [newStream, ...prev]);
      
      toast({
        title: "Income stream added",
        description: `${streamData.name} has been added to your income streams.`,
      });
      
      return { error: null };
    } catch (error: any) {
      console.error("Error adding income stream:", error);
      toast({
        title: "Error",
        description: "Failed to add income stream",
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateIncomeStream = async (updatedStream: IncomeStreamData) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("income_streams")
        .update({
          name: updatedStream.name,
          amount: updatedStream.amount,
          frequency: updatedStream.frequency,
          last_paid_date: updatedStream.lastPaidDate.toISOString().split('T')[0],
        })
        .eq("id", updatedStream.id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;

      const streamWithDate: IncomeStreamData = {
        id: data.id,
        name: data.name,
        amount: data.amount,
        frequency: data.frequency as "weekly" | "biweekly" | "monthly",
        lastPaidDate: new Date(data.last_paid_date),
      };
      
      setIncomeStreams(prev => 
        prev.map(stream => stream.id === updatedStream.id ? streamWithDate : stream)
      );
      
      toast({
        title: "Income stream updated",
        description: `${updatedStream.name} has been updated.`,
      });
      
      return { error: null };
    } catch (error: any) {
      console.error("Error updating income stream:", error);
      toast({
        title: "Error",
        description: "Failed to update income stream",
        variant: "destructive",
      });
      return { error };
    }
  };

  const deleteIncomeStream = async (id: string) => {
    if (!userId) return;

    const stream = incomeStreams.find(s => s.id === id);
    
    try {
      const { error } = await supabase
        .from("income_streams")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      
      setIncomeStreams(prev => prev.filter(stream => stream.id !== id));
      
      toast({
        title: "Income stream deleted",
        description: `${stream?.name} has been removed.`,
      });
      
      return { error: null };
    } catch (error: any) {
      console.error("Error deleting income stream:", error);
      toast({
        title: "Error",
        description: "Failed to delete income stream",
        variant: "destructive",
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchIncomeStreams();
  }, [userId]);

  return {
    incomeStreams,
    loading,
    addIncomeStream,
    updateIncomeStream,
    deleteIncomeStream,
    refetch: fetchIncomeStreams,
  };
};
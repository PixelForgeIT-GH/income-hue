import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExpenseData } from "@/components/expenses/ExpenseItem";
import { useToast } from "@/hooks/use-toast";

export const useExpenses = (userId: string | undefined) => {
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchExpenses = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const typedExpenses: ExpenseData[] = (data || []).map((expense: any) => ({
        id: expense.id,
        name: expense.name,
        amount: expense.amount,
        frequency: expense.frequency as "weekly" | "monthly" | "yearly",
      }));
      
      setExpenses(typedExpenses);
    } catch (error: any) {
      console.error("Error fetching expenses:", error);
      toast({
        title: "Error",
        description: "Failed to load expenses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expenseData: Omit<ExpenseData, "id">) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("expenses")
        .insert([{
          user_id: userId,
          name: expenseData.name,
          amount: expenseData.amount,
          frequency: expenseData.frequency,
        }])
        .select()
        .single();

      if (error) throw error;
      
      const typedExpense: ExpenseData = {
        id: data.id,
        name: data.name,
        amount: data.amount,
        frequency: data.frequency as "weekly" | "monthly" | "yearly",
      };
      
      setExpenses(prev => [typedExpense, ...prev]);
      
      toast({
        title: "Expense added",
        description: `${expenseData.name} has been added to your expenses.`,
      });
      
      return { error: null };
    } catch (error: any) {
      console.error("Error adding expense:", error);
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateExpense = async (updatedExpense: ExpenseData) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("expenses")
        .update({
          name: updatedExpense.name,
          amount: updatedExpense.amount,
          frequency: updatedExpense.frequency,
        })
        .eq("id", updatedExpense.id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      
      const typedExpense: ExpenseData = {
        id: data.id,
        name: data.name,
        amount: data.amount,
        frequency: data.frequency as "weekly" | "monthly" | "yearly",
      };
      
      setExpenses(prev => 
        prev.map(expense => expense.id === updatedExpense.id ? typedExpense : expense)
      );
      
      toast({
        title: "Expense updated",
        description: `${updatedExpense.name} has been updated.`,
      });
      
      return { error: null };
    } catch (error: any) {
      console.error("Error updating expense:", error);
      toast({
        title: "Error",
        description: "Failed to update expense",
        variant: "destructive",
      });
      return { error };
    }
  };

  const deleteExpense = async (id: string) => {
    if (!userId) return;

    const expense = expenses.find(e => e.id === id);
    
    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      
      toast({
        title: "Expense deleted",
        description: `${expense?.name} has been removed.`,
      });
      
      return { error: null };
    } catch (error: any) {
      console.error("Error deleting expense:", error);
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [userId]);

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses,
  };
};
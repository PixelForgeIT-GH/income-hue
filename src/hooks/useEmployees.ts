import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface EmployeeData {
  id: string;
  company_id: string;
  user_id: string | null;
  email: string;
  first_name: string;
  last_name: string;
  role: 'supervisor' | 'employee';
  hourly_rate: number | null;
  weekly_rate: number | null;
  biweekly_rate: number | null;
  rate_type: 'hourly' | 'weekly' | 'biweekly' | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useEmployees = (companyId: string | undefined) => {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEmployees = async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees((data || []) as EmployeeData[]);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (employee: Omit<EmployeeData, 'id' | 'created_at' | 'updated_at' | 'company_id'>) => {
    if (!companyId) return { error: 'No company ID' };

    try {
      const { data, error } = await supabase
        .from('employees')
        .insert({ ...employee, company_id: companyId })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employee added successfully",
      });
      await fetchEmployees();
      return { data };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add employee",
        variant: "destructive",
      });
      return { error: error.message };
    }
  };

  const updateEmployee = async (id: string, updates: Partial<EmployeeData>) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
      await fetchEmployees();
      return { data };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update employee",
        variant: "destructive",
      });
      return { error: error.message };
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
      await fetchEmployees();
      return {};
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete employee",
        variant: "destructive",
      });
      return { error: error.message };
    }
  };

  useEffect(() => {
    fetchEmployees();

    // Subscribe to realtime updates
    if (companyId) {
      const channel = supabase
        .channel('employees-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'employees',
            filter: `company_id=eq.${companyId}`,
          },
          () => {
            fetchEmployees();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [companyId]);

  return {
    employees,
    loading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    refetch: fetchEmployees,
  };
};
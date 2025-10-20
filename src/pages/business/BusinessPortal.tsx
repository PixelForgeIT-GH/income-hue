import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { EmployeePunchClock } from "./EmployeePunchClock";
import { SupervisorDashboard } from "./SupervisorDashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const BusinessPortal = () => {
  const { user } = useAuth();
  const { company, loading: companyLoading } = useCompany(user?.id);
  const [employeeRole, setEmployeeRole] = useState<'supervisor' | 'employee' | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkEmployeeRole = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('employees')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
          setEmployeeRole(data.role);
        }
      } catch (error) {
        console.error('Error checking employee role:', error);
      } finally {
        setLoading(false);
      }
    };

    checkEmployeeRole();
  }, [user]);

  if (loading || companyLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // No company and not an employee - needs to upgrade
  if (!company && !employeeRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Building2 className="h-12 w-12 text-primary" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Business Features</h2>
            <p className="text-muted-foreground">
              Upgrade to the Business plan to access employee management, time tracking, and forecasting features.
            </p>
          </div>
          <div className="space-y-3">
            <Button onClick={() => navigate('/upgrade')} className="w-full">
              Upgrade to Business
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Render based on role
  if (employeeRole === 'supervisor' || company) {
    return <SupervisorDashboard />;
  }

  if (employeeRole === 'employee') {
    return <EmployeePunchClock />;
  }

  return null;
};
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, LogIn, LogOut, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const EmployeePunchClock = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { currentEntry, clockIn, clockOut } = useTimeEntries(employee?.company_id, employee?.id);

  useEffect(() => {
    // Fetch employee data
    const fetchEmployee = async () => {
      if (!user?.id) return;

      const { data } = await supabase
        .from('employees')
        .select('*, companies(*)')
        .eq('user_id', user.id)
        .single();

      setEmployee(data);
    };

    fetchEmployee();

    // Update clock every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [user]);

  const handleClockIn = async () => {
    if (employee) {
      await clockIn(employee.id);
    }
  };

  const handleClockOut = async () => {
    if (currentEntry) {
      await clockOut(currentEntry.id);
    }
  };

  const calculateHoursToday = () => {
    if (!currentEntry) return 0;
    const start = new Date(currentEntry.clock_in);
    const now = new Date();
    return (now.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  if (!employee) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Loading employee data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            {employee.first_name} {employee.last_name}
          </h1>
          <p className="text-muted-foreground">{employee.companies?.name}</p>
        </div>

        {/* Live Clock */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Clock className="h-16 w-16 mx-auto text-primary" />
              <div className="text-6xl font-bold tabular-nums">
                {format(currentTime, 'HH:mm:ss')}
              </div>
              <div className="text-lg text-muted-foreground">
                {format(currentTime, 'EEEE, MMMM d, yyyy')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Status</span>
              {currentEntry ? (
                <Badge className="bg-green-500">Clocked In</Badge>
              ) : (
                <Badge variant="secondary">Clocked Out</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentEntry && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Clock In Time:</span>
                  <span className="font-medium">
                    {format(new Date(currentEntry.clock_in), 'h:mm a')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Hours Today:</span>
                  <span className="font-medium text-primary">
                    {calculateHoursToday().toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Clock In/Out Button */}
            {currentEntry ? (
              <Button
                onClick={handleClockOut}
                className="w-full h-20 text-xl"
                variant="destructive"
              >
                <LogOut className="mr-3 h-8 w-8" />
                Clock Out
              </Button>
            ) : (
              <Button
                onClick={handleClockIn}
                className="w-full h-20 text-xl"
              >
                <LogIn className="mr-3 h-8 w-8" />
                Clock In
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Pay Info */}
        {employee.rate_type && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Pay Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate Type:</span>
                  <span className="font-medium capitalize">{employee.rate_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate:</span>
                  <span className="font-medium text-primary">
                    ${(() => {
                      const rate = employee.rate_type === 'hourly' 
                        ? employee.hourly_rate
                        : employee.rate_type === 'weekly'
                        ? employee.weekly_rate
                        : employee.biweekly_rate;
                      return rate?.toFixed(2) || '0.00';
                    })()}
                    /{employee.rate_type === 'hourly' ? 'hr' : employee.rate_type}
                  </span>
                </div>
                {currentEntry && employee.rate_type === 'hourly' && (
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-muted-foreground">Today's Earnings:</span>
                    <span className="font-bold text-lg text-primary">
                      ${(calculateHoursToday() * (employee.hourly_rate || 0)).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
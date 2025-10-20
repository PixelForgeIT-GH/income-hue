import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Clock, DollarSign, TrendingUp, Plus, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/hooks/useCompany";
import { useEmployees } from "@/hooks/useEmployees";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { format, startOfWeek, endOfWeek } from "date-fns";

export const SupervisorDashboard = () => {
  const { user } = useAuth();
  const { company } = useCompany(user?.id);
  const { employees } = useEmployees(company?.id);
  const { timeEntries } = useTimeEntries(company?.id);
  const [activeTab, setActiveTab] = useState("overview");

  const activeEmployees = employees.filter(e => e.is_active);
  const clockedInEmployees = employees.filter(e => 
    timeEntries.some(te => te.employee_id === e.id && !te.clock_out)
  );

  const calculateWeeklyHours = () => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    
    return timeEntries
      .filter(entry => {
        const entryDate = new Date(entry.clock_in);
        return entryDate >= weekStart && entryDate <= weekEnd;
      })
      .reduce((sum, entry) => sum + (entry.hours_worked || 0), 0);
  };

  const calculateWeeklyCost = () => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    
    return timeEntries
      .filter(entry => {
        const entryDate = new Date(entry.clock_in);
        return entryDate >= weekStart && entryDate <= weekEnd;
      })
      .reduce((sum, entry) => {
        const employee = employees.find(e => e.id === entry.employee_id);
        if (!employee || !entry.hours_worked) return sum;
        
        const hourlyRate = employee.rate_type === 'hourly' 
          ? employee.hourly_rate || 0
          : employee.rate_type === 'weekly'
          ? (employee.weekly_rate || 0) / 40
          : (employee.biweekly_rate || 0) / 80;
        
        return sum + (entry.hours_worked * hourlyRate);
      }, 0);
  };

  const exportTimesheet = () => {
    // Create CSV content
    const headers = ['Employee', 'Date', 'Clock In', 'Clock Out', 'Hours', 'Rate', 'Cost'];
    const rows = timeEntries.map(entry => {
      const employee = employees.find(e => e.id === entry.employee_id);
      const rate = employee?.hourly_rate || 0;
      const cost = (entry.hours_worked || 0) * rate;
      
      return [
        `${employee?.first_name} ${employee?.last_name}`,
        format(new Date(entry.clock_in), 'yyyy-MM-dd'),
        format(new Date(entry.clock_in), 'HH:mm'),
        entry.clock_out ? format(new Date(entry.clock_out), 'HH:mm') : 'In Progress',
        entry.hours_worked?.toFixed(2) || '-',
        rate.toFixed(2),
        cost.toFixed(2)
      ];
    });
    
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timesheet-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Supervisor Dashboard</h1>
            <p className="text-muted-foreground">{company?.name}</p>
          </div>
          <Button onClick={exportTimesheet} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                  <p className="text-3xl font-bold">{activeEmployees.length}</p>
                </div>
                <Users className="h-10 w-10 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Clocked In</p>
                  <p className="text-3xl font-bold text-green-500">
                    {clockedInEmployees.length}
                  </p>
                </div>
                <Clock className="h-10 w-10 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Week Hours</p>
                  <p className="text-3xl font-bold">{calculateWeeklyHours().toFixed(1)}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Week Cost</p>
                  <p className="text-3xl font-bold">${calculateWeeklyCost().toFixed(2)}</p>
                </div>
                <DollarSign className="h-10 w-10 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="timesheet">Timesheet</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Currently Clocked In</CardTitle>
              </CardHeader>
              <CardContent>
                {clockedInEmployees.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No employees currently clocked in
                  </p>
                ) : (
                  <div className="space-y-3">
                    {clockedInEmployees.map(employee => {
                      const entry = timeEntries.find(
                        te => te.employee_id === employee.id && !te.clock_out
                      );
                      const hoursToday = entry 
                        ? ((new Date().getTime() - new Date(entry.clock_in).getTime()) / (1000 * 60 * 60)).toFixed(2)
                        : '0.00';

                      return (
                        <div key={employee.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">
                              {employee.first_name} {employee.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Since {entry ? format(new Date(entry.clock_in), 'h:mm a') : '-'}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-green-500 mb-1">Active</Badge>
                            <p className="text-sm font-medium">{hoursToday} hrs</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Employee List</CardTitle>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Employee
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeEmployees.map(employee => (
                    <div key={employee.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">
                          {employee.first_name} {employee.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={employee.role === 'supervisor' ? 'default' : 'secondary'}>
                          {employee.role}
                        </Badge>
                        {employee.rate_type && (
                          <p className="text-sm mt-1">
                            ${employee[`${employee.rate_type}_rate`]}/{employee.rate_type}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timesheet">
            <Card>
              <CardHeader>
                <CardTitle>Recent Time Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {timeEntries.slice(0, 10).map(entry => {
                    const employee = employees.find(e => e.id === entry.employee_id);
                    return (
                      <div key={entry.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">
                            {employee?.first_name} {employee?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(entry.clock_in), 'MMM d, h:mm a')} - 
                            {entry.clock_out ? format(new Date(entry.clock_out), 'h:mm a') : 'In Progress'}
                          </p>
                        </div>
                        <div className="text-right">
                          {entry.hours_worked ? (
                            <>
                              <p className="font-medium">{entry.hours_worked.toFixed(2)} hrs</p>
                              <p className="text-sm text-muted-foreground">
                                ${((entry.hours_worked || 0) * (employee?.hourly_rate || 0)).toFixed(2)}
                              </p>
                            </>
                          ) : (
                            <Badge className="bg-green-500">Active</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
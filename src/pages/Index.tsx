import { useState } from "react";
import { TabNavigation } from "@/components/navigation/TabNavigation";
import { IncomeTab } from "./IncomeTab";
import { DashboardTab } from "./DashboardTab";
import { ExpensesTab } from "./ExpensesTab";
import { TransactionsTab } from "./TransactionsTab";
import { BankConnectionsTab } from "./BankConnectionsTab";
import { AuthPage } from "./AuthPage";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { useIncomeStreams } from "@/hooks/useIncomeStreams";
import { useExpenses } from "@/hooks/useExpenses";
import { useTransactions } from "@/hooks/useTransactions";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, loading: authLoading, signOut, isAuthenticated } = useAuth();
  const { 
    incomeStreams, 
    addIncomeStream, 
    updateIncomeStream, 
    deleteIncomeStream 
  } = useIncomeStreams(user?.id);
  const { 
    expenses, 
    addExpense, 
    updateExpense, 
    deleteExpense 
  } = useExpenses(user?.id);
  const { 
    transactions, 
    loading: transactionsLoading,
    addTransaction, 
    updateTransaction, 
    deleteTransaction,
    refetch: refetchTransactions
  } = useTransactions(user?.id);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      setActiveTab("dashboard");
    }
  };

  const handleAuthSuccess = () => {
    // Auth state will be updated automatically via useAuth hook
    // Set initial tab for new users
    setActiveTab("income");
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "income":
        return (
          <IncomeTab
            streams={incomeStreams}
            onAddStream={addIncomeStream}
            onEditStream={updateIncomeStream}
            onDeleteStream={deleteIncomeStream}
          />
        );
      case "expenses":
        return <ExpensesTab />;
      case "transactions":
        return (
          <TransactionsTab 
            transactions={transactions}
            loading={transactionsLoading}
            onAddTransaction={addTransaction}
            onUpdateTransaction={updateTransaction}
            onDeleteTransaction={deleteTransaction}
          />
        );
      case "banks":
        return <BankConnectionsTab onTransactionsImported={refetchTransactions} />;
      case "dashboard":
      default:
        return (
          <DashboardTab
            streams={incomeStreams}
            expenses={expenses}
            transactions={transactions}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <ThemeToggle />
        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground truncate max-w-[120px]">
            {user?.email}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="container mx-auto px-4 py-6">
        {renderActiveTab()}
      </div>
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;

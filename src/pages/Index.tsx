import { useState } from "react";
import { TabNavigation } from "@/components/navigation/TabNavigation";
import { ProfileMenu } from "@/components/navigation/ProfileMenu";
import { IncomeTab } from "./IncomeTab";
import { DashboardTab } from "./DashboardTab";
import { ExpensesTab } from "./ExpensesTab";
import { TransactionsTab } from "./TransactionsTab";
import { ProfilePage } from "./ProfilePage";
import { AuthPage } from "./AuthPage";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { useIncomeStreams } from "@/hooks/useIncomeStreams";
import { useExpenses } from "@/hooks/useExpenses";
import { useTransactions } from "@/hooks/useTransactions";

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
      case "profile":
        return <ProfilePage onTransactionsImported={refetchTransactions} />;
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
        <ProfileMenu 
          onNavigateToProfile={() => setActiveTab("profile")}
          onNavigateToPlaid={() => setActiveTab("profile")}
        />
      </div>
      <div className="container mx-auto px-4 py-6">
        {renderActiveTab()}
      </div>
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;

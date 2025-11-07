import { useState } from "react";
import { TabNavigation } from "@/components/navigation/TabNavigation";
import { ProfileMenu } from "@/components/navigation/ProfileMenu";
import { IncomeTab } from "./IncomeTab";
import { DashboardTab } from "./DashboardTab";
import { ExpensesTab } from "./ExpensesTab";
import { TransactionsTab } from "./TransactionsTab";
import { BankConnectionsPage } from "./BankConnectionsPage";
import { SettingsPage } from "./SettingsPage";
import { AuthPage } from "./AuthPage";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { useIncomeStreams } from "@/hooks/useIncomeStreams";
import { useExpenses } from "@/hooks/useExpenses";
import { useTransactions } from "@/hooks/useTransactions";
import { useThemeCustomization } from "@/hooks/useThemeCustomization";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionBanner } from "@/components/subscription/SubscriptionBanner";
import { FeatureGate } from "@/components/subscription/FeatureGate";
import { useSupervisorStatus } from "@/hooks/useSupervisorStatus";
import { BusinessPortal } from "./business/BusinessPortal";
import { Button } from "@/components/ui/button";
import { Briefcase, Wallet } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [viewMode, setViewMode] = useState<"personal" | "business">("personal");
  const { user, loading: authLoading, signOut, isAuthenticated } = useAuth();
  useThemeCustomization(); // Apply custom theme colors
  const { isPro, isFree, loading: subLoading } = useSubscription(user?.id);
  const { isSupervisor, loading: supervisorLoading } = useSupervisorStatus(user?.id);
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
  if (authLoading || supervisorLoading) {
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

  const showModeToggle = isSupervisor && isPro;

  if (showModeToggle && viewMode === "business") {
    return <BusinessPortal />;
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
            isPro={isPro}
          />
        );
      case "expenses":
        return <ExpensesTab />;
      case "transactions":
        return (
          <FeatureGate isPro={isPro} featureName="Manual Transactions">
            <TransactionsTab 
              transactions={transactions}
              loading={transactionsLoading}
              onAddTransaction={addTransaction}
              onUpdateTransaction={updateTransaction}
              onDeleteTransaction={deleteTransaction}
            />
          </FeatureGate>
        );
      case "banks":
        return (
          <FeatureGate isPro={isPro} featureName="Bank Account Linking">
            <BankConnectionsPage onTransactionsImported={refetchTransactions} />
          </FeatureGate>
        );
      case "settings":
        return <SettingsPage />;
      case "dashboard":
      default:
        return (
          <>
            {isFree && !subLoading && <SubscriptionBanner />}
            <DashboardTab
              streams={incomeStreams}
              expenses={expenses}
              transactions={transactions}
            />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {showModeToggle && (
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <Button
              variant={viewMode === "personal" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("personal")}
              className="gap-2"
            >
              <Wallet className="h-4 w-4" />
              Personal
            </Button>
            <Button
              variant={viewMode === "business" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("business")}
              className="gap-2"
            >
              <Briefcase className="h-4 w-4" />
              Business
            </Button>
          </div>
        )}
        <ThemeToggle />
        <ProfileMenu 
          onNavigateToSettings={() => setActiveTab("settings")}
          onNavigateToBanks={() => setActiveTab("banks")}
          isPro={isPro}
        />
      </div>
      <div className="container mx-auto px-4 py-6">
        {renderActiveTab()}
      </div>
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} isPro={isPro} />
    </div>
  );
};

export default Index;

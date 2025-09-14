import { useState, useEffect } from "react";
import { TabNavigation } from "@/components/navigation/TabNavigation";
import { IncomeTab } from "./IncomeTab";
import { DashboardTab } from "./DashboardTab";
import { ExpensesTab } from "./ExpensesTab";
import { IncomeStreamData } from "@/components/income/IncomeStream";
import { ExpenseData } from "@/components/expenses/ExpenseItem";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [incomeStreams, setIncomeStreams] = useState<IncomeStreamData[]>([]);
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const { toast } = useToast();

  // Check if user has data on first load
  useEffect(() => {
    const savedStreams = localStorage.getItem("financeflow-income-streams");
    const savedExpenses = localStorage.getItem("financeflow-expenses");
    const hasVisited = localStorage.getItem("financeflow-visited");

    if (savedStreams) {
      try {
        const parsed = JSON.parse(savedStreams);
        const streamsWithDates = parsed.map((stream: any) => ({
          ...stream,
          lastPaidDate: new Date(stream.lastPaidDate),
        }));
        setIncomeStreams(streamsWithDates);
      } catch (error) {
        console.error("Error loading income streams:", error);
      }
    }

    if (savedExpenses) {
      try {
        setExpenses(JSON.parse(savedExpenses));
      } catch (error) {
        console.error("Error loading expenses:", error);
      }
    }

    if (hasVisited) {
      setIsFirstTime(false);
    } else {
      localStorage.setItem("financeflow-visited", "true");
      setActiveTab("income");
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem("financeflow-income-streams", JSON.stringify(incomeStreams));
  }, [incomeStreams]);

  useEffect(() => {
    localStorage.setItem("financeflow-expenses", JSON.stringify(expenses));
  }, [expenses]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleAddIncomeStream = (streamData: Omit<IncomeStreamData, "id">) => {
    const newStream = { ...streamData, id: generateId() };
    setIncomeStreams(prev => [...prev, newStream]);
    toast({
      title: "Income stream added",
      description: `${streamData.name} has been added to your income streams.`,
    });
  };

  const handleEditIncomeStream = (updatedStream: IncomeStreamData) => {
    setIncomeStreams(prev => 
      prev.map(stream => stream.id === updatedStream.id ? updatedStream : stream)
    );
    toast({
      title: "Income stream updated",
      description: `${updatedStream.name} has been updated.`,
    });
  };

  const handleDeleteIncomeStream = (id: string) => {
    const stream = incomeStreams.find(s => s.id === id);
    setIncomeStreams(prev => prev.filter(stream => stream.id !== id));
    toast({
      title: "Income stream deleted",
      description: `${stream?.name} has been removed.`,
    });
  };

  const handleAddExpense = (expenseData: Omit<ExpenseData, "id">) => {
    const newExpense = { ...expenseData, id: generateId() };
    setExpenses(prev => [...prev, newExpense]);
    toast({
      title: "Expense added",
      description: `${expenseData.name} has been added to your expenses.`,
    });
  };

  const handleEditExpense = (updatedExpense: ExpenseData) => {
    setExpenses(prev => 
      prev.map(expense => expense.id === updatedExpense.id ? updatedExpense : expense)
    );
    toast({
      title: "Expense updated",
      description: `${updatedExpense.name} has been updated.`,
    });
  };

  const handleDeleteExpense = (id: string) => {
    const expense = expenses.find(e => e.id === id);
    setExpenses(prev => prev.filter(expense => expense.id !== id));
    toast({
      title: "Expense deleted",
      description: `${expense?.name} has been removed.`,
    });
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "income":
        return (
          <IncomeTab
            streams={incomeStreams}
            onAddStream={handleAddIncomeStream}
            onEditStream={handleEditIncomeStream}
            onDeleteStream={handleDeleteIncomeStream}
          />
        );
      case "expenses":
        return (
          <ExpensesTab
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        );
      case "dashboard":
      default:
        return (
          <DashboardTab
            streams={incomeStreams}
            expenses={expenses}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderActiveTab()}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;

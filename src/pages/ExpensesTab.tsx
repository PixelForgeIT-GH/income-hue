import { Card } from "@/components/ui/card";
import { TrendingDown, Receipt, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseItem } from "@/components/expenses/ExpenseItem";
import { ExpenseForm } from "@/components/forms/ExpenseForm";
import { useExpenses } from "@/hooks/useExpenses";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export const ExpensesTab = () => {
  const { user } = useAuth();
  const { expenses, loading, addExpense, updateExpense, deleteExpense } = useExpenses(user?.id);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(undefined);

  // Calculate monthly totals from recurring expenses
  const calculateMonthlyExpenses = () => {
    return expenses.reduce((total, expense) => {
      const monthlyAmount = (() => {
        switch (expense.frequency) {
          case "weekly":
            return expense.amount * 4.33;
          case "yearly":
            return expense.amount / 12;
          case "monthly":
          default:
            return expense.amount;
        }
      })();
      return total + monthlyAmount;
    }, 0);
  };

  const totalMonthlyExpenses = calculateMonthlyExpenses();

  const handleSubmit = async (expenseData) => {
    try {
      if (editingExpense) {
        await updateExpense({ ...expenseData, id: editingExpense.id, user_id: user!.id });
      } else {
        await addExpense(expenseData);
      }
      setShowForm(false);
      setEditingExpense(undefined);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingExpense(undefined);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to view expenses</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header with Totals */}
      <Card className="p-6 shadow-card border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="text-primary" size={24} />
            Recurring Expenses
          </h2>
          <Button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Expense
          </Button>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingDown className="text-expense" size={20} />
            <span className="text-sm font-medium text-muted-foreground">Monthly Expenses</span>
          </div>
          <p className="text-2xl font-bold text-expense">
            ${totalMonthlyExpenses.toFixed(2)}
          </p>
        </div>
      </Card>

      {showForm && (
        <ExpenseForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          expense={editingExpense}
        />
      )}

      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Loading expenses...</p>
        </Card>
      ) : expenses.length === 0 ? (
        <Card className="p-8 text-center space-y-4">
          <Receipt size={64} className="mx-auto text-muted-foreground/50" />
          <div>
            <p className="text-lg font-medium">No recurring expenses yet</p>
            <p className="text-muted-foreground">Add your monthly bills and recurring costs</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="mt-4">
            <Plus size={16} className="mr-2" />
            Add Your First Expense
          </Button>
        </Card>
      ) : (
        <Card className="p-6 shadow-card border-border/50">
          <h3 className="text-lg font-semibold mb-4">Your Recurring Expenses</h3>
          <div className="space-y-3">
            {expenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                onEdit={handleEdit}
                onDelete={deleteExpense}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
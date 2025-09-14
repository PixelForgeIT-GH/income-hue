import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ExpenseItem, ExpenseData } from "@/components/expenses/ExpenseItem";
import { ExpenseForm } from "@/components/forms/ExpenseForm";

interface ExpensesTabProps {
  expenses: ExpenseData[];
  onAddExpense: (expense: Omit<ExpenseData, "id">) => Promise<{ error: any } | undefined>;
  onEditExpense: (expense: ExpenseData) => Promise<{ error: any } | undefined>;
  onDeleteExpense: (id: string) => Promise<{ error: any } | undefined>;
}

export const ExpensesTab = ({ expenses, onAddExpense, onEditExpense, onDeleteExpense }: ExpensesTabProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseData | null>(null);

  const handleSubmit = async (expenseData: Omit<ExpenseData, "id"> & { id?: string }) => {
    let result;
    if (expenseData.id) {
      // Editing existing expense
      result = await onEditExpense(expenseData as ExpenseData);
    } else {
      // Adding new expense
      result = await onAddExpense(expenseData);
    }
    
    if (!result?.error) {
      setShowForm(false);
      setEditingExpense(null);
    }
    
    return result;
  };

  const handleEdit = (expense: ExpenseData) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  // Calculate total monthly expenses
  const totalMonthlyExpenses = expenses.reduce((total, expense) => {
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

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Monthly Expenses</h1>
            <p className="text-muted-foreground">
              Track your recurring expenses
              {expenses.length > 0 && (
                <span className="block text-sm font-medium text-expense mt-1">
                  Total: ${totalMonthlyExpenses.toFixed(0)}/month
                </span>
              )}
            </p>
          </div>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-secondary hover:opacity-90 text-secondary-foreground shadow-soft"
            >
              <Plus size={20} className="mr-2" />
              Add Expense
            </Button>
          )}
        </div>

        {showForm && (
          <div className="mb-6">
            <ExpenseForm
              expense={editingExpense || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        )}

        {expenses.length === 0 && !showForm ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus size={24} className="text-secondary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Expenses Yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your recurring expenses to get a complete financial picture
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-secondary hover:opacity-90 text-secondary-foreground"
            >
              Add First Expense
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                onEdit={handleEdit}
                onDelete={onDeleteExpense}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
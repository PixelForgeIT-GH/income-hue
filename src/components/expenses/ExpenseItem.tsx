import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2, Calendar } from "lucide-react";

export interface ExpenseData {
  id: string;
  name: string;
  amount: number;
  frequency: "weekly" | "monthly" | "yearly";
  start_date: string; // ISO date string
}

interface ExpenseItemProps {
  expense: ExpenseData;
  onEdit: (expense: ExpenseData) => void;
  onDelete: (id: string) => void;
}

export const ExpenseItem = ({ expense, onEdit, onDelete }: ExpenseItemProps) => {
  // Normalize to monthly amount for comparison
  const getMonthlyAmount = (amount: number, frequency: string): number => {
    switch (frequency) {
      case "weekly":
        return amount * 4.33; // Average weeks per month
      case "yearly":
        return amount / 12;
      case "monthly":
      default:
        return amount;
    }
  };

  const monthlyAmount = getMonthlyAmount(expense.amount, expense.frequency);

  return (
    <Card className="p-4 shadow-card hover:shadow-soft transition-all duration-300 border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-card-foreground text-lg">{expense.name}</h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-expense text-lg">
              ${expense.amount.toLocaleString()}
            </span>
            <span className="capitalize">{expense.frequency}</span>
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>Starts {new Date(expense.start_date).toLocaleDateString()}</span>
            </div>
          </div>
          {expense.frequency !== "monthly" && (
            <div className="flex items-center gap-2 mt-1">
              <Calendar size={14} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                ≈ ${monthlyAmount.toFixed(0)}/month
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(expense)}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <Edit3 size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(expense.id)}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
};
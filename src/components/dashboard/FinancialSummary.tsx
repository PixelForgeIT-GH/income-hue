import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface FinancialSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export const FinancialSummary = ({ totalIncome, totalExpenses, balance }: FinancialSummaryProps) => {
  const isPositive = balance >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4 shadow-card border-border/50 bg-gradient-to-br from-income/10 to-income/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Income</p>
            <p className="text-2xl font-bold text-income">
              ${totalIncome.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-income/20 rounded-full">
            <TrendingUp className="h-6 w-6 text-income" />
          </div>
        </div>
      </Card>

      <Card className="p-4 shadow-card border-border/50 bg-gradient-to-br from-expense/10 to-expense/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
            <p className="text-2xl font-bold text-expense">
              ${totalExpenses.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-expense/20 rounded-full">
            <TrendingDown className="h-6 w-6 text-expense" />
          </div>
        </div>
      </Card>

      <Card className={`p-4 shadow-card border-border/50 ${
        isPositive 
          ? "bg-gradient-to-br from-balance/10 to-balance/5" 
          : "bg-gradient-to-br from-destructive/10 to-destructive/5"
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Balance</p>
            <p className={`text-2xl font-bold ${
              isPositive ? "text-balance" : "text-destructive"
            }`}>
              ${Math.abs(balance).toLocaleString()}
            </p>
            {!isPositive && (
              <p className="text-xs text-destructive font-medium">Deficit</p>
            )}
          </div>
          <div className={`p-3 rounded-full ${
            isPositive ? "bg-balance/20" : "bg-destructive/20"
          }`}>
            <DollarSign className={`h-6 w-6 ${
              isPositive ? "text-balance" : "text-destructive"
            }`} />
          </div>
        </div>
      </Card>
    </div>
  );
};
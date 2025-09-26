import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface FinancialSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionIncome: number;
  transactionExpenses: number;
}

export const FinancialSummary = ({ totalIncome, totalExpenses, balance, transactionIncome, transactionExpenses }: FinancialSummaryProps) => {
  const isPositive = balance >= 0;

  return (
    <div className="space-y-6">
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

      {(transactionIncome > 0 || transactionExpenses > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 shadow-card border-border/50 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transaction Income</p>
                <p className="text-xl font-bold text-blue-600">
                  ${transactionIncome.toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-full">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 shadow-card border-border/50 bg-gradient-to-br from-blue-600/10 to-blue-600/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transaction Expenses</p>
                <p className="text-xl font-bold text-blue-700">
                  ${transactionExpenses.toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-blue-600/20 rounded-full">
                <TrendingDown className="h-5 w-5 text-blue-700" />
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>

  );
};
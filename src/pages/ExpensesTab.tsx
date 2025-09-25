import { Card } from "@/components/ui/card";
import { TrendingDown, Receipt } from "lucide-react";
import { TransactionData } from "@/hooks/useTransactions";

interface ExpensesTabProps {
  transactions: TransactionData[];
}

export const ExpensesTab = ({ transactions }: ExpensesTabProps) => {
  // Calculate totals from transactions
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="space-y-6 pb-24">
      {/* Header with Totals */}
      <Card className="p-6 shadow-card border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="text-primary" size={24} />
            Expense Summary
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingDown className="text-expense" size={20} />
              <span className="text-sm font-medium text-muted-foreground">Total Expenses</span>
            </div>
            <p className="text-2xl font-bold text-expense">
              ${totalExpenses.toFixed(2)}
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-sm font-medium text-muted-foreground">Net Balance</span>
            </div>
            <p className={`text-2xl font-bold ${
              netBalance >= 0 ? 'text-income' : 'text-expense'
            }`}>
              ${netBalance.toFixed(2)}
            </p>
          </div>
        </div>
      </Card>

      {transactions.length === 0 ? (
        <Card className="p-8 text-center space-y-4">
          <Receipt size={64} className="mx-auto text-muted-foreground/50" />
          <div>
            <p className="text-lg font-medium">No transactions yet</p>
            <p className="text-muted-foreground">Go to the Transactions tab to add your first transaction</p>
          </div>
        </Card>
      ) : (
        <Card className="p-6 shadow-card border-border/50">
          <h3 className="text-lg font-semibold mb-4">Recent Expenses</h3>
          <div className="space-y-3">
            {transactions
              .filter(t => t.type === 'expense')
              .slice(0, 10)
              .map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="font-medium">{transaction.name}</p>
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                  </div>
                  <p className="text-expense font-semibold">${transaction.amount.toFixed(2)}</p>
                </div>
              ))
            }
          </div>
        </Card>
      )}
    </div>
  );
};
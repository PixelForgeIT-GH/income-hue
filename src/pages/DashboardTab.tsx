import { SimpleFinancialChart } from "@/components/dashboard/SimpleFinancialChart";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { IncomeStreamData } from "@/components/income/IncomeStream";
import { ExpenseData } from "@/components/expenses/ExpenseItem";

interface DashboardTabProps {
  streams: IncomeStreamData[];
  expenses: ExpenseData[];
}

export const DashboardTab = ({ streams, expenses }: DashboardTabProps) => {
  // Calculate monthly income from all streams
  const calculateMonthlyIncome = () => {
    return streams.reduce((total, stream) => {
      const monthlyAmount = (() => {
        switch (stream.frequency) {
          case "weekly":
            return stream.amount * 4.33; // Average weeks per month
          case "biweekly":
            return stream.amount * 2.17; // Average bi-weeks per month
          case "monthly":
          default:
            return stream.amount;
        }
      })();
      return total + monthlyAmount;
    }, 0);
  };

  // Calculate monthly expenses
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

  const totalIncome = calculateMonthlyIncome();
  const totalExpenses = calculateMonthlyExpenses();
  const balance = totalIncome - totalExpenses;

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Financial Dashboard</h1>
          <p className="text-muted-foreground">Your finances at a glance</p>
        </div>

        {streams.length === 0 && expenses.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Welcome to FinanceFlow!</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Add your income streams and expenses to see your complete financial picture with beautiful charts and insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2">
                💰 Start with Income tab
              </div>
              <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2">
                💳 Then add Expenses
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <FinancialSummary
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              balance={balance}
            />

            {totalIncome > 0 || totalExpenses > 0 ? (
              <SimpleFinancialChart
                income={totalIncome}
                expenses={totalExpenses}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Add income streams and expenses to see your financial overview chart
                </p>
              </div>
            )}

            {streams.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card rounded-lg p-6 shadow-card border-border/50">
                  <h3 className="text-lg font-semibold text-card-foreground mb-4">Income Streams</h3>
                  <div className="space-y-3">
                    {streams.map((stream) => (
                      <div key={stream.id} className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{stream.name}</span>
                        <span className="text-sm font-medium text-income">
                          ${stream.amount.toLocaleString()}/{stream.frequency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {expenses.length > 0 && (
                  <div className="bg-card rounded-lg p-6 shadow-card border-border/50">
                    <h3 className="text-lg font-semibold text-card-foreground mb-4">Top Expenses</h3>
                    <div className="space-y-3">
                      {expenses.slice(0, 5).map((expense) => (
                        <div key={expense.id} className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{expense.name}</span>
                          <span className="text-sm font-medium text-expense">
                            ${expense.amount.toLocaleString()}/{expense.frequency}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
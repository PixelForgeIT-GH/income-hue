// DashboardTab.tsx
import { SimpleFinancialChart } from "@/components/dashboard/SimpleFinancialChart";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { IncomeStreamData } from "@/components/income/IncomeStream";
import { ExpenseData } from "@/components/expenses/ExpenseItem";
import { TransactionData } from "@/hooks/useTransactions";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Wallet } from "lucide-react";
import { usePlaidBalances } from "@/hooks/usePlaidBalances";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  isAfter,
  isBefore,
  isSameMonth,
  addDays,
  lastDayOfMonth,
  setDate,
  getDate,
  startOfDay,
} from "date-fns";

interface DashboardTabProps {
  streams: IncomeStreamData[];
  expenses: ExpenseData[];
  transactions: TransactionData[];
}

// --- helpers ---------------------------------------------------------

// Make comparisons date-only (avoid DST / time drift)
const asDateOnly = (d: Date) => startOfDay(d);

// Normalize incoming frequency strings to one of: "weekly" | "biweekly" | "monthly"
const normalizeFrequency = (raw: string): "weekly" | "biweekly" | "monthly" => {
  const s = (raw || "").toString().trim().toLowerCase().replace(/\s|_/g, "");
  if (["w", "wk", "week", "weekly"].includes(s)) return "weekly";
  if (["biweekly", "bi-weekly", "biweek", "fortnightly", "everytwoweeks", "2w"].includes(s)) return "biweekly";
  if (["m", "mo", "mon", "month", "monthly"].includes(s)) return "monthly";
  // fallback: assume monthly rather than miscount
  return "monthly";
};

// Count how many times a stream pays within a specific month, based on anchor + frequency
const occurrencesInMonth = (stream: IncomeStreamData, month: Date): number => {
  const freq = normalizeFrequency((stream as any).frequency);
  const monthStart = asDateOnly(startOfMonth(month));
  const monthEnd = asDateOnly(endOfMonth(month));
  const anchor = asDateOnly(stream.lastPaidDate);

  if (isAfter(anchor, monthEnd)) return 0;

  if (freq === "monthly") {
    const day = getDate(anchor);
    const lastDayNum = getDate(lastDayOfMonth(month));
    const candidate = asDateOnly(setDate(monthStart, Math.min(day, lastDayNum)));
    return isBefore(candidate, anchor) ? 0 : 1;
  }

  // weekly / biweekly
  const stepDays = freq === "weekly" ? 7 : 14;

  // find first occurrence on/after monthStart
  let first = new Date(anchor);
  while (isBefore(first, monthStart)) {
    first = addDays(first, stepDays);
  }
  first = asDateOnly(first);

  if (isAfter(first, monthEnd)) return 0;

  let count = 0;
  for (let d = first; !isAfter(d, monthEnd); d = asDateOnly(addDays(d, stepDays))) {
    if (!isBefore(d, anchor)) count += 1;
  }
  return count;
};

// --------------------------------------------------------------------

export const DashboardTab = ({ streams, expenses, transactions }: DashboardTabProps) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { user } = useAuth();
  const { accounts, totalBalance, loading: balancesLoading } = usePlaidBalances(user?.id);

  // Month navigation
  const goToPreviousMonth = () => setSelectedMonth((prev) => subMonths(prev, 1));
  const goToNextMonth = () => setSelectedMonth((prev) => addMonths(prev, 1));
  const goToCurrentMonth = () => setSelectedMonth(new Date());

  // Expenses active in selected month
  const getActiveExpensesForMonth = (month: Date) => {
    const monthStart = startOfMonth(month);
    return expenses.filter((expense) => {
      const expenseStartDate = new Date(expense.start_date);
      return !isAfter(expenseStartDate, monthStart);
    });
  };

  // Income for selected month using actual occurrences
  const calculateMonthlyIncome = (month: Date) => {
    return streams.reduce((total, stream) => {
      const n = occurrencesInMonth(
        { ...stream, frequency: normalizeFrequency((stream as any).frequency) } as IncomeStreamData,
        month
      );
      return total + n * stream.amount;
    }, 0);
  };

  // Expenses (kept as average rules for now)
  const calculateMonthlyExpenses = () => {
    const activeExpenses = getActiveExpensesForMonth(selectedMonth);
    return activeExpenses.reduce((total, expense) => {
      const s = (expense.frequency || "").toLowerCase();
      const monthlyAmount =
        s === "weekly"
          ? expense.amount * 4.33
          : s === "yearly"
          ? expense.amount / 12
          : expense.amount;
      return total + monthlyAmount;
    }, 0);
  };

  // Transactions scoped to selected month
  const selectedMonthTransactions = transactions.filter((t) =>
    isSameMonth(new Date(t.date), selectedMonth)
  );

  const transactionIncome = selectedMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const transactionExpenses = selectedMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Month-aware totals
  const totalIncome = calculateMonthlyIncome(selectedMonth);
  const totalExpenses = calculateMonthlyExpenses();

  // Balance & chart inputs
  const balance = totalIncome + transactionIncome - totalExpenses - transactionExpenses;
  const combinedIncome = totalIncome + transactionIncome;

  // (optional) recent transactions if you show them elsewhere
  // const sortedTransactions = [...transactions].sort(
  //   (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  // );

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Financial Dashboard</h1>
              <p className="text-muted-foreground">Your finances at a glance</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth} className="p-2">
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="text-center min-w-[140px]">
                <div className="text-lg font-semibold text-foreground">
                  {format(selectedMonth, "MMMM yyyy")}
                </div>
                {!isSameMonth(selectedMonth, new Date()) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToCurrentMonth}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Go to current month
                  </Button>
                )}
              </div>

              <Button variant="outline" size="sm" onClick={goToNextMonth} className="p-2">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {streams.length === 0 && expenses.length === 0 && transactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Welcome to FinanceFlow!</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Add your income streams, expenses, and transactions to see your complete financial
              picture with beautiful charts and insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2">
                💰 Start with Income tab
              </div>
              <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2">
                💳 Add Expenses
              </div>
              <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2">
                🧾 Track Transactions
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {accounts.length > 0 && (
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 border border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Connected Banks</h3>
                    <p className="text-sm text-muted-foreground">{accounts.length} account(s) connected</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground">
                  ${totalBalance.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Total bank balance</p>
              </div>
            )}

            <FinancialSummary
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              balance={balance}
              transactionIncome={transactionIncome}
              transactionExpenses={transactionExpenses}
            />

            {combinedIncome > 0 || totalExpenses > 0 || transactionExpenses > 0 ? (
              <SimpleFinancialChart
                income={combinedIncome}
                expenses={totalExpenses}
                transactions={transactionExpenses}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Add income streams, expenses, and transactions to see your financial overview chart
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {streams.length > 0 && (
                <div className="bg-card rounded-lg p-6 shadow-card border-border/50">
                  <h3 className="text-lg font-semibold text-card-foreground mb-4">Income Streams</h3>
                  <div className="space-y-3">
                    {streams.map((stream) => (
                      <div key={stream.id} className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{stream.name}</span>
                        <span className="text-sm font-medium text-income">
                          ${stream.amount.toLocaleString()}/
                          {normalizeFrequency((stream as any).frequency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {getActiveExpensesForMonth(selectedMonth).length > 0 && (
                <div className="bg-card rounded-lg p-6 shadow-card border-border/50">
                  <h3 className="text-lg font-semibold text-card-foreground mb-4">
                    Active Expenses ({format(selectedMonth, "MMM yyyy")})
                  </h3>
                  <div className="space-y-3">
                    {getActiveExpensesForMonth(selectedMonth)
                      .slice(0, 5)
                      .map((expense) => (
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

              {selectedMonthTransactions.length > 0 && (
                <div className="bg-card rounded-lg p-6 shadow-card border-border/50">
                  <h3 className="text-lg font-semibold text-card-foreground mb-4">
                    Transactions ({format(selectedMonth, "MMM yyyy")})
                  </h3>
                  <div className="space-y-3">
                    {selectedMonthTransactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">{transaction.name}</span>
                          <span className="text-xs text-muted-foreground/70">
                            {new Date(transaction.date).toLocaleDateString()}
                          </span>
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            transaction.type === "income" ? "text-income" : "text-expense"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}$
                          {transaction.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

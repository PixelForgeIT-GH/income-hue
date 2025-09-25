import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Receipt, TrendingDown, TrendingUp } from "lucide-react";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import { CategoryManager } from "@/components/categories/CategoryManager";
import { useTransactions, TransactionData } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const TransactionsTab = () => {
  const { user } = useAuth();
  const { transactions, loading: transactionsLoading, addTransaction, updateTransaction, deleteTransaction } = useTransactions(user?.id);
  const { categories, loading: categoriesLoading, addCategory, deleteCategory } = useCategories(user?.id);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionData | undefined>();

  const handleSubmit = (transactionData: Omit<TransactionData, 'id' | 'user_id'>) => {
    if (editingTransaction) {
      updateTransaction({ ...transactionData, id: editingTransaction.id, user_id: user!.id });
    } else {
      addTransaction(transactionData);
    }
    setShowForm(false);
    setEditingTransaction(undefined);
  };

  const handleEdit = (transaction: TransactionData) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTransaction(undefined);
  };

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to view transactions</p>
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
            Transactions
          </h2>
          <Button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Transaction
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="text-income" size={20} />
              <span className="text-sm font-medium text-muted-foreground">Total Income</span>
            </div>
            <p className="text-2xl font-bold text-income">
              ${totalIncome.toFixed(2)}
            </p>
          </div>
          
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
              totalIncome - totalExpenses >= 0 ? 'text-income' : 'text-expense'
            }`}>
              ${(totalIncome - totalExpenses).toFixed(2)}
            </p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions" className="space-y-4">
          {showForm && (
            <TransactionForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              editingTransaction={editingTransaction}
              categories={categories}
              userId={user.id}
            />
          )}

          {transactionsLoading ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Loading transactions...</p>
            </Card>
          ) : transactions.length === 0 ? (
            <Card className="p-8 text-center space-y-4">
              <Receipt size={64} className="mx-auto text-muted-foreground/50" />
              <div>
                <p className="text-lg font-medium">No transactions yet</p>
                <p className="text-muted-foreground">Start tracking your income and expenses</p>
              </div>
              <Button onClick={() => setShowForm(true)} className="mt-4">
                <Plus size={16} className="mr-2" />
                Add Your First Transaction
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  categories={categories}
                  onEdit={handleEdit}
                  onDelete={deleteTransaction}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="categories">
          <CategoryManager
            categories={categories}
            onAddCategory={addCategory}
            onDeleteCategory={deleteCategory}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
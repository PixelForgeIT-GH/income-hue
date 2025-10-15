import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { usePlaidTransactions } from "@/hooks/usePlaidTransactions";
import { usePlaid } from "@/hooks/usePlaid";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Download, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PlaidTransactionsListProps {
  onTransactionsImported?: () => void;
}

export const PlaidTransactionsList = ({ onTransactionsImported }: PlaidTransactionsListProps) => {
  const { user } = useAuth();
  const { transactions, loading, refetch } = usePlaidTransactions(user?.id);
  const { importTransactions, loading: importing } = usePlaid();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const unimportedTransactions = transactions.filter(tx => !tx.imported_to_app);

  const toggleTransaction = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === unimportedTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(unimportedTransactions.map(tx => tx.id)));
    }
  };

  const handleImport = async () => {
    if (selectedIds.size === 0) return;
    
    const result = await importTransactions(Array.from(selectedIds));
    if (result) {
      setSelectedIds(new Set());
      refetch();
      // Refresh the main transactions list
      onTransactionsImported?.();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plaid Transactions</CardTitle>
          <CardDescription>
            Sync your bank accounts to see transactions here
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No transactions synced yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Plaid Transactions</CardTitle>
            <CardDescription>
              {unimportedTransactions.length} transaction(s) available to import
            </CardDescription>
          </div>
          {unimportedTransactions.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                disabled={importing}
              >
                {selectedIds.size === unimportedTransactions.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Button
                onClick={handleImport}
                disabled={selectedIds.size === 0 || importing}
                size="sm"
              >
                {importing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Import Selected ({selectedIds.size})
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                tx.imported_to_app 
                  ? 'bg-muted/30 border-muted' 
                  : 'bg-background border-border hover:bg-muted/50'
              } transition-colors`}
            >
              {!tx.imported_to_app ? (
                <Checkbox
                  checked={selectedIds.has(tx.id)}
                  onCheckedChange={() => toggleTransaction(tx.id)}
                />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {tx.merchant_name || tx.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(tx.date)}
                      </p>
                      {tx.pending && (
                        <Badge variant="outline" className="text-xs">Pending</Badge>
                      )}
                      {tx.imported_to_app && (
                        <Badge variant="secondary" className="text-xs">Imported</Badge>
                      )}
                    </div>
                  </div>
                  <p className={`font-semibold whitespace-nowrap ${
                    tx.amount > 0 ? 'text-expense' : 'text-income'
                  }`}>
                    {tx.amount > 0 ? '-' : '+'}{formatCurrency(tx.amount)}
                  </p>
                </div>
                {tx.category && tx.category.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {tx.category.join(' • ')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

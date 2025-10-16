import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlaidLink } from "@/components/plaid/PlaidLink";
import { PlaidTransactionsList } from "@/components/plaid/PlaidTransactionsList";
import { usePlaid } from "@/hooks/usePlaid";
import { usePlaidBalances } from "@/hooks/usePlaidBalances";
import { useAuth } from "@/hooks/useAuth";
import { Building2, RefreshCw, Trash2, Loader2, Eye, EyeOff, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProfilePageProps {
  onTransactionsImported?: () => void;
}

export const ProfilePage = ({ onTransactionsImported }: ProfilePageProps) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<any>(null);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [syncingItemId, setSyncingItemId] = useState<string | null>(null);
  const [localAccountVisibility, setLocalAccountVisibility] = useState<Record<string, boolean>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { getAccounts, syncTransactions, disconnectBank, loading } = usePlaid();
  const { accounts: plaidAccounts, refetch: refetchBalances } = usePlaidBalances(user?.id);

  const loadAccounts = async () => {
    setLoadingAccounts(true);
    const data = await getAccounts();
    if (data) {
      setAccounts(data);
      // Initialize local state with current values
      const visibilityMap: Record<string, boolean> = {};
      data.items?.forEach((item: any) => {
        item.accounts?.forEach((account: any) => {
          visibilityMap[account.id] = account.show_on_dashboard;
        });
      });
      setLocalAccountVisibility(visibilityMap);
    }
    setLoadingAccounts(false);
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleSync = async (itemId: string) => {
    setSyncingItemId(itemId);
    await syncTransactions(itemId);
    setSyncingItemId(null);
    await loadAccounts();
  };

  const handleDisconnect = async (itemId: string) => {
    const success = await disconnectBank(itemId);
    if (success) {
      await loadAccounts();
      refetchBalances();
    }
  };

  const handleToggleDashboardDisplay = (accountId: string) => {
    setLocalAccountVisibility(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Update all accounts with new visibility settings
      const updates = Object.entries(localAccountVisibility).map(([accountId, showOnDashboard]) =>
        supabase
          .from('plaid_accounts')
          .update({ show_on_dashboard: showOnDashboard })
          .eq('id', accountId)
      );

      await Promise.all(updates);
      
      toast.success("Dashboard preferences saved");
      setHasUnsavedChanges(false);
      await loadAccounts();
      refetchBalances();
    } catch (error) {
      toast.error("Failed to save preferences");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loadingAccounts) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Profile & Settings</h2>
          <p className="text-muted-foreground mt-1">
            Manage your bank connections and preferences
          </p>
        </div>
        {hasUnsavedChanges && (
          <Button onClick={handleSaveChanges} disabled={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bank Connections</CardTitle>
          <CardDescription>
            Securely connect your Canadian bank accounts and choose which balances appear on your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlaidLink onSuccess={loadAccounts} />
        </CardContent>
      </Card>

      {accounts && accounts.items && accounts.items.length > 0 ? (
        <div className="space-y-4">
          {accounts.items.map((item: any) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{item.institution_name}</CardTitle>
                      <CardDescription>
                        Connected {formatDate(item.created_at)}
                        {item.last_synced_at && (
                          <> • Last synced {formatDate(item.last_synced_at)}</>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={item.status === 'active' ? 'default' : 'destructive'}>
                    {item.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {item.accounts && item.accounts.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">Accounts</h4>
                      {item.accounts.map((account: any) => (
                        <div
                          key={account.id}
                          className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{account.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {account.subtype} {account.mask && `•••• ${account.mask}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-semibold">
                                {formatCurrency(account.current_balance || 0)}
                              </p>
                              {account.available_balance !== null && (
                                <p className="text-sm text-muted-foreground">
                                  Available: {formatCurrency(account.available_balance)}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={localAccountVisibility[account.id] ?? account.show_on_dashboard}
                                onCheckedChange={() => handleToggleDashboardDisplay(account.id)}
                              />
                              {(localAccountVisibility[account.id] ?? account.show_on_dashboard) ? (
                                <Eye className="h-4 w-4 text-primary" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Separator />

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleSync(item.id)}
                      disabled={syncingItemId === item.id}
                    >
                      {syncingItemId === item.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Sync Transactions
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={loading}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Disconnect
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Disconnect {item.institution_name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove the connection to {item.institution_name} and delete all
                            associated account data. Imported transactions will remain in your app.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDisconnect(item.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Disconnect
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Banks Connected</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Connect your Canadian bank account to automatically import and categorize your
              transactions. Your data is encrypted and secure.
            </p>
            <PlaidLink onSuccess={loadAccounts} />
          </CardContent>
        </Card>
      )}

      {accounts && accounts.items && accounts.items.length > 0 && (
        <PlaidTransactionsList onTransactionsImported={onTransactionsImported} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Data Privacy & Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>🔒 PIPEDA Compliant:</strong> This app follows Canadian Personal Information
            Protection and Electronic Documents Act (PIPEDA) requirements.
          </p>
          <p>
            <strong>🛡️ Secure Connection:</strong> Bank credentials are never stored. We use Plaid,
            a secure third-party service trusted by major financial institutions.
          </p>
          <p>
            <strong>🔐 Encrypted Storage:</strong> All financial data is encrypted at rest and in
            transit. Access tokens are stored securely in our database.
          </p>
          <p>
            <strong>👤 Your Control:</strong> You can disconnect any bank at any time. Row-Level
            Security ensures only you can access your data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

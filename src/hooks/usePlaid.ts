import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePlaid = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createLinkToken = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-link-token', {
        method: 'POST',
      });

      if (error) throw error;

      return data.link_token;
    } catch (error: any) {
      console.error('Error creating link token:', error);
      toast({
        title: "Error",
        description: "Failed to initialize bank connection. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const exchangePublicToken = async (publicToken: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('exchange-public-token', {
        method: 'POST',
        body: { public_token: publicToken },
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Connected to ${data.institution_name} with ${data.accounts_count} account(s).`,
      });

      return data;
    } catch (error: any) {
      console.error('Error exchanging token:', error);
      toast({
        title: "Error",
        description: "Failed to connect bank account. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const syncTransactions = async (itemId: string, startDate?: string, endDate?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-plaid-transactions', {
        method: 'POST',
        body: { 
          item_id: itemId,
          start_date: startDate,
          end_date: endDate,
        },
      });

      if (error) throw error;

      toast({
        title: "Sync Complete",
        description: `Imported ${data.new_transactions} new transaction(s).`,
      });

      return data;
    } catch (error: any) {
      console.error('Error syncing transactions:', error);
      toast({
        title: "Error",
        description: "Failed to sync transactions. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getAccounts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-plaid-accounts', {
        method: 'POST',
      });

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bank accounts. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const disconnectBank = async (itemId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('plaid_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Disconnected",
        description: "Bank connection removed successfully.",
      });

      return true;
    } catch (error: any) {
      console.error('Error disconnecting bank:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect bank. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const importTransactions = async (transactionIds: string[]) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('import-plaid-transactions', {
        method: 'POST',
        body: { transaction_ids: transactionIds },
      });

      if (error) throw error;

      toast({
        title: "Import Complete",
        description: `Imported ${data.imported_count} transaction(s) to your app.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error importing transactions:', error);
      toast({
        title: "Error",
        description: "Failed to import transactions. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createLinkToken,
    exchangePublicToken,
    syncTransactions,
    getAccounts,
    disconnectBank,
    importTransactions,
  };
};
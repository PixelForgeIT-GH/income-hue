import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PlaidTransactionData {
  id: string;
  transaction_id: string;
  plaid_account_id: string;
  name: string;
  merchant_name: string | null;
  amount: number;
  date: string;
  category: string[] | null;
  pending: boolean;
  imported_to_app: boolean;
  app_transaction_id: string | null;
}

export const usePlaidTransactions = (userId: string | undefined) => {
  const [transactions, setTransactions] = useState<PlaidTransactionData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('plaid_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching plaid transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [userId]);

  return {
    transactions,
    loading,
    refetch: fetchTransactions,
  };
};

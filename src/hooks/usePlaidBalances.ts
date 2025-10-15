import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PlaidAccountBalance {
  id: string;
  name: string;
  official_name: string | null;
  type: string;
  subtype: string | null;
  mask: string | null;
  current_balance: number | null;
  available_balance: number | null;
  currency_code: string;
}

export const usePlaidBalances = (userId: string | undefined) => {
  const [accounts, setAccounts] = useState<PlaidAccountBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);

  const fetchBalances = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('plaid_accounts')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      setAccounts(data || []);
      
      // Calculate total balance (only depository accounts, subtract credit balances)
      const total = (data || []).reduce((sum, account) => {
        if (account.type === 'depository') {
          return sum + (account.current_balance || 0);
        } else if (account.type === 'credit') {
          return sum - (account.current_balance || 0);
        }
        return sum;
      }, 0);
      
      setTotalBalance(total);
    } catch (error) {
      console.error('Error fetching plaid balances:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [userId]);

  return {
    accounts,
    totalBalance,
    loading,
    refetch: fetchBalances,
  };
};

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { item_id, start_date, end_date } = await req.json();

    if (!item_id) {
      throw new Error('Missing item_id');
    }

    // Get Plaid credentials
    const PLAID_CLIENT_ID = Deno.env.get('PLAID_CLIENT_ID');
    const PLAID_SECRET = Deno.env.get('PLAID_SECRET');
    const PLAID_ENV = Deno.env.get('PLAID_ENV') || 'sandbox';

    if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
      throw new Error('Missing Plaid credentials');
    }

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get plaid item from database
    const { data: plaidItem, error: itemError } = await supabaseClient
      .from('plaid_items')
      .select('*')
      .eq('id', item_id)
      .eq('user_id', user.id)
      .single();

    if (itemError || !plaidItem) {
      throw new Error('Plaid item not found');
    }

    // Determine Plaid API URL
    const plaidUrl = PLAID_ENV === 'production' 
      ? 'https://production.plaid.com'
      : PLAID_ENV === 'development'
      ? 'https://development.plaid.com'
      : 'https://sandbox.plaid.com';

    console.log(`Syncing transactions for item ${item_id}, user ${user.id}`);

    // Calculate date range (default to last 30 days)
    const endDate = end_date || new Date().toISOString().split('T')[0];
    const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get transactions from Plaid
    const transactionsResponse = await fetch(`${plaidUrl}/transactions/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        access_token: plaidItem.access_token,
        start_date: startDate,
        end_date: endDate,
        options: {
          count: 500,
          offset: 0,
        },
      }),
    });

    const transactionsData = await transactionsResponse.json();

    if (!transactionsResponse.ok) {
      console.error('Plaid transactions error:', transactionsData);
      throw new Error(transactionsData.error_message || 'Failed to fetch transactions');
    }

    const { transactions, accounts } = transactionsData;

    // Get existing plaid accounts
    const { data: existingAccounts } = await supabaseClient
      .from('plaid_accounts')
      .select('id, account_id')
      .eq('plaid_item_id', item_id);

    const accountMap = new Map(
      existingAccounts?.map(acc => [acc.account_id, acc.id]) || []
    );

    // Update account balances
    if (accounts) {
      for (const account of accounts) {
        const dbAccountId = accountMap.get(account.account_id);
        if (dbAccountId) {
          await supabaseClient
            .from('plaid_accounts')
            .update({
              current_balance: account.balances.current,
              available_balance: account.balances.available,
              updated_at: new Date().toISOString(),
            })
            .eq('id', dbAccountId);
        }
      }
    }

    // Process and store transactions
    let newTransactionsCount = 0;
    let updatedTransactionsCount = 0;

    if (transactions && transactions.length > 0) {
      for (const transaction of transactions) {
        const dbAccountId = accountMap.get(transaction.account_id);
        if (!dbAccountId) continue;

        const transactionData = {
          plaid_account_id: dbAccountId,
          user_id: user.id,
          transaction_id: transaction.transaction_id,
          amount: Math.abs(transaction.amount), // Plaid uses negative for debits
          date: transaction.date,
          name: transaction.name,
          merchant_name: transaction.merchant_name,
          category_id: transaction.category_id,
          category: transaction.category,
          pending: transaction.pending,
        };

        // Check if transaction already exists
        const { data: existing } = await supabaseClient
          .from('plaid_transactions')
          .select('id, pending')
          .eq('transaction_id', transaction.transaction_id)
          .maybeSingle();

        if (existing) {
          // Update if pending status changed
          if (existing.pending !== transaction.pending) {
            await supabaseClient
              .from('plaid_transactions')
              .update({ 
                pending: transaction.pending,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existing.id);
            updatedTransactionsCount++;
          }
        } else {
          // Insert new transaction
          await supabaseClient
            .from('plaid_transactions')
            .insert(transactionData);
          newTransactionsCount++;
        }
      }
    }

    // Update last synced timestamp
    await supabaseClient
      .from('plaid_items')
      .update({ 
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', item_id);

    console.log(`Sync complete: ${newTransactionsCount} new, ${updatedTransactionsCount} updated`);

    return new Response(
      JSON.stringify({ 
        success: true,
        new_transactions: newTransactionsCount,
        updated_transactions: updatedTransactionsCount,
        total_fetched: transactions?.length || 0,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in sync-plaid-transactions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
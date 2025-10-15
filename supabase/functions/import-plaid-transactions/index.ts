import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const { transaction_ids } = await req.json();

    if (!transaction_ids || !Array.isArray(transaction_ids)) {
      throw new Error('Missing or invalid transaction_ids array');
    }

    console.log(`Importing ${transaction_ids.length} transactions for user ${user.id}`);

    // Fetch the plaid transactions
    const { data: plaidTransactions, error: fetchError } = await supabaseClient
      .from('plaid_transactions')
      .select('*')
      .in('id', transaction_ids)
      .eq('user_id', user.id)
      .eq('imported_to_app', false);

    if (fetchError) {
      console.error('Error fetching plaid transactions:', fetchError);
      throw new Error('Failed to fetch plaid transactions');
    }

    if (!plaidTransactions || plaidTransactions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true,
          imported_count: 0,
          message: 'No new transactions to import'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    let importedCount = 0;

    // Import each transaction
    for (const plaidTx of plaidTransactions) {
      // Determine transaction type based on amount
      // Plaid uses positive for debits (expenses) and negative for credits (income)
      const type = plaidTx.amount > 0 ? 'expense' : 'income';
      const absoluteAmount = Math.abs(plaidTx.amount);

      const transactionData = {
        user_id: user.id,
        name: plaidTx.merchant_name || plaidTx.name,
        amount: absoluteAmount,
        type: type,
        date: plaidTx.date,
        notes: `Imported from Plaid${plaidTx.pending ? ' (Pending)' : ''}`,
      };

      // Insert into transactions table
      const { data: newTransaction, error: insertError } = await supabaseClient
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting transaction:', insertError);
        continue;
      }

      // Update plaid transaction to mark as imported
      const { error: updateError } = await supabaseClient
        .from('plaid_transactions')
        .update({
          imported_to_app: true,
          app_transaction_id: newTransaction.id,
        })
        .eq('id', plaidTx.id);

      if (updateError) {
        console.error('Error updating plaid transaction:', updateError);
      } else {
        importedCount++;
      }
    }

    console.log(`Successfully imported ${importedCount} transactions`);

    return new Response(
      JSON.stringify({ 
        success: true,
        imported_count: importedCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in import-plaid-transactions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});

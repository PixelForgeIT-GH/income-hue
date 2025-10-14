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

    console.log(`Fetching accounts for user ${user.id}`);

    // Get all plaid items for user
    const { data: plaidItems, error: itemsError } = await supabaseClient
      .from('plaid_items')
      .select(`
        id,
        institution_name,
        status,
        last_synced_at,
        created_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (itemsError) {
      console.error('Error fetching plaid items:', itemsError);
      throw new Error('Failed to fetch bank connections');
    }

    // Get accounts for each item
    const itemsWithAccounts = await Promise.all(
      (plaidItems || []).map(async (item) => {
        const { data: accounts, error: accountsError } = await supabaseClient
          .from('plaid_accounts')
          .select('*')
          .eq('plaid_item_id', item.id)
          .order('name', { ascending: true });

        if (accountsError) {
          console.error('Error fetching accounts:', accountsError);
          return { ...item, accounts: [] };
        }

        return {
          ...item,
          accounts: accounts || [],
        };
      })
    );

    // Calculate totals
    const totalAccounts = itemsWithAccounts.reduce(
      (sum, item) => sum + item.accounts.length, 
      0
    );

    const totalBalance = itemsWithAccounts.reduce((sum, item) => {
      return sum + item.accounts.reduce(
        (accSum: number, acc: any) => accSum + (acc.current_balance || 0), 
        0
      );
    }, 0);

    return new Response(
      JSON.stringify({ 
        items: itemsWithAccounts,
        summary: {
          total_connections: plaidItems?.length || 0,
          total_accounts: totalAccounts,
          total_balance: totalBalance,
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in get-plaid-accounts:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
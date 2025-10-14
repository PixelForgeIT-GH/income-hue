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
    const { public_token } = await req.json();

    if (!public_token) {
      throw new Error('Missing public_token');
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

    // Determine Plaid API URL
    const plaidUrl = PLAID_ENV === 'production' 
      ? 'https://production.plaid.com'
      : PLAID_ENV === 'development'
      ? 'https://development.plaid.com'
      : 'https://sandbox.plaid.com';

    console.log(`Exchanging public token for user ${user.id}`);

    // Exchange public token for access token
    const exchangeResponse = await fetch(`${plaidUrl}/item/public_token/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        public_token: public_token,
      }),
    });

    const exchangeData = await exchangeResponse.json();

    if (!exchangeResponse.ok) {
      console.error('Plaid exchange error:', exchangeData);
      throw new Error(exchangeData.error_message || 'Failed to exchange token');
    }

    const { access_token, item_id } = exchangeData;

    // Get institution info
    const itemResponse = await fetch(`${plaidUrl}/item/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        access_token: access_token,
      }),
    });

    const itemData = await itemResponse.json();
    const institution_id = itemData.item?.institution_id;

    // Get institution name
    let institution_name = 'Unknown Bank';
    if (institution_id) {
      const instResponse = await fetch(`${plaidUrl}/institutions/get_by_id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: PLAID_CLIENT_ID,
          secret: PLAID_SECRET,
          institution_id: institution_id,
          country_codes: ['CA'],
        }),
      });

      const instData = await instResponse.json();
      institution_name = instData.institution?.name || institution_name;
    }

    // Store in database
    const { data: plaidItem, error: insertError } = await supabaseClient
      .from('plaid_items')
      .insert({
        user_id: user.id,
        access_token: access_token,
        item_id: item_id,
        institution_id: institution_id,
        institution_name: institution_name,
        status: 'active',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error('Failed to store bank connection');
    }

    // Get accounts
    const accountsResponse = await fetch(`${plaidUrl}/accounts/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        access_token: access_token,
      }),
    });

    const accountsData = await accountsResponse.json();

    if (accountsData.accounts) {
      // Store accounts in database
      const accountsToInsert = accountsData.accounts.map((account: any) => ({
        plaid_item_id: plaidItem.id,
        user_id: user.id,
        account_id: account.account_id,
        name: account.name,
        official_name: account.official_name,
        type: account.type,
        subtype: account.subtype,
        mask: account.mask,
        current_balance: account.balances.current,
        available_balance: account.balances.available,
        currency_code: account.balances.iso_currency_code || 'CAD',
      }));

      const { error: accountsError } = await supabaseClient
        .from('plaid_accounts')
        .insert(accountsToInsert);

      if (accountsError) {
        console.error('Accounts insert error:', accountsError);
      }
    }

    console.log(`Successfully connected ${institution_name} for user ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        item_id: plaidItem.id,
        institution_name: institution_name,
        accounts_count: accountsData.accounts?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in exchange-public-token:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
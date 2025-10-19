import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client, Environment } from "https://esm.sh/square@38.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const squareClient = new Client({
      accessToken: Deno.env.get('SQUARE_ACCESS_TOKEN'),
      environment: Deno.env.get('SQUARE_ENVIRONMENT') === 'production' 
        ? Environment.Production 
        : Environment.Sandbox,
    });

    const { userId, subscriptionId } = await req.json();

    console.log('Cancelling Square subscription:', subscriptionId);

    // Cancel subscription
    const response = await squareClient.subscriptionsApi.cancelSubscription(subscriptionId);

    if (response.result.errors) {
      throw new Error(JSON.stringify(response.result.errors));
    }

    // Update database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    await fetch(`${supabaseUrl}/rest/v1/subscriptions?square_subscription_id=eq.${subscriptionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      }),
    });

    // Update profile
    await fetch(`${supabaseUrl}/rest/v1/profiles?user_id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        subscription_status: 'cancelled',
      }),
    });

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
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

    const { userId, email, priceId } = await req.json();

    console.log('Creating Square subscription for user:', userId);

    // Create customer
    const customerResponse = await squareClient.customersApi.createCustomer({
      emailAddress: email,
      idempotencyKey: `customer-${userId}-${Date.now()}`,
    });

    if (customerResponse.result.errors) {
      throw new Error(JSON.stringify(customerResponse.result.errors));
    }

    const customerId = customerResponse.result.customer?.id;
    console.log('Created Square customer:', customerId);

    // Create subscription
    const subscriptionResponse = await squareClient.subscriptionsApi.createSubscription({
      idempotencyKey: `subscription-${userId}-${Date.now()}`,
      locationId: Deno.env.get('SQUARE_LOCATION_ID'),
      planVariationId: priceId,
      customerId: customerId,
    });

    if (subscriptionResponse.result.errors) {
      throw new Error(JSON.stringify(subscriptionResponse.result.errors));
    }

    const subscription = subscriptionResponse.result.subscription;
    console.log('Created Square subscription:', subscription?.id);

    // Store subscription in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const dbResponse = await fetch(`${supabaseUrl}/rest/v1/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        user_id: userId,
        square_subscription_id: subscription?.id,
        square_customer_id: customerId,
        status: subscription?.status,
        plan_type: 'pro',
        amount_cents: 299,
        currency: 'USD',
        current_period_start: subscription?.startDate,
        current_period_end: subscription?.chargedThroughDate,
      }),
    });

    if (!dbResponse.ok) {
      const error = await dbResponse.text();
      console.error('Failed to store subscription:', error);
      throw new Error('Failed to store subscription');
    }

    // Update profile
    await fetch(`${supabaseUrl}/rest/v1/profiles?user_id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        subscription_status: 'pro',
        subscription_id: subscription?.id,
      }),
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        subscriptionId: subscription?.id,
        customerId: customerId,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
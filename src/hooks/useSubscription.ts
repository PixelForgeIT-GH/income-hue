import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type SubscriptionStatus = 'free' | 'pro' | 'business' | 'cancelled';

export const useSubscription = (userId: string | undefined) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('free');
  const [loading, setLoading] = useState(true);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [businessSeats, setBusinessSeats] = useState<number>(0);
  const { toast } = useToast();

  const fetchSubscriptionStatus = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_id, business_seats')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      setSubscriptionStatus((data?.subscription_status as SubscriptionStatus) || 'free');
      setSubscriptionId(data?.subscription_id || null);
      setBusinessSeats(data?.business_seats || 0);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          setSubscriptionStatus(payload.new.subscription_status || 'free');
          setSubscriptionId(payload.new.subscription_id || null);
          setBusinessSeats(payload.new.business_seats || 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const isPro = subscriptionStatus === 'pro' || subscriptionStatus === 'business';
  const isBusiness = subscriptionStatus === 'business' || businessSeats > 0;
  const isFree = subscriptionStatus === 'free' || subscriptionStatus === 'cancelled';

  const createSubscription = async (email: string, priceId: string) => {
    if (!userId) return { error: 'No user ID' };

    try {
      const { data, error } = await supabase.functions.invoke('create-square-subscription', {
        body: { 
          userId, 
          email,
          priceId,
        },
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your subscription has been created.",
      });

      await fetchSubscriptionStatus();
      return { data };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
      return { error: error.message };
    }
  };

  const cancelSubscription = async () => {
    if (!userId || !subscriptionId) return { error: 'No subscription to cancel' };

    try {
      const { data, error } = await supabase.functions.invoke('cancel-square-subscription', {
        body: { userId, subscriptionId },
      });

      if (error) throw error;

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled.",
      });

      await fetchSubscriptionStatus();
      return { data };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
      return { error: error.message };
    }
  };

  return {
    subscriptionStatus,
    loading,
    isPro,
    isBusiness,
    isFree,
    createSubscription,
    cancelSubscription,
    refetch: fetchSubscriptionStatus,
  };
};
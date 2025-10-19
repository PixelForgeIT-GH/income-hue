import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

export default function UpgradePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPro, createSubscription, cancelSubscription, loading: subLoading } = useSubscription(user?.id);
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    // TODO: Replace with your actual Square plan variation ID
    const SQUARE_PLAN_ID = 'YOUR_SQUARE_PLAN_VARIATION_ID';
    await createSubscription(user.email, SQUARE_PLAN_ID);
    setLoading(false);
  };

  const handleCancel = async () => {
    setLoading(true);
    await cancelSubscription();
    setLoading(false);
  };

  const freeFeatures = [
    "1 income stream",
    "Recurring expenses tracking",
    "Basic dashboard",
  ];

  const proFeatures = [
    "Unlimited income streams",
    "Bank account linking via Plaid",
    "Manual transaction tracking",
    "Account balance monitoring",
    "Priority support",
    "Feature request access",
  ];

  if (subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg">
            Select the plan that best fits your financial tracking needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-2xl">Free</CardTitle>
                {!isPro && (
                  <Badge variant="secondary">Current Plan</Badge>
                )}
              </div>
              <CardDescription>
                <span className="text-3xl font-bold text-foreground">$0</span>
                <span className="text-muted-foreground">/month</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {freeFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-primary">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
            </div>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-2xl">Pro</CardTitle>
                {isPro && (
                  <Badge>Current Plan</Badge>
                )}
              </div>
              <CardDescription>
                <span className="text-3xl font-bold text-foreground">$2.99</span>
                <span className="text-muted-foreground">/month</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {proFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {isPro ? (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cancel Subscription
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleUpgrade}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Upgrade to Pro
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-12 bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Questions about pricing?</h3>
              <p className="text-muted-foreground mb-4">
                Our team is here to help you choose the right plan for your needs.
              </p>
              <Button variant="outline" onClick={() => navigate('/support')}>
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
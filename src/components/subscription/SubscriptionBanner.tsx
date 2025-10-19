import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Crown, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const SubscriptionBanner = () => {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <Card className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 relative">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 p-1 hover:bg-background/50 rounded-full transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className="h-6 w-6 text-primary" />
          <div>
            <h3 className="font-semibold">Upgrade to Pro</h3>
            <p className="text-sm text-muted-foreground">
              Unlock unlimited income streams, bank linking, and more for just $2.99/month
            </p>
          </div>
        </div>
        <Button onClick={() => navigate('/upgrade')}>
          Upgrade Now
        </Button>
      </div>
    </Card>
  );
};
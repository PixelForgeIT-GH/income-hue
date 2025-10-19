import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";

interface FeatureGateProps {
  children: ReactNode;
  isPro: boolean;
  featureName: string;
  className?: string;
}

export const FeatureGate = ({ children, isPro, featureName, className }: FeatureGateProps) => {
  const navigate = useNavigate();

  if (isPro) {
    return <>{children}</>;
  }

  return (
    <div className={className}>
      <Card className="p-8 bg-muted/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-primary/10">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-2xl font-bold">Pro Feature</h3>
            <p className="text-muted-foreground">
              {featureName} is available in the Pro plan. Upgrade now to unlock this feature and more!
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/upgrade')}
              className="gap-2"
            >
              <Crown className="h-4 w-4" />
              Upgrade to Pro
            </Button>
          </div>
        </div>
        <div className="opacity-30 pointer-events-none">
          {children}
        </div>
      </Card>
    </div>
  );
};
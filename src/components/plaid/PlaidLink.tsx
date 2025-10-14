import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePlaid } from "@/hooks/usePlaid";
import { Loader2, Building2 } from "lucide-react";

interface PlaidLinkProps {
  onSuccess?: () => void;
}

export const PlaidLink = ({ onSuccess }: PlaidLinkProps) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const { loading, createLinkToken, exchangePublicToken } = usePlaid();

  useEffect(() => {
    // Load Plaid Link script
    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleClick = async () => {
    const token = await createLinkToken();
    if (token) {
      setLinkToken(token);
      openPlaidLink(token);
    }
  };

  const openPlaidLink = (token: string) => {
    // @ts-ignore - Plaid is loaded via script tag
    if (window.Plaid) {
      // @ts-ignore
      const handler = window.Plaid.create({
        token: token,
        onSuccess: async (public_token: string, metadata: any) => {
          console.log('Plaid Link success:', metadata);
          const result = await exchangePublicToken(public_token);
          if (result && onSuccess) {
            onSuccess();
          }
        },
        onExit: (err: any, metadata: any) => {
          console.log('Plaid Link exit:', err, metadata);
        },
        onEvent: (eventName: string, metadata: any) => {
          console.log('Plaid Link event:', eventName, metadata);
        },
      });

      handler.open();
    }
  };

  return (
    <Button 
      onClick={handleClick}
      disabled={loading}
      size="lg"
      className="w-full sm:w-auto"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Building2 className="mr-2 h-4 w-4" />
          Connect Bank Account
        </>
      )}
    </Button>
  );
};
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, Building2, LogOut, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface ProfileMenuProps {
  onNavigateToSettings: () => void;
  onNavigateToBanks: () => void;
  isPro?: boolean;
}

export const ProfileMenu = ({ onNavigateToSettings, onNavigateToBanks, isPro = false }: ProfileMenuProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 rounded-full p-0 hover:bg-muted"
        >
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card border-border z-50">
        <div className="px-2 py-1.5 text-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground">Signed in as</p>
            {isPro && (
              <Badge variant="default" className="text-xs">
                <Crown className="h-3 w-3 mr-1" />
                Pro
              </Badge>
            )}
          </div>
          <p className="font-medium truncate">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        {!isPro && (
          <>
            <DropdownMenuItem onClick={() => navigate('/upgrade')} className="cursor-pointer text-primary">
              <Crown className="mr-2 h-4 w-4" />
              <span>Upgrade to Pro</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={onNavigateToSettings} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Profile & Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onNavigateToBanks} className="cursor-pointer">
          <Building2 className="mr-2 h-4 w-4" />
          <span>Bank Connections</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, Building2, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ProfileMenuProps {
  onNavigateToProfile: () => void;
  onNavigateToPlaid: () => void;
}

export const ProfileMenu = ({ onNavigateToProfile, onNavigateToPlaid }: ProfileMenuProps) => {
  const { user, signOut } = useAuth();

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
          <p className="text-xs text-muted-foreground">Signed in as</p>
          <p className="font-medium truncate">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onNavigateToProfile} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Profile & Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onNavigateToPlaid} className="cursor-pointer">
          <Building2 className="mr-2 h-4 w-4" />
          <span>Connect Bank</span>
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

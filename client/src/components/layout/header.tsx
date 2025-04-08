import { useState, useEffect } from "react";
import { Bell, Plus, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type HeaderProps = {
  onOpenSidebar: () => void;
};

export default function Header({ onOpenSidebar }: HeaderProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiRequest("GET", "/api/user");
        if (res.ok) {
          const user = await res.json();
          setUserData(user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, []);

  const handleAddNew = (type: string) => {
    switch (type) {
      case "client":
        navigate("/clients/new");
        break;
      case "project":
        navigate("/projects/new");
        break;
      case "estimate":
        navigate("/estimates/new");
        break;
      default:
        break;
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (!userData || !userData.fullName) return "U";
    return userData.fullName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={onOpenSidebar} className="text-gray-500 md:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        
        <div className="flex items-center space-x-4 ml-auto">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Add new">
                <Plus className="h-5 w-5 text-gray-500 hover:text-gray-700" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleAddNew("client")}>
                New Client
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddNew("project")}>
                New Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddNew("estimate")}>
                New Estimate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary-100 text-primary-700">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{userData?.fullName || userData?.username}</p>
                <p className="text-xs text-muted-foreground">{userData?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

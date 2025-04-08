import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  FileSpreadsheet, 
  FileUp, 
  UserCog, 
  Settings, 
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type SidebarProps = {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
};

export default function Sidebar({ isMobileOpen, onCloseMobile }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (user) {
      setUserName(user.fullName || user.username);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const navLinks = [
    { href: "/", label: "Dashboard", icon: <LayoutDashboard className="mr-3 h-5 w-5" /> },
    { href: "/clients", label: "Clients", icon: <Users className="mr-3 h-5 w-5" /> },
    { href: "/projects", label: "Projects", icon: <FolderKanban className="mr-3 h-5 w-5" /> },
    { href: "/estimates", label: "Estimates", icon: <FileSpreadsheet className="mr-3 h-5 w-5" /> },
    { href: "/files", label: "Files", icon: <FileUp className="mr-3 h-5 w-5" /> },
  ];

  const settingsLinks = [
    { href: "/account", label: "Account", icon: <UserCog className="mr-3 h-5 w-5" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="mr-3 h-5 w-5" /> },
  ];

  const sidebarClasses = `fixed md:static inset-0 transform ${
    isMobileOpen ? "translate-x-0" : "-translate-x-full"
  } md:translate-x-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out md:min-h-screen`;

  return (
    <aside className={sidebarClasses}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-primary-600 flex items-center justify-center">
              <span className="text-white text-xl font-bold">C</span>
            </div>
            <span className="ml-2 text-xl font-semibold text-gray-800">ClientPro</span>
          </Link>
          <button 
            onClick={onCloseMobile} 
            className="text-gray-500 md:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      
      <nav className="py-4">
        <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Main
        </div>
        <ul>
          {navLinks.map((link) => (
            <li key={link.href} className="px-2">
              <Link href={link.href}>
                <a 
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    location === link.href 
                      ? "text-primary-700 bg-primary-50" 
                      : "text-gray-700 hover:text-primary-700 hover:bg-primary-50"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </a>
              </Link>
            </li>
          ))}
        </ul>
        
        <div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Settings
        </div>
        <ul>
          {settingsLinks.map((link) => (
            <li key={link.href} className="px-2">
              <Link href={link.href}>
                <a 
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    location === link.href 
                      ? "text-primary-700 bg-primary-50" 
                      : "text-gray-700 hover:text-primary-700 hover:bg-primary-50"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 w-full border-t p-4">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
            {userName ? userName.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-800">{userName}</p>
            <p className="text-xs text-gray-500">{user?.planType || "Free Plan"}</p>
          </div>
          <div className="ml-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Logout" 
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 text-gray-500 hover:text-gray-700" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}

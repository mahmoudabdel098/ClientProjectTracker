import { useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  FileSpreadsheet, 
  FileUp,
  LogOut
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

type SidebarProps = {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
};

export default function TestSidebar({ isMobileOpen, onCloseMobile }: SidebarProps) {
  const [location, navigate] = useLocation();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [userData, setUserData] = useState<any>(null);
  
  // Fetch user data
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
  
  const navLinks = [
    { href: "/dashboard", label: t("navigation.dashboard"), icon: <LayoutDashboard className="mr-3 h-5 w-5" /> },
    { href: "/clients", label: t("navigation.clients"), icon: <Users className="mr-3 h-5 w-5" /> },
    { href: "/projects", label: t("navigation.projects"), icon: <FolderKanban className="mr-3 h-5 w-5" /> },
    { href: "/estimates", label: t("navigation.estimates"), icon: <FileSpreadsheet className="mr-3 h-5 w-5" /> },
    { href: "/files", label: t("navigation.files"), icon: <FileUp className="mr-3 h-5 w-5" /> },
  ];

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

  const sidebarClasses = `fixed md:static inset-0 transform ${
    isMobileOpen ? "translate-x-0" : "-translate-x-full"
  } md:translate-x-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out md:min-h-screen flex flex-col`;

  return (
    <aside className={sidebarClasses}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <div className="flex items-center cursor-pointer">
              <div className="h-8 w-8 rounded-md bg-primary-600 flex items-center justify-center">
                <span className="text-white text-xl font-bold">C</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-800">{t("common.appName")}</span>
            </div>
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
      
      <nav className="py-4 flex-grow">
        <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {t("sidebar.main")}
        </div>
        <ul>
          {navLinks.map((link) => (
            <li key={link.href} className="px-2 mb-1">
              <Link href={link.href}>
                <div
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer ${
                    location === link.href 
                      ? "text-primary-700 bg-primary-50" 
                      : "text-gray-700 hover:text-primary-700 hover:bg-primary-50"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
              {getInitials()}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">
                {userData?.fullName || userData?.username || "User"}
              </p>
              <p className="text-xs text-gray-500">{userData?.planType === "free" ? "Free Plan" : "Premium Plan"}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
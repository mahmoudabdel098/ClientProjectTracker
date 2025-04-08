import { useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  FileSpreadsheet, 
  FileUp
} from "lucide-react";
import { useTranslation } from "react-i18next";

type SidebarProps = {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
};

export default function TestSidebar({ isMobileOpen, onCloseMobile }: SidebarProps) {
  const [location] = useLocation();
  const { t } = useTranslation();
  
  const navLinks = [
    { href: "/", label: t("navigation.dashboard"), icon: <LayoutDashboard className="mr-3 h-5 w-5" /> },
    { href: "/clients", label: t("navigation.clients"), icon: <Users className="mr-3 h-5 w-5" /> },
    { href: "/projects", label: t("navigation.projects"), icon: <FolderKanban className="mr-3 h-5 w-5" /> },
    { href: "/estimates", label: t("navigation.estimates"), icon: <FileSpreadsheet className="mr-3 h-5 w-5" /> },
    { href: "/files", label: t("navigation.files"), icon: <FileUp className="mr-3 h-5 w-5" /> },
  ];

  const sidebarClasses = `fixed md:static inset-0 transform ${
    isMobileOpen ? "translate-x-0" : "-translate-x-full"
  } md:translate-x-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out md:min-h-screen`;

  return (
    <aside className={sidebarClasses}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-primary-600 flex items-center justify-center">
              <span className="text-white text-xl font-bold">C</span>
            </div>
            <span className="ml-2 text-xl font-semibold text-gray-800">{t("common.appName")}</span>
          </div>
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
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 w-full border-t p-4">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
            D
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-800">Demo User</p>
            <p className="text-xs text-gray-500">Free Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
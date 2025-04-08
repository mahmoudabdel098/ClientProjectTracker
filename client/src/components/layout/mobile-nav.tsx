import { useLocation, Link } from "wouter";
import { LayoutDashboard, Users, FolderKanban, Menu, FileSpreadsheet, FileUp } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function MobileNav() {
  const [location, navigate] = useLocation();
  const { t } = useTranslation();

  const navLinks = [
    { href: "/dashboard", label: t("navigation.dashboard"), icon: <LayoutDashboard className="text-xl" /> },
    { href: "/clients", label: t("navigation.clients"), icon: <Users className="text-xl" /> },
    { href: "/projects", label: t("navigation.projects"), icon: <FolderKanban className="text-xl" /> },
    { href: "/estimates", label: t("navigation.estimates"), icon: <FileSpreadsheet className="text-xl" /> },
    { href: "/files", label: t("navigation.files"), icon: <FileUp className="text-xl" /> },
  ];

  const handleNavClick = (href: string) => {
    navigate(href);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-10">
      <div className="flex justify-around items-center py-3">
        {navLinks.map((link) => (
          <div 
            key={link.href} 
            onClick={() => handleNavClick(link.href)}
            className={`flex flex-col items-center justify-center cursor-pointer ${
              location === link.href ? "text-primary-600" : "text-gray-500"
            }`}
          >
            {link.icon}
            <span className="text-xs mt-1">{link.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

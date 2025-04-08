import { useLocation, Link } from "wouter";
import { LayoutDashboard, Users, FolderKanban, Menu } from "lucide-react";

export default function MobileNav() {
  const [location] = useLocation();

  const navLinks = [
    { href: "/", label: "Dashboard", icon: <LayoutDashboard className="text-xl" /> },
    { href: "/clients", label: "Clients", icon: <Users className="text-xl" /> },
    { href: "/projects", label: "Projects", icon: <FolderKanban className="text-xl" /> },
    { href: "/more", label: "More", icon: <Menu className="text-xl" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-10">
      <div className="flex justify-around items-center py-3">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <a className={`flex flex-col items-center justify-center ${
              location === link.href ? "text-primary-600" : "text-gray-500"
            }`}>
              {link.icon}
              <span className="text-xs mt-1">{link.label}</span>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}

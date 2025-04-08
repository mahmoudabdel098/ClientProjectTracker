import { useState } from "react";
import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";

type HeaderProps = {
  onOpenSidebar: () => void;
};

export default function Header({ onOpenSidebar }: HeaderProps) {
  const [, navigate] = useLocation();

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
        </div>
      </div>
    </header>
  );
}

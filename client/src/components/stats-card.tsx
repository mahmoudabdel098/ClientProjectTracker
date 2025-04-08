import { ReactNode } from "react";
import { 
  Users, 
  FolderKanban, 
  FileSpreadsheet, 
  FileUp,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Card } from "@/components/ui/card";

type StatsCardProps = {
  title: string;
  value: number;
  icon: "clients" | "projects" | "estimates" | "files";
  change?: string;
  changeDirection?: "up" | "down" | "none";
};

export default function StatsCard({ 
  title, 
  value, 
  icon, 
  change, 
  changeDirection = "none" 
}: StatsCardProps) {
  // Icon selection
  const getIcon = (): ReactNode => {
    switch (icon) {
      case "clients":
        return (
          <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
            <Users className="text-primary-600 h-6 w-6" />
          </div>
        );
      case "projects":
        return (
          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
            <FolderKanban className="text-green-600 h-6 w-6" />
          </div>
        );
      case "estimates":
        return (
          <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <FileSpreadsheet className="text-yellow-600 h-6 w-6" />
          </div>
        );
      case "files":
        return (
          <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
            <FileUp className="text-purple-600 h-6 w-6" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        {getIcon()}
      </div>
      
      {change && (
        <div className="mt-3 flex items-center text-sm">
          <span className={`flex items-center ${
            changeDirection === "up" 
              ? "text-green-500" 
              : changeDirection === "down" 
                ? "text-red-500" 
                : "text-gray-500"
          }`}>
            {changeDirection === "up" && <ArrowUpRight className="mr-1 h-4 w-4" />}
            {changeDirection === "down" && <ArrowDownRight className="mr-1 h-4 w-4" />}
            {change}
          </span>
          <span className="text-gray-400 ml-2">vs last month</span>
        </div>
      )}
    </Card>
  );
}

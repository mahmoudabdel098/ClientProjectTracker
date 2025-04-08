import { Link } from "wouter";
import { Project } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, MoreHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Client } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type ProjectCardProps = {
  project: Project;
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const { toast } = useToast();
  
  // Fetch client information
  const { data: client } = useQuery<Client>({
    queryKey: [`/api/clients/${project.clientId}`],
  });

  // Format due date
  const formattedDueDate = project.dueDate 
    ? format(new Date(project.dueDate), "MMM d, yyyy")
    : "No due date";

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      case "new":
        return "bg-blue-100 text-blue-800";
      case "pending approval":
        return "bg-yellow-100 text-yellow-800";
      case "on hold":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get progress color
  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 25) return "bg-yellow-500";
    return "bg-gray-500";
  };

  const copyClientLink = () => {
    const url = `${window.location.origin}/client-view/${project.uuid}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Client link copied",
      description: "You can now share this link with your client",
    });
  };

  return (
    <Card className="overflow-hidden shadow-sm border border-gray-100">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{project.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              For: {client?.name || "Loading..."}
            </p>
          </div>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1 text-sm">
            <span className="text-gray-600">Progress:</span>
            <span className="text-gray-800 font-medium">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`${getProgressColor(project.progress)} h-2 rounded-full`} 
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="inline-block mr-1"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Due: {formattedDueDate}
          </div>
          <div className="text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="inline-block mr-1"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            {/* This would be populated from project tasks in a real scenario */}
            {Math.floor(Math.random() * 10) + 1} tasks
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t px-5 py-3 bg-gray-50 flex justify-between items-center">
        <Link href={`/projects/${project.id}`}>
          <a className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View details
          </a>
        </Link>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={copyClientLink}
            title="Share client link"
          >
            <Share2 className="h-4 w-4 text-gray-500 hover:text-gray-700" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4 text-gray-500 hover:text-gray-700" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.open(`/client-view/${project.uuid}`, '_blank')}>
                Preview client view
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = `/projects/${project.id}`}>
                Edit project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
}

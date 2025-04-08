import { Link } from "wouter";
import { Client } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, MoreHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ClientListProps = {
  clients: Client[];
  isLoading?: boolean;
};

export default function ClientList({ clients, isLoading = false }: ClientListProps) {
  return (
    <Card className="shadow-sm border border-gray-100 overflow-hidden">
      <CardHeader className="px-5 py-4 border-b flex justify-between items-center">
        <CardTitle className="text-lg font-semibold">Recent Clients</CardTitle>
        <Link href="/clients/new">
          <Button variant="ghost" size="sm" className="h-8 px-2 text-primary-600">
            <PlusCircle className="h-4 w-4 mr-1" />
            Add
          </Button>
        </Link>
      </CardHeader>
      
      <CardContent className="p-5">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : clients.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {clients.slice(0, 4).map((client) => (
              <ClientItem key={client.id} client={client} />
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No clients yet. Add your first client!
          </div>
        )}
        
        {clients.length > 0 && (
          <div className="mt-4 text-center">
            <Link href="/clients">
              <a className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all clients
              </a>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ClientItem({ client }: { client: Client }) {
  // Fetch projects for this client to count active ones
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: [`/api/projects?clientId=${client.id}`],
  });
  
  // Count active projects
  const activeProjects = projects.filter(p => p.status !== "completed").length;
  
  // Get initials for the avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get random color for avatar background (based on client id for consistency)
  const getAvatarColor = (id: number) => {
    const colors = [
      "bg-blue-100 text-blue-700",
      "bg-red-100 text-red-700",
      "bg-green-100 text-green-700",
      "bg-purple-100 text-purple-700",
      "bg-yellow-100 text-yellow-700",
      "bg-pink-100 text-pink-700",
      "bg-indigo-100 text-indigo-700"
    ];
    return colors[id % colors.length];
  };

  return (
    <li className="py-3 flex justify-between items-center">
      <div className="flex items-center">
        <div className={`h-10 w-10 rounded-full ${getAvatarColor(client.id)} flex items-center justify-center font-semibold`}>
          {getInitials(client.name)}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900">{client.name}</p>
          <p className="text-xs text-gray-500">
            {activeProjects} active project{activeProjects !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4 text-gray-400 hover:text-gray-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => window.location.href = `/clients/${client.id}`}>
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.location.href = `/projects/new?clientId=${client.id}`}>
            Create Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

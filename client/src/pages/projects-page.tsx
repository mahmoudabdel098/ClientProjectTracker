import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Project } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import ProjectCard from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuery as useQueryParams } from "@/lib/utils";

export default function ProjectsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const queryParams = useQueryParams();
  const clientIdFilter = queryParams.get("clientId");
  
  // Fetch projects
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: [clientIdFilter ? `/api/projects?clientId=${clientIdFilter}` : "/api/projects"],
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      if (clientIdFilter) {
        queryClient.invalidateQueries({ queryKey: [`/api/projects?clientId=${clientIdFilter}`] });
      }
      toast({
        title: "Project deleted",
        description: "Project has been deleted successfully",
      });
      setProjectToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete project: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProjectMutation.mutate(projectToDelete.id);
    }
  };

  const getStatusFilters = () => {
    const statuses = Array.from(new Set(projects.map(p => p.status)));
    return statuses;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar isMobileOpen={sidebarOpen} onCloseMobile={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col md:pl-64">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-6 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your client projects
                </p>
              </div>
              <Button onClick={() => navigate("/projects/new")}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <h3 className="text-gray-500 mb-2">No projects yet</h3>
                <Button onClick={() => navigate("/projects/new")}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create your first project
                </Button>
              </div>
            )}
          </div>
        </main>
        
        <MobileNav />
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {projectToDelete?.name} and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

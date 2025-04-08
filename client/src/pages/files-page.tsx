import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Trash2, File, FolderOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { format } from "date-fns";

export default function FilesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [fileToDelete, setFileToDelete] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState<string | null>(null);
  
  // Fetch all files
  const { data: allFiles = [], isLoading: filesLoading } = useQuery<any[]>({
    queryKey: ["/api/files"],
  });

  // Fetch projects for filter
  const { data: projects = [], isLoading: projectsLoading } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/files/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      toast({
        title: "File deleted",
        description: "File has been deleted successfully",
      });
      setFileToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete file: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDeleteFile = (file: any) => {
    setFileToDelete(file);
  };

  const confirmDelete = () => {
    if (fileToDelete) {
      deleteFileMutation.mutate(fileToDelete.id);
    }
  };

  // Filter and search files
  const filteredFiles = allFiles.filter(file => {
    const matchesSearch = searchTerm 
      ? file.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
      
    const matchesProject = projectFilter 
      ? file.projectId.toString() === projectFilter
      : true;
      
    return matchesSearch && matchesProject;
  });

  // Get project name by ID
  const getProjectName = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : "Unknown Project";
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Group files by project
  const filesByProject: Record<string, any[]> = {};
  filteredFiles.forEach(file => {
    const projectName = getProjectName(file.projectId);
    if (!filesByProject[projectName]) {
      filesByProject[projectName] = [];
    }
    filesByProject[projectName].push(file);
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar isMobileOpen={sidebarOpen} onCloseMobile={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col md:pl-64">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-6 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Files</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your project files
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search files..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="w-full md:w-64">
                <Select
                  value={projectFilter || ""}
                  onValueChange={(value) => setProjectFilter(value || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Projects</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {filesLoading || projectsLoading ? (
              <div className="flex justify-center p-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            ) : Object.keys(filesByProject).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(filesByProject).map(([projectName, files]) => (
                  <Card key={projectName}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center">
                        <FolderOpen className="h-5 w-5 mr-2 text-primary-600" />
                        <CardTitle>{projectName}</CardTitle>
                      </div>
                      <CardDescription>{files.length} files</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {files.map((file) => (
                          <div 
                            key={file.id} 
                            className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start">
                              <div className="bg-gray-100 p-2 rounded-lg mr-3">
                                <File className="h-8 w-8 text-primary-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 truncate" title={file.name}>
                                  {file.name}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatFileSize(file.fileSize)} · {format(new Date(file.createdAt), "MMM d, yyyy")}
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2 mt-3">
                              <Button variant="outline" size="sm" asChild>
                                <a 
                                  href={`/api/files/${file.id}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </a>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 text-red-500"
                                onClick={() => handleDeleteFile(file)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="flex justify-center mb-4">
                  <FolderOpen className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || projectFilter 
                    ? "Try changing your search or filter criteria" 
                    : "Upload files to your projects to see them here"}
                </p>
                <Button onClick={() => navigate("/projects")}>
                  Go to Projects
                </Button>
              </div>
            )}
          </div>
        </main>
        
        <MobileNav />
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the file "{fileToDelete?.name}".
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

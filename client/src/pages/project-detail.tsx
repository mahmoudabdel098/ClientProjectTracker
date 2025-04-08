import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Project, ProjectTask, Client, insertProjectTaskSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import ProjectForm from "@/components/forms/project-form";
import FileUpload from "@/components/file-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Save,
  Loader2,
  PlusCircle,
  Check,
  X,
  Clock,
  Calendar,
  Share2,
  Copy,
  ExternalLink
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { useQuery as useQueryParams } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Task form schema
const taskFormSchema = insertProjectTaskSchema.omit({
  projectId: true,
}).extend({
  name: z.string().min(3, "Task name must be at least 3 characters"),
  description: z.string().optional().or(z.literal("")),
  status: z.enum(["pending", "in progress", "completed"]),
  dueDate: z.date().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

export default function ProjectDetail() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryParams = useQueryParams();
  const preselectedClientId = queryParams.get("clientId") 
    ? parseInt(queryParams.get("clientId")!) 
    : undefined;
  
  const [activeTab, setActiveTab] = useState("details");
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  
  const isNewProject = params.id === "new";
  const projectId = isNewProject ? null : parseInt(params.id);

  // Task form setup
  const taskForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "pending",
    },
  });

  // Fetch project data if editing
  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !isNewProject && !!projectId,
  });

  // Fetch client info
  const { data: client } = useQuery<Client>({
    queryKey: [project ? `/api/clients/${project.clientId}` : null],
    enabled: !!project,
  });

  // Fetch project tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<ProjectTask[]>({
    queryKey: [projectId ? `/api/projects/${projectId}/tasks` : null],
    enabled: !!projectId,
  });

  // Fetch project files
  const { data: files = [], isLoading: filesLoading } = useQuery<any[]>({
    queryKey: [projectId ? `/api/projects/${projectId}/files` : null],
    enabled: !!projectId,
  });

  // Create or update project mutation
  const projectMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isNewProject) {
        return apiRequest("POST", "/api/projects", {
          ...data,
          userId: 1, // This will be overridden on the server with the actual authenticated user ID
        });
      } else {
        return apiRequest("PUT", `/api/projects/${projectId}`, data);
      }
    },
    onSuccess: async (response) => {
      const projectData = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      
      if (isNewProject) {
        navigate(`/projects/${projectData.id}`);
        toast({
          title: "Project created",
          description: "New project has been created successfully",
        });
      } else {
        toast({
          title: "Project updated",
          description: "Project information has been updated",
        });
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isNewProject ? "create" : "update"} project: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      return apiRequest("POST", `/api/projects/${projectId}/tasks`, {
        ...data,
        projectId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/tasks`] });
      setIsTaskDialogOpen(false);
      taskForm.reset({
        name: "",
        description: "",
        status: "pending",
      });
      toast({
        title: "Task created",
        description: "New task has been added to the project",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (data: { id: number; task: Partial<ProjectTask> }) => {
      return apiRequest("PUT", `/api/tasks/${data.id}`, data.task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/tasks`] });
      setIsTaskDialogOpen(false);
      setEditingTask(null);
      taskForm.reset({
        name: "",
        description: "",
        status: "pending",
      });
      toast({
        title: "Task updated",
        description: "Task has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/tasks`] });
      toast({
        title: "Task deleted",
        description: "Task has been removed from the project",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Set form values when editing a task
  useEffect(() => {
    if (editingTask) {
      taskForm.reset({
        name: editingTask.name,
        description: editingTask.description || "",
        status: editingTask.status as "pending" | "in progress" | "completed",
        dueDate: editingTask.dueDate ? new Date(editingTask.dueDate) : undefined,
      });
    }
  }, [editingTask, taskForm]);

  // Handle project form submission
  const handleProjectSubmit = async (data: any) => {
    await projectMutation.mutateAsync(data);
  };

  // Handle task form submission
  const handleTaskSubmit = async (data: TaskFormValues) => {
    if (editingTask) {
      await updateTaskMutation.mutateAsync({
        id: editingTask.id,
        task: data,
      });
    } else {
      await createTaskMutation.mutateAsync(data);
    }
  };

  // Open task dialog for creating a new task
  const handleAddTask = () => {
    setEditingTask(null);
    taskForm.reset({
      name: "",
      description: "",
      status: "pending",
    });
    setIsTaskDialogOpen(true);
  };

  // Open task dialog for editing an existing task
  const handleEditTask = (task: ProjectTask) => {
    setEditingTask(task);
    setIsTaskDialogOpen(true);
  };

  // Delete a task
  const handleDeleteTask = async (taskId: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      await deleteTaskMutation.mutateAsync(taskId);
    }
  };

  // Update task status
  const handleTaskStatusChange = async (taskId: number, status: string) => {
    await updateTaskMutation.mutateAsync({
      id: taskId,
      task: { status },
    });
  };

  // Calculate project completion percentage
  const calculateCompletion = () => {
    if (!tasks.length) return 0;
    const completedTasks = tasks.filter(t => t.status === "completed").length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  // Copy client link
  const copyClientLink = () => {
    if (project) {
      const url = `${window.location.origin}/client-view/${project.uuid}`;
      navigator.clipboard.writeText(url);
      toast({
        title: "Client link copied",
        description: "You can now share this link with your client",
      });
    }
  };

  const openClientView = () => {
    if (project) {
      window.open(`/client-view/${project.uuid}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar isMobileOpen={sidebarOpen} onCloseMobile={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col md:pl-64">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-6 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center mb-6">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate("/projects")}
                className="mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {isNewProject ? "New Project" : project?.name || "Project Details"}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {isNewProject 
                    ? "Create a new project" 
                    : `Client: ${client?.name || "Loading..."}`}
                </p>
              </div>
              
              {!isNewProject && project && (
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={copyClientLink}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button onClick={openClientView}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              )}
            </div>
            
            <div className="bg-white shadow-sm rounded-lg">
              {!isNewProject ? (
                <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
                  <div className="px-4 sm:px-6 pt-4">
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="tasks">Tasks</TabsTrigger>
                      <TabsTrigger value="files">Files</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="details" className="p-4 sm:p-6">
                    {projectLoading ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                      </div>
                    ) : project ? (
                      <ProjectForm 
                        defaultValues={{
                          name: project.name,
                          description: project.description || "",
                          clientId: project.clientId,
                          status: project.status,
                          dueDate: project.dueDate ? new Date(project.dueDate) : undefined,
                        }}
                        onSubmit={handleProjectSubmit} 
                        isSubmitting={projectMutation.isPending} 
                      />
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Project not found
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="tasks" className="p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h2 className="text-lg font-semibold">Project Tasks</h2>
                        {tasks.length > 0 && (
                          <p className="text-sm text-gray-500 mt-1">
                            {calculateCompletion()}% completed
                          </p>
                        )}
                      </div>
                      <Button onClick={handleAddTask}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Task
                      </Button>
                    </div>
                    
                    {tasksLoading ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                      </div>
                    ) : tasks.length > 0 ? (
                      <Card>
                        <CardContent className="p-0">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[300px]">Task</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {tasks.map((task) => (
                                <TableRow key={task.id}>
                                  <TableCell className="font-medium">
                                    {task.name}
                                    {task.description && (
                                      <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                                        {task.description}
                                      </p>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Select
                                      value={task.status}
                                      onValueChange={(value) => handleTaskStatusChange(task.id, value)}
                                    >
                                      <SelectTrigger className="w-[140px]">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="in progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell>
                                    {task.dueDate 
                                      ? format(new Date(task.dueDate), "MMM d, yyyy")
                                      : "No due date"
                                    }
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEditTask(task)}
                                      className="h-8 w-8"
                                    >
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
                                        className="text-gray-500"
                                      >
                                        <path d="M18 2l2 2-13 13-4 1 1-4L17 2z"></path>
                                      </svg>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteTask(task.id)}
                                      className="h-8 w-8 text-red-500"
                                    >
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
                                      >
                                        <path d="M3 6h18"></path>
                                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                      </svg>
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="text-center p-8 border rounded-lg bg-gray-50">
                        <p className="text-gray-500 mb-2">No tasks yet for this project</p>
                        <Button onClick={handleAddTask}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add First Task
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="files" className="p-4 sm:p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <FileUpload 
                          projectId={projectId as number} 
                          onSuccess={() => queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/files`] })}
                        />
                      </div>
                      
                      <div>
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle>Project Files</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {filesLoading ? (
                              <div className="flex justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                              </div>
                            ) : files.length > 0 ? (
                              <ul className="divide-y">
                                {files.map((file) => (
                                  <li key={file.id} className="py-2 flex items-center justify-between">
                                    <div className="flex items-center">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-primary-600 mr-2"
                                      >
                                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                      </svg>
                                      <div>
                                        <p className="text-sm font-medium">{file.name}</p>
                                        <p className="text-xs text-gray-500">
                                          {file.fileSize < 1024 * 1024
                                            ? `${(file.fileSize / 1024).toFixed(1)} KB`
                                            : `${(file.fileSize / (1024 * 1024)).toFixed(1)} MB`
                                          }
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button variant="ghost" size="sm" asChild>
                                        <a href={`/api/files/${file.id}`} target="_blank" rel="noopener noreferrer">
                                          Download
                                        </a>
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        className="h-8 w-8 text-red-500"
                                        onClick={() => {
                                          if (confirm("Are you sure you want to delete this file?")) {
                                            apiRequest("DELETE", `/api/files/${file.id}`).then(() => {
                                              queryClient.invalidateQueries({ 
                                                queryKey: [`/api/projects/${projectId}/files`] 
                                              });
                                              toast({
                                                title: "File deleted",
                                                description: "File has been deleted successfully",
                                              });
                                            });
                                          }
                                        }}
                                      >
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
                                        >
                                          <path d="M3 6h18"></path>
                                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                                          <line x1="10" y1="11" x2="10" y2="17"></line>
                                          <line x1="14" y1="11" x2="14" y2="17"></line>
                                        </svg>
                                      </Button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-center py-6 text-gray-500">
                                No files uploaded yet
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="p-4 sm:p-6">
                  <ProjectForm 
                    onSubmit={handleProjectSubmit} 
                    isSubmitting={projectMutation.isPending}
                    preselectedClientId={preselectedClientId}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
        
        <MobileNav />
      </div>

      {/* Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "Add Task"}</DialogTitle>
          </DialogHeader>
          
          <Form {...taskForm}>
            <form onSubmit={taskForm.handleSubmit(handleTaskSubmit)} className="space-y-4">
              <FormField
                control={taskForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={taskForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter task description" 
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={taskForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={taskForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field}
                          value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value ? new Date(value) : undefined);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
                >
                  {(createTaskMutation.isPending || updateTaskMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingTask ? "Update" : "Create"} Task
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

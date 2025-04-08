import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileSpreadsheet,
  Clock,
  Calendar,
  Upload,
  CheckCircle2,
  ExternalLink,
  Info,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export default function ClientView() {
  const params = useParams();
  const [, navigate] = useLocation();
  const projectUuid = params.uuid;
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch project data by UUID
  const {
    data: projectData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`/api/project-view/${projectUuid}`],
  });

  // If loading, show a loading spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Loading project details...</h2>
          <p className="text-gray-500 mt-2">Please wait while we fetch your project information</p>
        </div>
      </div>
    );
  }

  // If there was an error fetching data
  if (error || !projectData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">Project Not Found</h1>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              The project link you're trying to access is invalid or has expired.
              Please contact the project owner for an updated link.
            </p>
            <div className="mt-6">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { project, client, tasks, files, estimates, activities } = projectData;

  // Format due date
  const formattedDueDate = project.dueDate
    ? format(new Date(project.dueDate), "MMMM d, yyyy")
    : "No due date set";

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

  // Calculate completion percentage based on tasks
  const calculateCompletion = () => {
    if (!tasks || tasks.length === 0) return project.progress || 0;
    const completedTasks = tasks.filter(t => t.status === "completed").length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-md bg-primary-600 flex items-center justify-center">
                <span className="text-white text-xl font-bold">C</span>
              </div>
              <h1 className="ml-3 text-2xl font-bold text-gray-900">ClientPro</h1>
            </div>
            <div className="text-sm text-gray-500">Client Portal</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <h1 className="text-2xl font-bold text-gray-900 mr-3">{project.name}</h1>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <p className="text-gray-500 mb-4">{project.description}</p>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="mr-1 h-4 w-4" />
                <span className="mr-4">Client: {client.name}</span>
                <Calendar className="mr-1 h-4 w-4" />
                <span>Due: {formattedDueDate}</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0 md:ml-4">
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Project Completion</div>
                <div className="text-2xl font-bold">{project.progress || calculateCompletion()}%</div>
              </div>
              <Progress value={project.progress || calculateCompletion()} className="h-2 mt-2 w-32" />
            </div>
          </div>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="estimates">Estimates</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project Details */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="mt-1">{project.description || "No description provided."}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <p className="mt-1">{project.status}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
                      <p className="mt-1">{formattedDueDate}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Progress</h3>
                      <div className="mt-2">
                        <div className="flex justify-between items-center mb-1 text-sm">
                          <span className="text-gray-700 font-medium">{project.progress || calculateCompletion()}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-primary-600 h-2.5 rounded-full" 
                            style={{ width: `${project.progress || calculateCompletion()}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {activities && activities.length > 0 ? (
                    <ul className="space-y-4">
                      {activities.slice(0, 5).map((activity) => (
                        <li key={activity.id} className="flex space-x-3">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <Info className="h-4 w-4 text-primary-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-800">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {format(new Date(activity.createdAt), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No recent activity
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Project Tasks</CardTitle>
                <CardDescription>
                  Progress: {calculateCompletion()}% complete
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tasks && tasks.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">
                            {task.name}
                            {task.description && (
                              <p className="text-xs text-gray-500 mt-1">
                                {task.description}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={
                                task.status === "completed" 
                                  ? "bg-green-100 text-green-800" 
                                  : task.status === "in progress" 
                                    ? "bg-blue-100 text-blue-800" 
                                    : "bg-gray-100"
                              }
                            >
                              {task.status === "completed" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                              {task.status === "in progress" && <Clock className="mr-1 h-3 w-3" />}
                              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {task.dueDate 
                              ? format(new Date(task.dueDate), "MMM d, yyyy")
                              : "No due date"
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No tasks have been added to this project yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files">
            <Card>
              <CardHeader>
                <CardTitle>Project Files</CardTitle>
                <CardDescription>
                  Files shared with you by the project owner
                </CardDescription>
              </CardHeader>
              <CardContent>
                {files && files.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {files.map((file) => (
                      <div 
                        key={file.id} 
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start">
                          <div className="bg-gray-100 p-2 rounded-lg mr-3">
                            <Upload className="h-8 w-8 text-primary-600" />
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
                        <div className="flex justify-end mt-3">
                          <Button variant="outline" size="sm" asChild>
                            <a 
                              href={`/api/files/${file.id}?uuid=${projectUuid}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View File
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No files have been shared for this project yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Estimates Tab */}
          <TabsContent value="estimates">
            <Card>
              <CardHeader>
                <CardTitle>Project Estimates</CardTitle>
                <CardDescription>
                  Cost estimates for your project
                </CardDescription>
              </CardHeader>
              <CardContent>
                {estimates && estimates.length > 0 ? (
                  <div className="space-y-6">
                    {estimates.map((estimate) => (
                      <Card key={estimate.id} className="border shadow-sm">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-center">
                            <CardTitle>{estimate.title}</CardTitle>
                            <Badge 
                              variant="outline" 
                              className={
                                estimate.status === "approved" 
                                  ? "bg-green-100 text-green-800" 
                                  : estimate.status === "rejected" 
                                    ? "bg-red-100 text-red-800" 
                                    : "bg-blue-100 text-blue-800"
                              }
                            >
                              {estimate.status}
                            </Badge>
                          </div>
                          <CardDescription>
                            Created on {format(new Date(estimate.createdAt), "MMMM d, yyyy")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {estimate.items && estimate.items.length > 0 ? (
                            <>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[300px]">Description</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {estimate.items.map((item, index) => (
                                    <TableRow key={item.id || index}>
                                      <TableCell className="font-medium">{item.description}</TableCell>
                                      <TableCell>{item.quantity}</TableCell>
                                      <TableCell>{formatCurrency(item.price)}</TableCell>
                                      <TableCell className="text-right">
                                        {formatCurrency(item.quantity * item.price)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                              <div className="flex justify-end mt-4">
                                <div className="text-right">
                                  <p className="text-sm text-gray-500 mb-1">Total Amount:</p>
                                  <p className="text-xl font-bold">{formatCurrency(estimate.totalAmount)}</p>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              No items in this estimate
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No estimates have been created for this project yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-md bg-primary-600 flex items-center justify-center">
                <span className="text-white text-lg font-bold">C</span>
              </div>
              <span className="ml-2 text-gray-600">ClientPro</span>
            </div>
            <div className="mt-4 md:mt-0 text-sm text-gray-500">
              This is a secure client portal. Contact your project manager for assistance.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

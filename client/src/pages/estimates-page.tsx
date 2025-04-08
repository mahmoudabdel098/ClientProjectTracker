import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Estimate, Client, Project } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2, MoreHorizontal, SendHorizontal, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function EstimatesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [estimateToDelete, setEstimateToDelete] = useState<Estimate | null>(null);
  
  // Fetch estimates
  const { data: estimates = [], isLoading } = useQuery<Estimate[]>({
    queryKey: ["/api/estimates"],
  });

  // Helper to get client map
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Helper to get project map
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Delete estimate mutation
  const deleteEstimateMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/estimates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      toast({
        title: "Estimate deleted",
        description: "Estimate has been deleted successfully",
      });
      setEstimateToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete estimate: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Change status mutation
  const updateEstimateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PUT", `/api/estimates/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      toast({
        title: "Status updated",
        description: "Estimate status has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDeleteEstimate = (estimate: Estimate) => {
    setEstimateToDelete(estimate);
  };

  const confirmDelete = () => {
    if (estimateToDelete) {
      deleteEstimateMutation.mutate(estimateToDelete.id);
    }
  };

  const handleSendEstimate = (estimateId: number) => {
    updateEstimateStatusMutation.mutate({ id: estimateId, status: "sent" });
    toast({
      title: "Estimate sent",
      description: "The estimate status has been updated to sent",
    });
  };

  // Get client name by ID
  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : "Unknown Client";
  };

  // Get project name by ID
  const getProjectName = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : "Unknown Project";
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline" className="bg-gray-100">Draft</Badge>;
      case "sent":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Sent</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Table columns
  const columns: ColumnDef<Estimate>[] = [
    {
      accessorKey: "title",
      header: "Estimate",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            <Link href={`/estimates/${row.original.id}`}>
              <a className="text-primary-600 hover:text-primary-700">
                {row.original.title}
              </a>
            </Link>
          </div>
          <div className="text-sm text-gray-500">
            {getProjectName(row.original.projectId)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "clientId",
      header: "Client",
      cell: ({ row }) => getClientName(row.original.clientId),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }) => formatCurrency(row.original.totalAmount / 100),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => format(new Date(row.original.createdAt), "MMM d, yyyy"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/estimates/${row.original.id}`)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {row.original.status === "draft" && (
              <DropdownMenuItem onClick={() => handleSendEstimate(row.original.id)}>
                <SendHorizontal className="mr-2 h-4 w-4" />
                Mark as Sent
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => window.open(`/estimates/${row.original.id}/preview`, "_blank")}>
              <FileText className="mr-2 h-4 w-4" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDeleteEstimate(row.original)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar isMobileOpen={sidebarOpen} onCloseMobile={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col md:pl-64">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-6 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Estimates</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Create and manage client estimates
                </p>
              </div>
              <Button onClick={() => navigate("/estimates/new")}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Estimate
              </Button>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg">
              <DataTable 
                columns={columns} 
                data={estimates} 
                searchField="title" 
                searchPlaceholder="Search estimates..." 
              />
            </div>
          </div>
        </main>
        
        <MobileNav />
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!estimateToDelete} onOpenChange={(open) => !open && setEstimateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this estimate and all associated items.
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

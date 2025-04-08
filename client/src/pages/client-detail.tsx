import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Client, Project, insertClientSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import ProjectCard from "@/components/project-card";
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
import { ArrowLeft, Save, Loader2, PlusCircle, LinkIcon } from "lucide-react";

const clientFormSchema = insertClientSchema.pick({
  name: true,
  email: true,
  phone: true,
  company: true,
}).extend({
  name: z.string().min(3, "Client name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  company: z.string().optional().or(z.literal("")),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

export default function ClientDetail() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const isNewClient = params.id === "new";
  const clientId = isNewClient ? null : parseInt(params.id);

  // Set up form
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
    },
  });

  // Fetch client data if editing
  const { data: client, isLoading: clientLoading } = useQuery<Client>({
    queryKey: [`/api/clients/${clientId}`],
    enabled: !isNewClient && !!clientId,
  });

  // Fetch client projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: [`/api/projects?clientId=${clientId}`],
    enabled: !isNewClient && !!clientId,
  });

  // Update form values when client data is loaded
  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name,
        email: client.email || "",
        phone: client.phone || "",
        company: client.company || "",
      });
    }
  }, [client, form]);

  // Create or update client mutation
  const clientMutation = useMutation({
    mutationFn: async (data: ClientFormValues) => {
      if (isNewClient) {
        return apiRequest("POST", "/api/clients", data);
      } else {
        return apiRequest("PUT", `/api/clients/${clientId}`, data);
      }
    },
    onSuccess: async (response) => {
      const clientData = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      
      if (isNewClient) {
        navigate(`/clients/${clientData.id}`);
        toast({
          title: "Client created",
          description: "New client has been created successfully",
        });
      } else {
        toast({
          title: "Client updated",
          description: "Client information has been updated",
        });
        queryClient.invalidateQueries({ queryKey: [`/api/clients/${clientId}`] });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isNewClient ? "create" : "update"} client: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  async function onSubmit(data: ClientFormValues) {
    await clientMutation.mutateAsync(data);
  }

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
                onClick={() => navigate("/clients")}
                className="mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isNewClient ? "New Client" : client?.name || "Client Details"}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {isNewClient 
                    ? "Create a new client profile" 
                    : "Manage client information and projects"}
                </p>
              </div>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg">
              {!isNewClient ? (
                <Tabs defaultValue="details">
                  <div className="px-4 sm:px-6 pt-4">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="projects">Projects</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="details" className="p-4 sm:p-6">
                    {clientLoading ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                      </div>
                    ) : (
                      <ClientForm 
                        form={form} 
                        onSubmit={onSubmit} 
                        isSubmitting={clientMutation.isPending} 
                      />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="projects" className="p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Client Projects</h2>
                      <Button onClick={() => navigate(`/projects/new?clientId=${clientId}`)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Project
                      </Button>
                    </div>
                    
                    {projectsLoading ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                      </div>
                    ) : projects.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {projects.map(project => (
                          <ProjectCard key={project.id} project={project} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-8 border rounded-lg bg-gray-50">
                        <p className="text-gray-500 mb-2">No projects yet for this client</p>
                        <Button onClick={() => navigate(`/projects/new?clientId=${clientId}`)}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Create First Project
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="p-4 sm:p-6">
                  <ClientForm 
                    form={form} 
                    onSubmit={onSubmit} 
                    isSubmitting={clientMutation.isPending} 
                  />
                </div>
              )}
            </div>
          </div>
        </main>
        
        <MobileNav />
      </div>
    </div>
  );
}

interface ClientFormProps {
  form: any;
  onSubmit: (data: ClientFormValues) => void;
  isSubmitting: boolean;
}

function ClientForm({ form, onSubmit, isSubmitting }: ClientFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter client name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input placeholder="Enter company name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Client
          </Button>
        </div>
      </form>
    </Form>
  );
}

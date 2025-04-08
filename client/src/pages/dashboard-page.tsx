import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import StatsCard from "@/components/stats-card";
import ProjectCard from "@/components/project-card";
import ActivityFeed from "@/components/activity-feed";
import ClientList from "@/components/client-list";
import { Project, Client, Activity } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);
  
  // Fetch projects
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: !!user,
  });

  // Fetch clients
  const { data: clients, isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    enabled: !!user,
  });

  // Fetch activities
  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    enabled: !!user,
  });
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in useEffect
  }

  // Calculate stats
  const stats = {
    activeClients: clients?.length || 0,
    activeProjects: projects?.filter(p => p.status !== "completed")?.length || 0,
    pendingEstimates: 0,
    filesShared: 0
  };

  // Get recent projects (limit to 3)
  const recentProjects = projects?.slice(0, 3) || [];
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar isMobileOpen={sidebarOpen} onCloseMobile={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col md:pl-64">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-6 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto">
            {/* Dashboard Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, {user?.fullName || user?.username}
              </p>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatsCard 
                title="Active Clients"
                value={stats.activeClients}
                icon="clients"
                change={"+3"}
                changeDirection="up"
              />
              <StatsCard 
                title="Active Projects"
                value={stats.activeProjects}
                icon="projects"
                change={"+2"}
                changeDirection="up"
              />
              <StatsCard 
                title="Pending Estimates"
                value={stats.pendingEstimates}
                icon="estimates"
                change={"-1"}
                changeDirection="down"
              />
              <StatsCard 
                title="Files Shared"
                value={stats.filesShared}
                icon="files"
                change={"+8"}
                changeDirection="up"
              />
            </div>
            
            {/* Projects Section */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
              <Link href="/projects">
                <a className="text-primary-600 text-sm font-medium hover:text-primary-700">
                  View all
                </a>
              </Link>
            </div>
            
            {projectsLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            ) : recentProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {recentProjects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center mb-8">
                <h3 className="text-gray-500 mb-2">No projects yet</h3>
                <Link href="/projects/new">
                  <a className="text-primary-600 font-medium hover:text-primary-700">
                    Create your first project
                  </a>
                </Link>
              </div>
            )}
            
            {/* Recent Activity and Clients */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ActivityFeed activities={activities || []} isLoading={activitiesLoading} />
              </div>
              
              <div>
                <ClientList clients={clients || []} isLoading={clientsLoading} />
              </div>
            </div>
          </div>
        </main>
        
        <MobileNav />
      </div>
    </div>
  );
}

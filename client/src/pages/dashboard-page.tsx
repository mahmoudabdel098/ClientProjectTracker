import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import TestSidebar from "@/components/layout/test-sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import StatsCard from "@/components/stats-card";
import ProjectCard from "@/components/project-card";
import ActivityFeed from "@/components/activity-feed";
import ClientList from "@/components/client-list";
import { Project, Client, Activity, Estimate, File } from "@shared/schema";
import { Loader2, PlusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const [userData, setUserData] = useState<any>(null);
  
  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiRequest("GET", "/api/user");
        if (res.ok) {
          const user = await res.json();
          setUserData(user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, []);
  
  // Fetch projects
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Fetch clients
  const { data: clients, isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Fetch activities
  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });
  
  // Fetch estimates
  const { data: estimates, isLoading: estimatesLoading } = useQuery<Estimate[]>({
    queryKey: ["/api/estimates"],
  });
  
  // Fetch files
  const { data: files, isLoading: filesLoading } = useQuery<File[]>({
    queryKey: ["/api/files"],
  });
  
  if (!userData && (projectsLoading || clientsLoading || activitiesLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Calculate stats
  const stats = {
    activeClients: clients?.length || 0,
    activeProjects: projects?.filter(p => p.status !== "completed")?.length || 0,
    pendingEstimates: estimates?.filter(e => e.status === "draft")?.length || 0,
    filesShared: files?.length || 0
  };

  // Get recent projects (limit to 3)
  const recentProjects = projects?.slice(0, 3) || [];
  
  const handleCreateProject = () => {
    navigate("/projects/new");
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <TestSidebar isMobileOpen={sidebarOpen} onCloseMobile={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col md:pl-64">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-6 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto">
            {/* Dashboard Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{t("dashboard.title")}</h1>
              <p className="mt-1 text-sm text-gray-500">
                {t("dashboard.welcome", { name: userData?.fullName || userData?.username })}
              </p>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatsCard 
                title={t("dashboard.stats.clients")}
                value={stats.activeClients}
                icon="clients"
                change={`+${stats.activeClients > 0 ? stats.activeClients : 0}`}
                changeDirection={stats.activeClients > 0 ? "up" : "none"}
              />
              <StatsCard 
                title={t("dashboard.stats.projects")}
                value={stats.activeProjects}
                icon="projects"
                change={`+${stats.activeProjects > 0 ? stats.activeProjects : 0}`}
                changeDirection={stats.activeProjects > 0 ? "up" : "none"}
              />
              <StatsCard 
                title={t("dashboard.stats.estimates")}
                value={stats.pendingEstimates}
                icon="estimates"
                change={`+${stats.pendingEstimates > 0 ? stats.pendingEstimates : 0}`}
                changeDirection={stats.pendingEstimates > 0 ? "up" : "none"}
              />
              <StatsCard 
                title={t("dashboard.stats.files")}
                value={stats.filesShared}
                icon="files"
                change={`+${stats.filesShared > 0 ? stats.filesShared : 0}`}
                changeDirection={stats.filesShared > 0 ? "up" : "none"}
              />
            </div>
            
            {/* Projects Section */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t("dashboard.recentProjects")}</h2>
              <Button 
                variant="link"
                className="text-primary-600 p-0 h-auto font-medium hover:text-primary-700"
                onClick={() => navigate("/projects")}
              >
                {t("common.viewAll")}
              </Button>
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
                <h3 className="text-gray-500 mb-2">{t("dashboard.noProjects")}</h3>
                <Button 
                  variant="link" 
                  className="text-primary-600 p-0 h-auto font-medium hover:text-primary-700"
                  onClick={handleCreateProject}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t("dashboard.createProject")}
                </Button>
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

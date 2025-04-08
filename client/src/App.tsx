import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import DashboardPage from "@/pages/dashboard-page";
import ClientsPage from "@/pages/clients-page";
import ClientDetail from "@/pages/client-detail";
import ProjectsPage from "@/pages/projects-page";
import ProjectDetail from "@/pages/project-detail";
import EstimatesPage from "@/pages/estimates-page";
import FilesPage from "@/pages/files-page";
import ClientView from "@/pages/client-view";
import { useAuth } from "@/hooks/use-auth";

// Internal protected route component
function ProtectedRouteComponent({
  component: Component
}: {
  component: () => JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <Component />;
}

function App() {
  return (
    <>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/home" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/client-view/:uuid" component={ClientView} />
        <Route path="/dashboard">
          <ProtectedRouteComponent component={DashboardPage} />
        </Route>
        <Route path="/clients">
          <ProtectedRouteComponent component={ClientsPage} />
        </Route>
        <Route path="/clients/:id">
          <ProtectedRouteComponent component={ClientDetail} />
        </Route>
        <Route path="/projects">
          <ProtectedRouteComponent component={ProjectsPage} />
        </Route>
        <Route path="/projects/:id">
          <ProtectedRouteComponent component={ProjectDetail} />
        </Route>
        <Route path="/estimates">
          <ProtectedRouteComponent component={EstimatesPage} />
        </Route>
        <Route path="/files">
          <ProtectedRouteComponent component={FilesPage} />
        </Route>
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;

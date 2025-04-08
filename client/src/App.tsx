import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
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
import { ProtectedRoute } from "./lib/protected-route";

function App() {
  return (
    <>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/home" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/client-view/:uuid" component={ClientView} />
        <ProtectedRoute path="/dashboard" component={DashboardPage} />
        <ProtectedRoute path="/clients" component={ClientsPage} />
        <ProtectedRoute path="/clients/:id" component={ClientDetail} />
        <ProtectedRoute path="/projects" component={ProjectsPage} />
        <ProtectedRoute path="/projects/:id" component={ProjectDetail} />
        <ProtectedRoute path="/estimates" component={EstimatesPage} />
        <ProtectedRoute path="/files" component={FilesPage} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;

import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import "./index.css";

// Import i18n configuration first, before any components that might use it
import "./i18n";

// Then import app and providers
import App from "./App";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);

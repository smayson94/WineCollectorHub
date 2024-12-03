import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route } from "wouter";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Bins from "./pages/Bins";
import Analytics from "./pages/Analytics";
import Wines from "./pages/Wines";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto py-6 px-4">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/bins" component={Bins} />
          <Route path="/wines" component={Wines} />
          <Route path="/analytics" component={Analytics} />
          <Route>404 Page Not Found</Route>
        </Switch>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
);

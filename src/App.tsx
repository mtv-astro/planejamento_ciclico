import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";

import Index from "./pages/index";
import NotFound from "./pages/NotFound";
import Privacidade from "./pages/privacidade";
import LoginPage from "./pages/login";
import ExplorerPage from "./pages/explorer";
import AccountPage from "./pages/account";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getSupabase } from "@/lib/supabase";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      setIsAuthenticated(Boolean(session));
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/explorer"
          element={
            <ProtectedRoute loading={loading} isAuthenticated={isAuthenticated}>
              <ExplorerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-maps"
          element={
            <ProtectedRoute loading={loading} isAuthenticated={isAuthenticated}>
              <ExplorerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mapas/:chartId"
          element={
            <ProtectedRoute loading={loading} isAuthenticated={isAuthenticated}>
              <ExplorerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/conta"
          element={
            <ProtectedRoute loading={loading} isAuthenticated={isAuthenticated}>
              <AccountPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <WhatsAppButton />
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppRoutes />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

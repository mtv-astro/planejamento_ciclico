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
import AppHomePage from "./pages/app";
import ExplorerPage from "./pages/explorer";
import AccountPage from "./pages/account";
import BibliotecaPage from "./pages/biblioteca";
import AdminPage from "./pages/admin";
import ModulePlaceholderPage from "./pages/module-placeholder";
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
          path="/app"
          element={
            <ProtectedRoute loading={loading} isAuthenticated={isAuthenticated} requiredAccess="app">
              <AppHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ciclo"
          element={
            <ProtectedRoute loading={loading} isAuthenticated={isAuthenticated} requiredAccess="ciclo">
              <ModulePlaceholderPage
                kicker="Camada macro"
                title="Ciclo"
                description="Aqui vai viver a leitura macro do metodo: estacao atual, lunacao, mandala, 12 casas e historico de ativacoes."
                items={["Estacao atual", "Lunacao", "Mandala pessoal", "12 casas", "Historico"]}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/planejar"
          element={
            <ProtectedRoute loading={loading} isAuthenticated={isAuthenticated} requiredAccess="planejar">
              <ModulePlaceholderPage
                kicker="Camada tatica"
                title="Planejar"
                description="Area de planejamento semanal, prioridades, habitos, check-in diario e revisoes curtas do ciclo."
                items={["Semana atual", "Prioridades", "Habitos", "Check-in", "Revisao curta"]}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/biblioteca"
          element={
            <ProtectedRoute loading={loading} isAuthenticated={isAuthenticated} requiredAccess="biblioteca">
              <BibliotecaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute loading={loading} isAuthenticated={isAuthenticated}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/explorer"
          element={
            <ProtectedRoute loading={loading} isAuthenticated={isAuthenticated}>
              <ExplorerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/galeria"
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

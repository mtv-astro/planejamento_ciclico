import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Component, ReactNode, useEffect, useState } from "react";

import Index from "./pages/index";
import NotFound from "./pages/NotFound";
import Privacidade from "./pages/privacidade";
import LoginPage from "./pages/login";
import AppHomePage from "./pages/app";
import ExplorerPage from "./pages/explorer";
import AccountPage from "./pages/account";
import BibliotecaPage from "./pages/biblioteca";
import PlanejarPage from "./pages/planejar";
import CicloPage from "./pages/ciclo";
import AdminPage from "./pages/admin";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getSupabase } from "@/lib/supabase";

const queryClient = new QueryClient();

class GlobalErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("GlobalErrorBoundary", error);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="min-h-screen bg-offwhite-leve px-4 py-8 text-gray-900">
          <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-red-600">Erro de runtime</p>
            <h1 className="mt-3 text-3xl font-semibold">O app caiu durante o carregamento.</h1>
            <p className="mt-4 text-sm text-muted-foreground">A mensagem abaixo mostra a excecao atual para conseguirmos corrigir o ponto exato, em vez de seguir com tela branca.</p>
            <pre className="mt-6 overflow-x-auto rounded-2xl bg-red-50 p-4 text-sm text-red-800 whitespace-pre-wrap">{this.state.error.message}</pre>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

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
              <CicloPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/planejar"
          element={
            <ProtectedRoute loading={loading} isAuthenticated={isAuthenticated} requiredAccess="planejar">
              <PlanejarPage />
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
      <GlobalErrorBoundary>
        <AppRoutes />
      </GlobalErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

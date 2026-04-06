import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";

type ProtectedRouteProps = {
  loading: boolean;
  isAuthenticated: boolean;
  children: ReactNode;
};

export default function ProtectedRoute({ loading, isAuthenticated, children }: ProtectedRouteProps) {
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return <>{children}</>;
}

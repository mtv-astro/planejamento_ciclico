import { Navigate, useLocation } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { callFunction } from "@/lib/api";

type AccessKey = "app" | "ciclo" | "planejar" | "biblioteca";

type ProtectedRouteProps = {
  loading: boolean;
  isAuthenticated: boolean;
  requiredAccess?: AccessKey;
  children: ReactNode;
};

export default function ProtectedRoute({ loading, isAuthenticated, requiredAccess, children }: ProtectedRouteProps) {
  const location = useLocation();
  const [checkingAccess, setCheckingAccess] = useState(Boolean(requiredAccess));
  const [hasAccess, setHasAccess] = useState(!requiredAccess);

  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      if (!isAuthenticated || !requiredAccess) {
        setCheckingAccess(false);
        setHasAccess(!requiredAccess);
        return;
      }

      try {
        setCheckingAccess(true);
        const data = await callFunction("get-current-user");
        const permissions = data.user?.app_permissions || {};
        if (!cancelled) {
          setHasAccess(Boolean(permissions[requiredAccess]));
        }
      } catch {
        if (!cancelled) setHasAccess(false);
      } finally {
        if (!cancelled) setCheckingAccess(false);
      }
    }

    checkAccess();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, requiredAccess]);

  if (loading || checkingAccess) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (requiredAccess && !hasAccess) {
    return <Navigate to="/galeria" replace state={{ blockedFrom: `${location.pathname}${location.search}` }} />;
  }

  return <>{children}</>;
}

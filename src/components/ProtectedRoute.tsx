import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="page-loading">Chargement…</div>;
  if (!session) return <Navigate to="/connexion" state={{ from: location }} replace />;
  return <Outlet />;
}

export function AdminRoute() {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="page-loading">Chargement…</div>;
  if (!session) return <Navigate to="/connexion" state={{ from: location }} replace />;
  if (profile && profile.role !== "ADMIN") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

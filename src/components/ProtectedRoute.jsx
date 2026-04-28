import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({
  children,
  allowed



}) {
  const { user, role, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>);

  }
  if (!user) return <Navigate to="/auth" replace />;
  if (allowed && role && !allowed.includes(role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
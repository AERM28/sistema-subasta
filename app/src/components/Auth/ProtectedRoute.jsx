// src/components/auth/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "@/hooks/useUser";


export default function ProtectedRoute({
  requiredRoles = [],
  redirectTo = "/",
}) {
  const { isAuthenticated, authorize } = useUser();

  // 1. Si no está autenticado → redirige siempre
  if (!isAuthenticated) {
    return <Navigate to="/user/login" replace />;
  }

  // 2. Si hay roles requeridos → verifica que el usuario tenga uno de ellos
  if (requiredRoles.length > 0 && !authorize(requiredRoles)) {
    return <Navigate to={redirectTo} replace />;
  }

  // 3. Tiene acceso → renderiza la ruta hija
  return <Outlet />;
}
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { roleRoutes } from "../utils/roles.js";

export default function AdminReviewAccess() {
  const { user } = useAuth();
  if (user?.role !== "admin") {
    return <Navigate to={roleRoutes[user?.role] ?? "/"} replace />;
  }
  return <Outlet />;
}

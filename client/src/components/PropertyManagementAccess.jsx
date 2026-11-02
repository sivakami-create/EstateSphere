import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { roleRoutes } from "../utils/roles.js";

export default function PropertyManagementAccess() {
  const { user } = useAuth();
  if (user?.role !== "owner" && user?.role !== "pg_operator") {
    return <Navigate to={roleRoutes[user?.role] ?? "/"} replace />;
  }
  return <Outlet />;
}

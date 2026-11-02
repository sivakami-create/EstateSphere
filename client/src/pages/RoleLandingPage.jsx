import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getRoleWorkspace } from "../services/authApi.js";
import { roleLabels, roleRoutes } from "../utils/roles.js";
import { Link } from "react-router-dom";

export default function RoleLandingPage({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [workspaceUser, setWorkspaceUser] = useState(null);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getRoleWorkspace(role, { signal: controller.signal })
      .then(setWorkspaceUser)
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      });
    return () => controller.abort();
  }, [role]);

  if (user && user.role !== role) return <Navigate to={roleRoutes[user.role]} replace />;

  const signOut = async () => {
    setLoggingOut(true);
    setError("");
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
      setLoggingOut(false);
    }
  };

  return (
    <main className="workspace-page page-shell">
      <section className="workspace-card">
        <span className="eyebrow">MY ESTATESPHERE</span>
        <h1>Welcome, {workspaceUser?.fullName ?? user?.fullName ?? "..."}.</h1>
        <p className="workspace-role">{roleLabels[role]}</p>
        <p className="workspace-description">This is your secure EstateSphere landing page. Your dedicated workspace will grow here in a future phase.</p>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {(role === "owner" || role === "pg_operator") && (
          <>
            <Link className="solid-link management-workspace-link" to={`${roleRoutes[role]}/properties`}>Manage properties <span aria-hidden="true">↗</span></Link>
            <Link className="solid-link management-workspace-link" to={`${roleRoutes[role]}/requests`}>Enquiries & Visit Requests <span aria-hidden="true">↗</span></Link>
          </>
        )}
        {role === "tenant" && (
          <Link className="solid-link management-workspace-link" to="/tenant/requests">My Enquiries & Visits <span aria-hidden="true">↗</span></Link>
        )}
        {role === "admin" && (
          <Link className="solid-link management-workspace-link" to="/admin/properties">Review property listings <span aria-hidden="true">↗</span></Link>
        )}
        <button className="auth-submit workspace-logout" type="button" onClick={signOut} disabled={loggingOut}>
          {loggingOut ? "Signing out…" : "Log out"}<span aria-hidden="true">↗</span>
        </button>
      </section>
    </main>
  );
}

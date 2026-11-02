import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { roleLabels, roleRoutes } from "../utils/roles.js";

export default function AuthPage({ mode }) {
  const isRegistration = mode === "register";
  const { user, loading, login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "tenant",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <main className="page-shell listing-state details-load-state" role="status">Checking your EstateSphere session…</main>;
  }

  if (user) {
    return <Navigate to={roleRoutes[user.role]} replace />;
  }

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const authenticatedUser = isRegistration
        ? await register({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
          role: form.role,
        })
        : await login({ email: form.email, password: form.password });
      navigate(roleRoutes[authenticatedUser.role], { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page page-shell">
      <div className="auth-card">
        <Link className="auth-home-link" to="/">← Back to EstateSphere</Link>
        <span className="eyebrow">{isRegistration ? "A WARMER WELCOME HOME" : "WELCOME BACK"}</span>
        <h1>{isRegistration ? "Create your account." : "Sign in to EstateSphere."}</h1>
        <p className="auth-intro">
          {isRegistration
            ? "Join EstateSphere to make your next home search a little easier."
            : "Sign in to continue to your EstateSphere space."}
        </p>

        <form className="auth-form" onSubmit={submit}>
          {isRegistration && (
            <>
              <label>
                Full name
                <input name="fullName" type="text" autoComplete="name" minLength={2} maxLength={100} value={form.fullName} onChange={update} required />
              </label>
              <label>
                I’m joining as
                <select name="role" value={form.role} onChange={update} required>
                  <option value="tenant">{roleLabels.tenant}</option>
                  <option value="owner">{roleLabels.owner}</option>
                  <option value="pg_operator">{roleLabels.pg_operator}</option>
                </select>
              </label>
              <label>
                Phone <span className="auth-optional">(optional)</span>
                <input name="phone" type="tel" autoComplete="tel" maxLength={20} value={form.phone} onChange={update} />
              </label>
            </>
          )}
          <label>
            Email address
            <input name="email" type="email" autoComplete="email" maxLength={254} value={form.email} onChange={update} required />
          </label>
          <label>
            Password
            <input name="password" type="password" autoComplete={isRegistration ? "new-password" : "current-password"} minLength={isRegistration ? 12 : 1} maxLength={72} value={form.password} onChange={update} required />
            {isRegistration && <small>Use at least 12 characters.</small>}
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? "Please wait…" : isRegistration ? "Create account" : "Sign in"}
            {!submitting && <span aria-hidden="true">→</span>}
          </button>
        </form>

        <p className="auth-switch">
          {isRegistration ? "Already have an account?" : "New to EstateSphere?"}{" "}
          <Link to={isRegistration ? "/login" : "/register"}>{isRegistration ? "Sign in" : "Create an account"}</Link>
        </p>
        <p className="auth-security-note">Your password is securely hashed and is never returned by the API.</p>
      </div>
    </main>
  );
}

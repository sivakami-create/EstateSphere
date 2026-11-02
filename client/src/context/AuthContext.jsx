import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "../services/authApi.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    getCurrentUser({ signal: controller.signal })
      .then(setUser)
      .catch((error) => {
        if (error.name !== "AbortError" && error.status !== 401) {
          console.error("Could not restore EstateSphere session:", error.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async login(credentials) {
      const authenticatedUser = await loginUser(credentials);
      setUser(authenticatedUser);
      return authenticatedUser;
    },
    async register(details) {
      const registeredUser = await registerUser(details);
      setUser(registeredUser);
      return registeredUser;
    },
    async logout() {
      await logoutUser();
      setUser(null);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}

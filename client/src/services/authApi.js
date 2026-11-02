const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/+$/, "");

export class AuthApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    this.code = code;
  }
}

async function request(path, { method = "GET", body, signal } = {}) {
  let response;
  try {
    response = await fetch(`${apiBaseUrl}/auth${path}`, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(`Could not reach EstateSphere API at ${apiBaseUrl}. Start the backend and check the API URL.`);
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new AuthApiError(`EstateSphere API returned an invalid response (HTTP ${response.status}).`, response.status);
  }

  if (!response.ok || result.success !== true) {
    throw new AuthApiError(
      result.error?.message || `EstateSphere API request failed (HTTP ${response.status}).`,
      response.status,
      result.error?.code,
    );
  }
  return result.data;
}

export function getCurrentUser(options) {
  return request("/me", options);
}

export function registerUser(values) {
  return request("/register", { method: "POST", body: values });
}

export function loginUser(values) {
  return request("/login", { method: "POST", body: values });
}

export function logoutUser() {
  return request("/logout", { method: "POST" });
}

export function getRoleWorkspace(role, options) {
  return request(`/workspace/${encodeURIComponent(role)}`, options);
}

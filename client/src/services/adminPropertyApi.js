const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/+$/, "");

async function request(path, { method = "GET", body, signal } = {}) {
  let response;
  try {
    response = await fetch(`${apiBaseUrl}/admin/properties${path}`, {
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
    throw new Error(`EstateSphere API returned an invalid response (HTTP ${response.status}).`);
  }
  if (!response.ok || result.success !== true) {
    const error = new Error(result.error?.message || `EstateSphere API request failed (HTTP ${response.status}).`);
    error.status = response.status;
    error.code = result.error?.code;
    throw error;
  }
  return result;
}

export async function getReviewSummary({ signal } = {}) {
  const result = await request("/summary", { signal });
  return result.data;
}

export async function getReviewProperties(status, { signal } = {}) {
  const result = await request(`/?status=${encodeURIComponent(status)}`, { signal });
  return result.data;
}

export async function approveProperty(propertyId) {
  const result = await request(`/${encodeURIComponent(propertyId)}/approve`, { method: "POST" });
  return result.data;
}

export async function rejectProperty(propertyId, reason) {
  const result = await request(`/${encodeURIComponent(propertyId)}/reject`, {
    method: "POST",
    body: { reason },
  });
  return result.data;
}

export function resolveAdminPropertyImage(imagePath) {
  if (!imagePath.startsWith("/uploads/")) return imagePath;
  return new URL(imagePath, new URL(apiBaseUrl).origin).href;
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, { signal } = {}) {
  let response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, { signal });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(`Could not reach EstateSphere API at ${apiBaseUrl}. Start the backend and check the API URL.`);
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new ApiError(`EstateSphere API returned an invalid response (HTTP ${response.status}).`, response.status);
  }

  if (!response.ok || body.success !== true) {
    throw new ApiError(body.error?.message || `EstateSphere API request failed (HTTP ${response.status}).`, response.status);
  }

  return body;
}

export async function getProperties(filters = {}, { signal } = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  }
  const suffix = query.size ? `?${query.toString()}` : "";
  return request(`/properties${suffix}`, { signal });
}

export async function getPropertyById(propertyId, { signal } = {}) {
  return request(`/properties/${encodeURIComponent(propertyId)}`, { signal });
}

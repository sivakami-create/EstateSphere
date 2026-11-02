const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const serverBaseUrl = new URL(apiBaseUrl).origin;

async function request(path, { method = "GET", body, signal } = {}) {
  let response;
  try {
    response = await fetch(`${apiBaseUrl}/owner/properties${path}`, {
      method,
      credentials: "include",
      body,
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

function toFormData(values, files, existingImages = []) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, Array.isArray(value) ? JSON.stringify(value) : String(value));
  }
  formData.set("existingImages", JSON.stringify(existingImages));
  files.forEach((file) => formData.append("images", file));
  return formData;
}

export function getMyProperties({ signal } = {}) {
  return request("/", { signal });
}

export async function getMyProperty(propertyId, { signal } = {}) {
  const result = await request(`/${encodeURIComponent(propertyId)}`, { signal });
  return result.data;
}

export function createMyProperty(values, files) {
  return request("/", { method: "POST", body: toFormData(values, files) });
}

export function updateMyProperty(propertyId, values, files, existingImages) {
  return request(`/${encodeURIComponent(propertyId)}`, {
    method: "PATCH",
    body: toFormData(values, files, existingImages),
  });
}

export function deactivateMyProperty(propertyId) {
  return request(`/${encodeURIComponent(propertyId)}`, { method: "DELETE" });
}

export function resolvePropertyImage(imagePath) {
  return imagePath.startsWith("/uploads/") ? new URL(imagePath, serverBaseUrl).href : imagePath;
}

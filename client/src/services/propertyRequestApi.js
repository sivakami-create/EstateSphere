const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/+$/, "");

async function request(path, { method = "GET", body, idempotencyKey, signal } = {}) {
  let response;
  try {
    response = await fetch(`${apiBaseUrl}/requests${path}`, {
      method,
      credentials: "include",
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
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

export async function getMyRequests({ signal } = {}) {
  return request("/mine", { signal });
}

export async function getReceivedRequests(filters = {}, { signal } = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) query.set(key, value);
  }
  return request(`/received${query.size ? `?${query.toString()}` : ""}`, { signal });
}

export function createEnquiry(propertyId, values, idempotencyKey) {
  return request(`/${encodeURIComponent(propertyId)}/enquiries`, {
    method: "POST",
    body: values,
    idempotencyKey,
  });
}

export function createVisitRequest(propertyId, values, idempotencyKey) {
  return request(`/${encodeURIComponent(propertyId)}/visits`, {
    method: "POST",
    body: values,
    idempotencyKey,
  });
}

export function respondToEnquiry(requestId, response) {
  return request(`/${encodeURIComponent(requestId)}/respond`, {
    method: "PATCH",
    body: { response },
  });
}

export function decideVisitRequest(requestId, decision, reason, message = "") {
  return request(`/${encodeURIComponent(requestId)}/visit-decision`, {
    method: "PATCH",
    body: { decision, reason, message },
  });
}

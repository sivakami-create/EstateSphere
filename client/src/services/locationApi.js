const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/+$/, "");

export async function getIndiaLocations({ signal } = {}) {
  let response;
  try {
    response = await fetch(`${apiBaseUrl}/locations`, { signal });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(`Could not load location options from EstateSphere API at ${apiBaseUrl}.`);
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(`EstateSphere location API returned an invalid response (HTTP ${response.status}).`);
  }

  if (!response.ok || result.success !== true || !Array.isArray(result.data)) {
    throw new Error(result.error?.message || `EstateSphere location API request failed (HTTP ${response.status}).`);
  }
  return result.data;
}

import { API_BASE_URL, apiFetch } from "./apiClient.js";

async function request(path, options = {}) {
  let response;
  try {
    response = await apiFetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Unable to connect to the Brand Deals service. Please try again.",
    );
  }
  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const validationErrors =
      response.status === 422 && result?.errors
        ? Object.values(result.errors).flat().join("\n")
        : "";
    throw new Error(
      validationErrors ||
        (response.status >= 500
          ? "Unable to save the Brand Deal. Please try again."
          : result?.message || `Brand Deal request failed. HTTP ${response.status}`),
    );
  }

  return result;
}

export const collaborationsApi = {
  createAdmin(data) {
    return request("/admin/collaborations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  create(data) {
    return request("/collaborations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getAll() {
    return request("/collaborations");
  },

  getById(id) {
    return request(`/collaborations/${encodeURIComponent(id)}`);
  },

  update(id, data) {
    return request(`/collaborations/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  updateStatus(id, status) {
    return request(`/collaborations/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  updateReviewStatus(id, reviewStatus) {
    return request(`/collaborations/${encodeURIComponent(id)}/review-status`, {
      method: "PATCH",
      body: JSON.stringify({ review_status: reviewStatus }),
    });
  },
};

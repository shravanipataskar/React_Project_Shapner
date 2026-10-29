const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message || `Brand Deal request failed. HTTP ${response.status}`,
    );
  }

  return result;
}

export const collaborationsApi = {
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

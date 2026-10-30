import { API_BASE_URL, apiFetch } from "./apiClient.js";

export const auditionsApi = {
  async create(audition) {
    let response;

    try {
      response = await apiFetch(`${API_BASE_URL}/admin/auditions`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(audition),
      });
    } catch {
      throw new Error(
        "Unable to connect to the audition service. Please try again."
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
            ? "Unable to save the audition. Please try again."
            : result?.message || `Request failed: ${response.status}`)
      );
    }

    return result;
  },

  async getAll({ status = 1, search = "", page = 1 } = {}) {
    const params = new URLSearchParams({
      status: String(status),
      page: String(page),
    });

    if (search.trim()) {
      params.set("search", search.trim());
    }

    const response = await apiFetch(
      `${API_BASE_URL}/auditions?${params.toString()}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        result?.message || `Request failed: ${response.status}`
      );
    }

    return result;
  },

  async getById(id, { signal } = {}) {
    const response = await apiFetch(
      `${API_BASE_URL}/auditions/${encodeURIComponent(id)}`,
      {
        signal,
        headers: {
          Accept: "application/json",
        },
      }
    );

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(
        result?.message || `Request failed: ${response.status}`
      );
      error.status = response.status;
      throw error;
    }

    return result;
  },

  async update(id, audition) {
    const response = await apiFetch(
      `${API_BASE_URL}/auditions/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(audition),
      }
    );

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(
        result?.message || `Request failed: ${response.status}`
      );
      error.status = response.status;
      throw error;
    }

    return result;
  },

  async updateStatus(id, status) {
    const response = await apiFetch(
      `${API_BASE_URL}/auditions/${encodeURIComponent(id)}/status`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      }
    );

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(
        result?.message || `Request failed: ${response.status}`
      );
      error.status = response.status;
      throw error;
    }

    return result;
  },
};
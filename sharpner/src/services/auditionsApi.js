const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

export const auditionsApi = {
  async getAll({ status = 1, search = "", page = 1 } = {}) {
    const params = new URLSearchParams({
      status: String(status),
      page: String(page),
    });

    if (search.trim()) {
      params.set("search", search.trim());
    }

    const response = await fetch(
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
    const response = await fetch(
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
    const response = await fetch(
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
    const response = await fetch(
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
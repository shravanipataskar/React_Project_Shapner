import { API_BASE_URL, apiFetch } from "./apiClient.js";

export const ideasApi = {
  async createIdea(idea) {
    let response;
    try {
      response = await apiFetch(`${API_BASE_URL}/admin/creative-ideas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(idea),
      });
    } catch {
      throw new Error(
        "Unable to connect to the Creative Ideas service. Please try again."
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
            ? "Unable to save the creative idea. Please try again."
            : result?.message || `Request failed: ${response.status}`)
      );
    }

    return result;
  },

  async getIdeas() {
    const response = await apiFetch(
      `${API_BASE_URL}/creative-ideas`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch creative ideas. HTTP ${response.status}`
      );
    }

    const result = await response.json();

    console.log("Creative Ideas API:", result);

    return result;
  },

  async getIdea(id) {
    const response = await apiFetch(
      `${API_BASE_URL}/creative-ideas/${id}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch creative idea. HTTP ${response.status}`
      );
    }

    return response.json();
  },

  async updateStatus(id, status) {
    const response = await apiFetch(
      `${API_BASE_URL}/creative-ideas/${id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to update status. HTTP ${response.status}`
      );
    }

    return response.json();
  },

  async updateIdea(id, idea) {
    const response = await apiFetch(`${API_BASE_URL}/creative-ideas/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(idea),
    });

    if (!response.ok) {
      const result = await response.json().catch(() => null);
      throw new Error(
        result?.message || `Failed to update creative idea. HTTP ${response.status}`
      );
    }

    return response.json();
  },
};
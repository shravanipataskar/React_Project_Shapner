const API_BASE_URL = "http://127.0.0.1:8000/api";

export const ideasApi = {
  async getIdeas() {
    const response = await fetch(
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
    const response = await fetch(
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
    const response = await fetch(
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
};
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      data?.message || `Request failed with status ${response.status}`
    );

    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const videosApi = {
  getAll(params = {}) {
    const query = new URLSearchParams(params).toString();

    return request(`/videos${query ? `?${query}` : ""}`);
  },

  getById(id) {
    return request(`/videos/${id}`);
  },

  create(video) {
    return request("/videos", {
      method: "POST",
      body: JSON.stringify(video),
    });
  },

  update(id, video) {
    return request(`/videos/${id}`, {
      method: "PUT",
      body: JSON.stringify(video),
    });
  },

  delete(id) {
    return request(`/videos/${id}`, {
      method: "DELETE",
    });
  },
};

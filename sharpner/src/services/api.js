import { API_BASE_URL, apiFetch } from "./apiClient.js";

async function request(endpoint, options = {}) {
  const response = await apiFetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const validationErrors =
      response.status === 422 && data?.errors
        ? Object.values(data.errors).flat().join("\n")
        : "";
    const error = new Error(
      validationErrors ||
        (response.status >= 500
          ? "The service could not complete the request. Please try again."
          : data?.message || `Request failed with status ${response.status}`)
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

    return request(`/admin/videos${query ? `?${query}` : ""}`);
  },

  getPublicAll(params = {}) {
    const query = new URLSearchParams(params).toString();

    return request(`/videos${query ? `?${query}` : ""}`);
  },

  getById(id) {
    return request(`/admin/videos/${id}`);
  },

  create(video) {
    return request("/admin/videos", {
      method: "POST",
      body: JSON.stringify(video),
    });
  },

  update(id, video) {
    return request(`/admin/videos/${id}`, {
      method: "PUT",
      body: JSON.stringify(video),
    });
  },

  delete(id) {
    return request(`/admin/videos/${id}`, {
      method: "DELETE",
    });
  },
};

export const usersApi = {
  getAll() {
    return request("/users");
  },

  getCreateOptions() {
    return request("/users/options");
  },

  create(user) {
    return request("/users", {
      method: "POST",
      body: JSON.stringify(user),
    });
  },

  getById(id) {
    return request(`/users/${id}`);
  },

  update(id, user) {
    return request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    });
  },

  updateStatus(id, status) {
    return request(`/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

};

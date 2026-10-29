
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

async function request(endpoint, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new Error(
      "Cannot connect to Laravel. Check whether the backend server is running."
    );
  }

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      result?.message || `Request failed with status ${response.status}`
    );
    error.status = response.status;

    if (response.status === 422 && result?.errors) {
      const messages = Object.values(result.errors).flat().join("\n");
      error.message = messages;
    }

    throw error;
  }

  return result;
}

export const dholPathakApi = {
  getAll({ status = 1, search = "", page = 1 } = {}) {
    const params = new URLSearchParams({
      status: String(status),
      page: String(page),
    });

    if (search.trim()) {
      params.set("search", search.trim());
    }

    return request(`/dhol-pathaks?${params.toString()}`);
  },

  getById(id, { signal } = {}) {
    return request(`/dhol-pathaks/${encodeURIComponent(id)}`, { signal });
  },

  create(data) {
    return request("/dhol-pathaks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id, data) {
    return request(`/dhol-pathaks/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete(id) {
    return request(`/dhol-pathaks/${id}`, {
      method: "DELETE",
    });
  },
};

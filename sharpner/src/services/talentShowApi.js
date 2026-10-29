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
        ...(options.body instanceof FormData
          ? {}
          : options.body
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
      "Unable to connect to the Talent Show service. Please try again."
    );
  }

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      result?.message || `Request failed with status ${response.status}.`
    );
    error.status = response.status;

    if (response.status === 422 && result?.errors) {
      error.message = Object.values(result.errors).flat().join("\n");
    }

    throw error;
  }

  return result;
}

export const talentShowApi = {
  getAll({ status = "active", search = "", page = 1, signal } = {}) {
    const params = new URLSearchParams({
      status,
      page: String(page),
    });

    if (search.trim()) {
      params.set("search", search.trim());
    }

    return request(`/talent-shows?${params.toString()}`, { signal });
  },

  getById(id, { signal } = {}) {
    return request(`/talent-shows/${encodeURIComponent(id)}`, { signal });
  },

  update(id, data) {
    const endpoint = `/talent-shows/${encodeURIComponent(id)}`;

    if (data instanceof FormData) {
      data.set("_method", "PATCH");
      return request(endpoint, {
        method: "POST",
        body: data,
      });
    }

    return request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};

export function getTalentVideoUrl(value) {
  if (!value) {
    return "";
  }

  const videoPath = String(value).trim();
  if (/^(https?:)?\/\//i.test(videoPath) || videoPath.startsWith("blob:")) {
    return videoPath;
  }

  const apiOrigin = API_BASE_URL.replace(/\/api\/?$/i, "");
  const normalizedPath = videoPath.replace(/^\/+/, "");
  const publicPath =
    normalizedPath.startsWith("talent-videos/") ||
    normalizedPath.startsWith("talent-show/videos/")
      ? `storage/${normalizedPath}`
      : normalizedPath;
  return `${apiOrigin}/${publicPath}`;
}

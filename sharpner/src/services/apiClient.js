const localApiBaseUrl = `http://${window.location.hostname}:8000/api`;

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || localApiBaseUrl
).replace(/\/+$/, "");

export const API_ROOT_URL = API_BASE_URL.replace(/\/api\/?$/i, "");

function readCookie(name) {
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : "";
}

function normalizeApiUrl(url) {
  const target = new URL(url, window.location.origin);
  const loopbackHosts = ["localhost", "127.0.0.1"];

  if (
    loopbackHosts.includes(window.location.hostname) &&
    loopbackHosts.includes(target.hostname)
  ) {
    target.hostname = window.location.hostname;
  }

  return target;
}

async function ensureCsrfCookie(url) {
  const requestOrigin = normalizeApiUrl(url).origin;
  const response = await fetch(`${requestOrigin}/sanctum/csrf-cookie`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Unable to start a secure request. Please try again.");
  }
}

export async function apiFetch(url, options = {}) {
  const target = normalizeApiUrl(url);
  const headers = new Headers(options.headers || {});
  const method = (options.method || "GET").toUpperCase();

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    if (!readCookie("XSRF-TOKEN")) {
      await ensureCsrfCookie(url);
    }

    const xsrfToken = readCookie("XSRF-TOKEN");
    if (!xsrfToken) {
      throw new Error("Unable to create a secure request. Check the API host configuration.");
    }

    if (!headers.has("X-XSRF-TOKEN")) {
      headers.set("X-XSRF-TOKEN", xsrfToken);
    }
  }

  const response = await fetch(target, {
    ...options,
    credentials: "include",
    headers,
  });

  if (response.status === 401) {
    window.dispatchEvent(new Event("sharpner:unauthorized"));
  }

  return response;
}

import { API_BASE_URL, API_ROOT_URL, apiFetch } from "./apiClient.js";

async function readJson(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      response.status === 401
        ? "Invalid username or password."
        : "Unable to complete the authentication request. Please try again.",
    );
    error.status = response.status;
    throw error;
  }

  return data;
}

export const authApi = {
  async login(username, password) {
    const csrfResponse = await apiFetch(`${API_ROOT_URL}/sanctum/csrf-cookie`);
    if (!csrfResponse.ok) {
      throw new Error("Unable to start a secure login session. Please try again.");
    }

    const response = await apiFetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    return readJson(response);
  },

  async me() {
    return readJson(await apiFetch(`${API_BASE_URL}/auth/me`));
  },

  async logout() {
    return readJson(
      await apiFetch(`${API_BASE_URL}/auth/logout`, { method: "POST" }),
    );
  },
};

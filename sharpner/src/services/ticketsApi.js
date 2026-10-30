import { API_BASE_URL, apiFetch } from "./apiClient.js";

async function request(path, options = {}) {
  let response;

  try {
    response = await apiFetch(`${API_BASE_URL}${path}`, {
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
  } catch {
    throw new Error("Unable to connect to the ticket service. Please try again.");
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
          ? "Unable to save the ticket. Please try again."
          : result?.message || `Ticket request failed. HTTP ${response.status}`),
    );
  }

  return result;
}

export const ticketsApi = {
  getCreateOptions(applicationId = "") {
    const params = new URLSearchParams();
    if (applicationId) {
      params.set("application_id", applicationId);
    }
    const query = params.toString();
    return request(`/ticket-options${query ? `?${query}` : ""}`);
  },

  create(ticket) {
    return request("/tickets", {
      method: "POST",
      body: ticket,
    });
  },

  getById(id) {
    return request(`/tickets/${encodeURIComponent(id)}`);
  },

  update(id, ticket) {
    ticket.append("_method", "PUT");
    return request(`/tickets/${encodeURIComponent(id)}`, {
      method: "POST",
      body: ticket,
    });
  },

  updateStatus(id, status) {
    return request(`/tickets/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: Boolean(status) }),
    });
  },
};

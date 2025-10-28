const API_BASE_URL = "http://localhost:8080/trello/v1";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Error ${response.status}`;
    try {
      const body = await response.json();
      message = body.message || message;
    } catch {
      // ignora si no hay JSON
    }
    throw new Error(message);
  }

  return response.status === 204 ? null : response.json();
}

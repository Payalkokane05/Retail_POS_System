export const API_BASE = "http://127.0.0.1:8000";

export function authFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(
    path.startsWith("http") ? path : `${API_BASE}${path}`,
    { ...options, headers },
  );
}

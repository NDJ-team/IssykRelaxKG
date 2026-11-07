const API_URL = import.meta.env.VITE_API_URL || "/api/v1";

export function buildQueryString(params?: Record<string, unknown>): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function getToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function setToken(token: string) {
  if (typeof localStorage !== "undefined") localStorage.setItem("access_token", token);
}

export function setRefreshToken(token: string) {
  if (typeof localStorage !== "undefined") localStorage.setItem("refresh_token", token);
}

export function clearTokens() {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
}

export function getRefreshToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  let res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth) {
    const refreshed = await refreshTokenRequest();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${getToken()}`;
      res = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    }
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json();

  if (!res.ok) {
    const detail = typeof data.detail === "string" ? data.detail : "Ошибка запроса";
    throw new Error(detail);
  }

  return data as T;
}

export async function loginRequest(email: string, password: string) {
  const data = await apiRequest<{
    access_token: string;
    refresh_token: string;
    token_type: string;
  }>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  setToken(data.access_token);
  setRefreshToken(data.refresh_token);
  return data;
}

export async function updateProfile(data: {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}) {
  return apiRequest<{
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    avatar_url: string | null;
    role: string;
    is_verified: boolean;
  }>("/auth/me", {
    method: "PUT",
    body: data,
  });
}

export async function forgotPassword(email: string) {
  return apiRequest<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: { email },
    auth: false,
  });
}

export async function changePassword(current_password: string, new_password: string) {
  return apiRequest<{ message: string }>("/auth/change-password", {
    method: "POST",
    body: { current_password, new_password },
  });
}

export async function refreshTokenRequest(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const data = await apiRequest<{ access_token: string }>("/auth/refresh", {
      method: "POST",
      body: { refresh_token: refresh },
      auth: false,
    });
    setToken(data.access_token);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

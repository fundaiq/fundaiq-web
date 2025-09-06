// frontend/src/app/lib/api.ts

// ===== Base URL =====
const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

// ADD DEBUG LINES HERE
console.log("🔍 [API DEBUG] process.env.NEXT_PUBLIC_API_BASE:", process.env.NEXT_PUBLIC_API_BASE);
console.log("🔍 [API DEBUG] process.env.NEXT_PUBLIC_API_BASE_URL:", process.env.NEXT_PUBLIC_API_BASE_URL);
console.log("🔍 [API DEBUG] RAW_BASE:", RAW_BASE);

// Strip trailing slashes
const CLEAN_BASE = RAW_BASE.replace(/\/+$/, "");
console.log("🔍 [API DEBUG] CLEAN_BASE:", CLEAN_BASE);

// Ensure we have exactly one /api segment overall
export const API_BASE = CLEAN_BASE.endsWith("/api") ? CLEAN_BASE : `${CLEAN_BASE}/api`;
console.log("🔍 [API DEBUG] Final API_BASE:", API_BASE);

// Build a URL under API_BASE without adding another /api
function apiUrl(path: string) {
  const clean = String(path || "").replace(/^\/+/, ""); // remove leading slashes
  const fullUrl = `${API_BASE}/${clean}`;
  console.log("🔍 [API DEBUG] apiUrl() generated:", fullUrl, "from path:", path);
  return fullUrl;
}

// ===== Minimal debug helper =====
const AUTH_DEBUG = process.env.NEXT_PUBLIC_DEBUG_AUTH === "true";
const dbg = (...a: any[]) => AUTH_DEBUG && console.log("[AUTH]", ...a);

// ===== In-memory access token (never localStorage) =====
let accessToken: string | null = null;

export function setAccessToken(t: string | null) {
  accessToken = t;
  console.log("[AUTH] setAccessToken:", t ? `Token set (${t.substring(0, 20)}...)` : "Token cleared");
  dbg("setAccessToken", t ? "set" : "cleared");
}

export function getAccessToken() {
  console.log("[AUTH] getAccessToken:", accessToken ? `Token exists (${accessToken.substring(0, 20)}...)` : "No token");
  return accessToken;
}

// ===== Internals =====
function parseSafe(text: string | null) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    console.log("[AUTH] Attempting refresh...");
    const refreshUrl = apiUrl("auth/refresh");
    console.log("🔍 [API DEBUG] Refresh URL:", refreshUrl);
    
    const res = await fetch(refreshUrl, {
      method: "POST",
      credentials: "include", // send HttpOnly refresh cookie
    });

    console.log("[AUTH] Refresh response:", res.status, res.statusText);

    if (!res.ok) {
      console.log("[AUTH] Refresh failed:", res.status, res.statusText);
      dbg("refresh failed", res.status, res.statusText);
      setAccessToken(null);
      return null;
    }

    const data = await res.json().catch(() => ({}));
    console.log("[AUTH] Refresh data:", data);
    
    const token = data?.access_token as string | undefined;
    if (token) {
      console.log("[AUTH] Setting new token from refresh");
      setAccessToken(token);
      return token;
    }
    console.log("[AUTH] No access_token in refresh response");
    dbg("refresh ok but no access_token in response");
    return null;
  } catch (e) {
    console.log("[AUTH] Refresh exception:", e);
    dbg("refresh exception", e);
    setAccessToken(null);
    return null;
  }
}

/**
 * Append Authorization header if we have an in-memory access token
 * and ensure credentials are included (for refresh cookie).
 */
async function doFetchWithAuth(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  const hasBody = typeof init.body !== "undefined" && init.body !== null;
  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  
  const currentToken = getAccessToken();
  console.log("[AUTH] doFetchWithAuth - Current token:", currentToken ? `EXISTS (${currentToken.substring(0, 20)}...)` : "NONE");
  
  if (currentToken) {
    headers.set("Authorization", `Bearer ${currentToken}`);
    console.log("[AUTH] Adding Authorization header to request:", path);
  } else {
    console.log("[AUTH] ⚠️ NO TOKEN AVAILABLE for request:", path);
  }

  const url = apiUrl(path);
  console.log("[AUTH] Making request to:", url);
  console.log("[AUTH] Request headers:", Object.fromEntries(headers.entries()));

  return fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });
}

// ===== Default export: cookie/session-aware fetch with auto-refresh =====
export default async function apiFetch(path: string, options: RequestInit = {}) {
  console.log("[AUTH] apiFetch starting for:", path);
  let res = await doFetchWithAuth(path, options);
  console.log("[AUTH] apiFetch first response:", res.status, res.statusText);

  if (res.status === 401) {
    console.log("[AUTH] Got 401, attempting refresh...");
    const newToken = await refreshAccessToken();
    if (newToken) {
      console.log("[AUTH] Refresh successful, retrying original request");
      res = await doFetchWithAuth(path, options);
      console.log("[AUTH] apiFetch retry response:", res.status, res.statusText);
    } else {
      console.log("[AUTH] Refresh failed, keeping 401 response");
    }
  }

  const text = await res.text().catch(() => "");
  const data = parseSafe(text);
  if (!res.ok) {
    const msg =
      (typeof data === "string" && data) ||
      (data && (data.detail || data.message)) ||
      `${res.status} ${res.statusText}`;
    console.log("[AUTH] apiFetch throwing error:", msg);
    throw new Error(msg);
  }
  console.log("[AUTH] apiFetch success:", data);
  return data ?? {};
}

// ===== Public fetch: unchanged interface, now using normalized API_BASE =====
export async function apiPublic(path: string, init: RequestInit = {}) {
  const url = apiUrl(path);

  dbg("→ fetch", { url, method: init.method || "GET" });

  const hdr = new Headers(init.headers || {});
  const hasBody = typeof init.body !== "undefined" && init.body !== null;
  if (hasBody && !hdr.has("Content-Type")) {
    hdr.set("Content-Type", "application/json");
  }

  try {
    const res = await fetch(url, {
      credentials: "include",
      ...init,
      headers: hdr,
    });

    dbg("← response", { url, status: res.status });

    if (!res.ok) {
      let snippet = "";
      try {
        const t = await res.text();
        snippet = t.length > 300 ? t.slice(0, 300) + "…" : t;
      } catch { /* ignore */ }
      const errMsg = `${res.status} ${res.statusText}${snippet ? ` — ${snippet}` : ""}`;
      throw new Error(errMsg);
    }

    const ct = res.headers.get("content-type") || "";
    if (res.status === 204) return null;
    const t = await res.text();
    if (!t) return null;

    if (ct.includes("application/json")) {
      try {
        return JSON.parse(t);
      } catch (e) {
        dbg("⚠ JSON parse failed; returning raw text", e);
        return t;
      }
    }
    return t;
  } catch (e) {
    dbg("✖ fetch failed", e);
    throw e;
  }
}

// ===== Auth helpers =====
export async function login(email: string, password: string, remember = true, ts_token?: string) {
  console.log("[AUTH] Starting login process");
  
  const loginUrl = apiUrl("auth/login");
  console.log("🔍 [API DEBUG] Login URL:", loginUrl);
  
  const res = await fetch(loginUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password, remember_me: remember, ts_token }),
  });
  
  console.log("[AUTH] Login response:", res.status, res.statusText);
  
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Login failed");
  }

  console.log("[AUTH] Login successful, now refreshing token...");
  const token = await refreshAccessToken();
  console.log("[AUTH] Refresh after login result:", token ? "success" : "failed");
  
  if (!token) throw new Error("Could not initialize session.");
  return true;
}

export async function logout() {
  console.log("[AUTH] Logout starting");
  
  try {
    const response = await fetch(apiUrl("auth/logout"), {
      method: "POST",
      credentials: "include",
    });
    console.log("[AUTH] Logout response:", response.status);
  } catch (error) {
    console.log("[AUTH] Logout error:", error);
  } finally {
    console.log("[AUTH] Clearing access token");
    setAccessToken(null);
    
    // ADD THIS LINE - Trigger UI refresh
    window.dispatchEvent(new Event('logout'));
    console.log("[AUTH] Logout complete");
  }
}

export async function getMe() {
  try {
    console.log("[AUTH] getMe: starting");
    const data = await apiFetch("auth/me");
    console.log("[AUTH] getMe: success", data);
    return data;
  } catch (error) {
    console.log("[AUTH] getMe: failed", error);
    return null;
  }
}

export async function updateProfile(profileData: { name: string }) {
  try {
    console.log("[AUTH] updateProfile: starting", profileData);
    const data = await apiFetch("auth/me", {
      method: "PUT", // or "PATCH" depending on your backend
      body: JSON.stringify(profileData),
    });
    console.log("[AUTH] updateProfile: success", data);
    return data;
  } catch (error) {
    console.log("[AUTH] updateProfile: failed", error);
    throw error;
  }
}
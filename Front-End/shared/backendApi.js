(function () {
const baseUrl = "https://localhost:7057";


  function getToken() {
    return localStorage.getItem("token");
  }

  function setToken(token) {
    if (!token) localStorage.removeItem("token");
    else localStorage.setItem("token", token);
  }

  // Base64Url decode (JWT)
  function base64UrlDecode(input) {
    if (!input || typeof input !== "string") return null;

    let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) base64 += "=".repeat(4 - pad);

    try {
      const binary = atob(base64);
      const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
      return new TextDecoder("utf-8").decode(bytes);
    } catch {
      return null;
    }
  }

  function getJwtPayload(token) {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const json = base64UrlDecode(parts[1]);
    if (!json) return null;

    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  function normalizeRole(role) {
    if (!role) return null;
    const r = String(role).trim().toLowerCase();

    if (r === "admin" || r === "administrator") return "Admin";
    if (r === "pharmacy" || r === "pharmacist" || r === "pharm") return "Pharmacy";
    if (r === "user" || r === "customer" || r === "client") return "User";

    return r.charAt(0).toUpperCase() + r.slice(1);
  }

  function getUserRoleFromToken() {
    const token = getToken();
    if (!token) return null;

    const payload = getJwtPayload(token);
    if (!payload) return null;

    const role =
      payload.role ||
      payload.Role ||
      payload.roles ||
      payload.Roles ||
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"] ||
      null;

    if (Array.isArray(role)) return normalizeRole(role[0]);
    return normalizeRole(role);
  }

  async function request(
    path,
    { method = "GET", body, auth = true, headers = {} } = {}
  ) {
    const url = baseUrl + path;

    const h = { ...headers };
    if (!(body instanceof FormData)) {
      h["Content-Type"] = h["Content-Type"] || "application/json";
    }

    if (auth) {
      const token = getToken();
      if (token) h["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      method,
      headers: h,
      body: body
        ? body instanceof FormData
          ? body
          : JSON.stringify(body)
        : undefined
    });

    if (res.status === 401) {
      setToken(null);
      throw new Error("Unauthorized (401)");
    }

    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const err = await res.json();
        msg = err?.message || err?.title || msg;
      } catch {}
      throw new Error(msg);
    }

    if (res.status === 204) return null;

    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return await res.json();
    return await res.text();
  }

  window.backendApi = {
    baseUrl,
    request,
    getToken,
    setToken,
    getUserRoleFromToken
  };
})();

(function () {
  // ==========================================================
  // ✅ Medicine Requests API Wrapper
  // - Prefer window.apiClient if available (your shared client)
  // - Fallback to fetch if apiClient not available
  // ==========================================================

  const FALLBACK_BASE_URL = "https://localhost:7057";

  function getToken() {
    return localStorage.getItem("token");
  }

  // ---------------------------
  // Fallback fetch requester
  // ---------------------------
  async function fetchRequest(path, options = {}) {
    const token = getToken();

    const res = await fetch(FALLBACK_BASE_URL + path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
        ...(options.headers || {})
      }
    });

    // Handle non-OK with best message
    if (!res.ok) {
      let msg = `Request failed (${res.status})`;
      try {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const data = await res.json();
          msg = data?.message || data?.error || JSON.stringify(data) || msg;
        } else {
          const text = await res.text();
          if (text) msg = text;
        }
      } catch {
        // ignore parse errors
      }
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }

    // Return JSON if exists, else null
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return res.json();
    return null;
  }

  // ---------------------------
  // Unified request:
  // Use apiClient if present else fetch
  // ---------------------------
  async function request(path, options = {}) {
    // if apiClient exists, use it (your shared project client)
    if (window.apiClient) {
      const method = (options.method || "GET").toUpperCase();

      // Normalize payload if exists
      const body =
        typeof options.body === "string"
          ? JSON.parse(options.body)
          : options.body;

      // Your apiClient usually expects path WITHOUT baseUrl and already has baseUrl from config
      if (method === "GET") return window.apiClient.get(path);
      if (method === "POST") return window.apiClient.post(path, body);
      if (method === "PUT") return window.apiClient.put(path, body);
      if (method === "DELETE") return window.apiClient.delete(path);

      // If method is unknown, fallback to fetch
      return fetchRequest(path, options);
    }

    // fallback to fetch
    return fetchRequest(path, options);
  }

  // ---------------------------
  // Public API
  // ---------------------------
  window.medicineRequestsApi = {
    // اسم المستخدم من الداتابيز
    getMe: () => request("/api/Users/me", { method: "GET" }),

    // إنشاء طلب دواء ناقص
    create: (data) =>
      request("/api/MedicineRequests", {
        method: "POST",
        body: JSON.stringify(data)
      }),

    // طلباتي
    myRequests: () => request("/api/MedicineRequests/my", { method: "GET" }),

    // ردود الصيدليات على طلب معين
    responses: (id) =>
      request(`/api/MedicineRequests/${id}/responses`, { method: "GET" })
  };
})();

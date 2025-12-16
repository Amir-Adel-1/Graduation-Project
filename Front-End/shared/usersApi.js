(function () {
  const baseUrl =
    (window.API_BASE_URL) ||
    (window.config && window.config.baseUrl) ||
    "https://localhost:7057";

  function getToken() {
    return localStorage.getItem("token");
  }

  async function request(path, options = {}) {
    const token = getToken();

    const res = await fetch(baseUrl + path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    const text = await res.text().catch(() => "");

    if (!res.ok) {
      if (res.status === 401) throw new Error("لازم تسجل دخول الأول");
      throw new Error(text || `HTTP ${res.status}`);
    }

    if (!text) return null;
    try { return JSON.parse(text); } catch { return text; }
  }

  window.usersApi = {
    me() {
      return request("/api/Users/me");
    }
  };
})();

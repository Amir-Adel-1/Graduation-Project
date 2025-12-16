(function () {
  const baseUrl =
    window.API_BASE_URL ||
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
    if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
    if (!text) return null;

    try { return JSON.parse(text); } catch { return text; }
  }

  window.notificationsApi = {
    my() { return request("/api/Notifications/my"); },
    details(id) { return request(`/api/Notifications/${id}/details`); },
    markRead(id) { return request(`/api/Notifications/${id}/read`, { method: "PUT" }); },
  };

  // ✅ عداد الإشعارات غير المقروءة
  window.refreshNotifBadge = async function () {
    try {
      const res = await window.notificationsApi.my();
      const count = res?.count ?? 0;
      const el = document.getElementById("notifBadge");
      if (el) {
        el.textContent = count;
        el.style.display = count > 0 ? "inline-block" : "none";
      }
    } catch {}
  };
})();

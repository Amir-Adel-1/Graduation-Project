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
    if (!res.ok) {
      // حاول تقرأ message من JSON لو موجود
      try {
        const j = text ? JSON.parse(text) : null;
        const msg = j?.message || j?.Message;
        if (msg) throw new Error(msg);
      } catch {
        // ignore JSON parse error
      }
      throw new Error(text || `HTTP ${res.status}`);
    }

    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  // ✅ Helpers (Count extraction)
  function extractFavCount(res) {
    if (!res) return 0;
    if (typeof res.count === "number") return res.count;

    const list = res.favorites || res.items || res.Favorites || res.Items;
    if (Array.isArray(list)) return list.length;

    return 0;
  }

  window.favoritesApi = {
    // GET: api/Favorites/my
    my() {
      return request("/api/Favorites/my");
    },

    // POST: api/Favorites
    add(payload) {
      return request("/api/Favorites", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    // DELETE: api/Favorites/{id}
    remove(id) {
      return request(`/api/Favorites/${id}`, { method: "DELETE" });
    },

    // ⚠️ اختياري: لو عملته في الباك
    async clear() {
      try {
        return await request("/api/Favorites/clear", { method: "DELETE" });
      } catch (err) {
        // لو endpoint مش موجودة
        if (String(err?.message || "").includes("404")) {
          throw new Error("Endpoint clear غير موجود في الـ API");
        }
        throw err;
      }
    },

    // ⚠️ اختياري: لو عملته في الباك
    async toggle(payload) {
      try {
        return await request("/api/Favorites/toggle", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } catch (err) {
        if (String(err?.message || "").includes("404")) {
          throw new Error("Endpoint toggle غير موجود في الـ API");
        }
        throw err;
      }
    },
  };

  // ✅ Badge update
  window.refreshFavBadge = async function () {
    try {
      const res = await window.favoritesApi.my();
      const count = extractFavCount(res);
      const el = document.getElementById("fav_clr");
      if (el) el.textContent = count;
    } catch {
      // تجاهل عشان ما يبوظش الصفحة لو اليوزر مش عامل login مثلاً
    }
  };
})();

(function () {
  const BASE_URL = "https://localhost:7057";

  async function request(url, options = {}) {
    const token = localStorage.getItem("token");

    const res = await fetch(BASE_URL + url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    // ✅ اقرأ الرد كنص عشان تفهم أي مشكلة
    const text = await res.text().catch(() => "");

    if (!res.ok) {
      // ✅ لو 401 غالبًا مش عامل login
      if (res.status === 401) {
        throw new Error("لازم تسجل دخول الأول");
      }
      throw new Error(text || `HTTP ${res.status}`);
    }

    // لو الرد فاضي
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  async function refreshCartBadge() {
    try {
      const badge = document.getElementById("cart_clr");
      if (!badge) return;

      const res = await request("/api/Cart/my");
      const cart = res?.cart ? res.cart : res;

      const total = cart?.totalProducts ?? cart?.TotalProducts ?? 0;
      badge.textContent = total;
    } catch (e) {
      // لو مش عامل login ما نعملش دوشة
      console.warn("refreshCartBadge:", e?.message || e);
    }
  }

  window.cartApi = {
    getMy() {
      return request("/api/Cart/my");
    },

    addItem(product, qty = 1) {
      // product = { name, price, imageUrl }
      return request("/api/Cart/items", {
        method: "POST",
        body: JSON.stringify({
          productApiName: product.name,
          quantity: qty,
          price: Number(product.price) || 0,
          imageUrl: product.imageUrl || null,
        }),
      });
    },

    updateQty(itemId, qty) {
      return request(`/api/Cart/items/${itemId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity: qty }),
      });
    },

    remove(itemId) {
      return request(`/api/Cart/items/${itemId}`, { method: "DELETE" });
    },

    clear() {
      return request("/api/Cart/clear", { method: "DELETE" });
    },
  };

  // ✅ Global عشان كل الصفحات تقدر تناديها
  window.refreshCartBadge = refreshCartBadge;
})();

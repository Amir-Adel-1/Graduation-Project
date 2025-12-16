(function () {
  const BASE_URL = "https://localhost:7057";

  function getToken() {
    return localStorage.getItem("token");
  }

  async function request(url, options = {}) {
    const token = getToken();

    const res = await fetch(BASE_URL + url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    const text = await res.text().catch(() => "");

    // حاول تفهم لو الرد JSON
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!res.ok) {
      if (res.status === 401) throw new Error("لازم تسجل دخول الأول");

      // لو السيرفر بيرجع message
      const msg =
        (data && typeof data === "object" && (data.message || data.error)) ||
        (typeof data === "string" && data) ||
        `HTTP ${res.status}`;

      throw new Error(msg);
    }

    return data; // ممكن null لو مفيش body
  }

  window.ordersApi = {
    // إنشاء أوردر من الكارت
    checkout(paymentMethodId) {
      return request("/api/Orders/checkout", {
        method: "POST",
        body: JSON.stringify({ paymentMethodId }),
      });
    },

    // عرض أوردراتي
    myOrders() {
      return request("/api/Orders/my", { method: "GET" });
    },

    // تفاصيل أوردر واحد
    orderDetails(orderId) {
      return request(`/api/Orders/${orderId}`, { method: "GET" });
    },
  };
})();

(function () {
  const BASE = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) || "";

  function getToken() {
    return localStorage.getItem("token");
  } 

  function setToken(token) {
    if (!token) localStorage.removeItem("token");
    else localStorage.setItem("token", token);
  }

  async function request(path, { method = "GET", body, auth = true, headers = {} } = {}) {
    const url = BASE + path;

    const h = { "Content-Type": "application/json", ...headers };

    if (auth) {
      const token = getToken();
      if (token) h["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      method,
      headers: h,
      body: body ? JSON.stringify(body) : undefined
    });

    // لو التوكن غلط/منتهي/المستخدم blocked
    if (res.status === 401) {
      // امسح التوكن وودّي المستخدم للّوجين (عدّل المسار حسب مشروعك)
      setToken(null);
      // location.href = "/Front-End/Main/Login/Login.html";
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

    // لو مفيش محتوى
    if (res.status === 204) return null;

    // أغلب APIs بترجع JSON
    return await res.json();
  }

  window.api = {
    request,
    getToken,
    setToken,
    baseUrl: BASE
  };
})();

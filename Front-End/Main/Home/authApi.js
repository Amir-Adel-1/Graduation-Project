(function () {
  function pickToken(data) {
    return (
      data?.token ??
      data?.accessToken ??
      data?.jwt ??
      data?.Token ??
      data?.AccessToken ??
      data?.data?.token ??
      data?.data?.accessToken ??
      data?.result?.token ??
      data?.result?.accessToken ??
      null
    );
  }

  async function login(email, password) {
    const data = await window.backendApi.request("/api/auth/login", {
      method: "POST",
      auth: false,
      body: { email, password }
    });

    console.log("LOGIN RESPONSE =>", data);

    const token = pickToken(data);

    if (!token) {
      // لو الباك بيرجع success/message بس من غير token
      throw new Error("Login نجح/رجع رد، بس مفيش Token في الـResponse. بص على LOGIN RESPONSE في الـConsole");
    }

    window.backendApi.setToken(token);
    console.log("TOKEN SAVED =>", window.backendApi.getToken());

    return data;
  }

  async function register(payload) {
    const data = await window.backendApi.request("/api/auth/register", {
      method: "POST",
      auth: false,
      body: payload
    });

    console.log("REGISTER RESPONSE =>", data);

    const token = pickToken(data);
    if (token) window.backendApi.setToken(token);

    return data;
  }

  async function logout() {
    window.backendApi.setToken(null);
    return true;
  }

  window.authApi = { login, register, logout };
})();

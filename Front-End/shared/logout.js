(function () {
  function doLogout() {
    try {
      window.backendApi?.setToken?.(null);
    } catch {}

    // عدّل المسار ده لو صفحة الجيست عندك مختلفة
    window.location.assign("../../Main/Home/index.html");
  }

  // أي زر عليه class="btn-logout" هيعمل logout
  function wire() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-logout");
      if (!btn) return;

      e.preventDefault();
      doLogout();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wire);
  } else {
    wire();
  }

  // لو حبيت تناديه من كود:
  window.doLogout = doLogout;
})();

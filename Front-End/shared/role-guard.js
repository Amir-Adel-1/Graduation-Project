(function () {
  // لازم backendApi يبقى متحمّل قبل الملف ده
  function getRole() {
    try {
      return window.backendApi?.getUserRoleFromToken?.() || null;
    } catch {
      return null;
    }
  }

  function redirectToGuest() {
    // عدّل المسار ده لو صفحة الجيست عندك مختلفة
    window.location.assign("/");
  }

  // الاستخدام:
  // <script>
  //   window.__ROLE_GUARD__ = { allow: ["Admin"] };
  // </script>
  // <script src="/shared/role-guard.js"></script>
  function runGuard() {
    const cfg = window.__ROLE_GUARD__;
    if (!cfg || !cfg.allow) return; // لو مفيش config، ما يعملش حاجة

    const role = getRole();
    const allow = Array.isArray(cfg.allow) ? cfg.allow : [cfg.allow];

    // لو مش عامل لوجين أو مش من الرول المسموح
    if (!role || !allow.includes(role)) {
      redirectToGuest();
    }
  }

  // شغّل بعد تحميل الصفحة
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runGuard);
  } else {
    runGuard();
  }
})();

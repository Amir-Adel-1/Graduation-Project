// عناصر صفحة تسجيل الدخول
const loginOverlay = document.querySelector(".overlay-login");
const closeLoginPopup = document.querySelector(".close-popup-login");
const loginForm = document.querySelector(".login-form");

function closeAllOverlays() {
  document
    .querySelectorAll(
      ".overlay-login, .overlay-signup, .overlay-pharmacist, .account-choice-overlay"
    )
    .forEach((overlay) => (overlay.style.display = "none"));

  document.body.style.overflow = "auto";
}

// فتح نافذة اللوجين (Event Delegation)
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".open-login");
  if (!btn) return;

  e.preventDefault();
  closeAllOverlays();

  if (loginOverlay) {
    loginOverlay.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
});

// غلق النافذة
if (closeLoginPopup && loginOverlay) {
  closeLoginPopup.addEventListener("click", () => {
    loginOverlay.style.display = "none";
    document.body.style.overflow = "auto";
  });

  loginOverlay.addEventListener("click", (e) => {
    if (e.target === loginOverlay) {
      loginOverlay.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });
}

console.log("login.js loaded ✅");

// ✅ مسارات مطلقة (من جذر المشروع) — عدّل أسماء الفولدرات/الملفات لو مختلفة عندك
const ROLE_ROUTES = {
  Admin: "../../Admin/Dashboard/Dashboard.html",
  Pharmacy: "../../Pharmacy/Home/Pharmacy.html",
  User: "../../User/Home/User.html",
};


function redirectByRole(role) {
  const r = role || "User";
  const target = ROLE_ROUTES[r] || ROLE_ROUTES.User;

  console.log("Redirecting => role:", r, "target:", target);

  // استخدم assign عشان يكون تحويل واضح
  window.location.assign(target);
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginForm.querySelector('input[name="Email"]')?.value?.trim();
    const password = loginForm.querySelector('input[name="Password"]')?.value;

    if (!email || !password) {
      alert("من فضلك اكتب الإيميل والباسورد");
      return;
    }

    const submitBtn = loginForm.querySelector(".submit-btn-login");

    try {
      if (submitBtn) submitBtn.disabled = true;

      if (!window.backendApi) throw new Error("backendApi مش متحمّل");
      if (!window.authApi?.login) throw new Error("authApi مش متحمّل");

      const result = await window.authApi.login(email, password);
      console.log("login result =", result);

      console.log("token =", localStorage.getItem("token"));

      const role = window.backendApi.getUserRoleFromToken();
      console.log("role =", role);

      if (loginOverlay) {
        loginOverlay.style.display = "none";
        document.body.style.overflow = "auto";
      }

      redirectByRole(role);

    } catch (err) {
      console.error("login error =", err);
      alert(err.message || "حصل خطأ أثناء تسجيل الدخول");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
} else {
  console.warn("loginForm (.login-form) not found");
}

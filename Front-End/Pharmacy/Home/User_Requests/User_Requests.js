// ==========================================================
// 📌 جميع إعدادات الصفحة في DOMContentLoaded واحد
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {

  // ------------------------------
  // عناصر التحكم
  // ------------------------------
  const navbar = document.getElementById("navbar");
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  const userInfo = document.querySelector(".user-info");
  const userMenu = document.querySelector(".user-menu");

  let lastScrollTop = 0;

  // ==========================================================
  // 📌  سلوك النافبار + تغيير الألوان + زر الصعود لأعلى
  // ==========================================================
  window.addEventListener("scroll", () => {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > lastScrollTop && currentScroll > 100) {
      navbar.classList.add("hidden");
    }
    if (currentScroll < lastScrollTop) {
      navbar.classList.remove("hidden");
    }
    if (currentScroll <= 0) {
      navbar.classList.remove("hidden");
    }

    if (currentScroll > 50) {
      navbar.classList.add("scrolled");
      document.querySelectorAll(".a").forEach(el => el.style.color = "white");
    } else {
      navbar.classList.remove("scrolled");
      document.querySelectorAll(".a").forEach(el => el.style.color = "");
    }

    scrollToTopBtn.style.display = window.scrollY > 200 ? "block" : "none";
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  });

  scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ==========================================================
  // 📌 قائمة المستخدم (User Menu)
  // ==========================================================
  userInfo.addEventListener("click", (e) => {
    e.stopPropagation();
    userMenu.style.display = userMenu.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", () => {
    userMenu.style.display = "none";
  });

}); // ← END DOMContentLoaded



// ==========================================================
// 📌 نظام البوب أب "متوفر لدي"
// ==========================================================

// كل أزرار "متوفر لدي"
const availableBtns = document.querySelectorAll(".btn-available");

// البوب أب + عناصره
const overlayAvailable = document.getElementById("overlayAvailable");
const confirmSendBtn = document.getElementById("confirmSend");
const cancelSendBtn = document.getElementById("cancelSend");

// فتح البوب أب
availableBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    overlayAvailable.style.visibility = "visible";
    overlayAvailable.style.opacity = "1";
  });
});

// إغلاق الإلغاء
cancelSendBtn.addEventListener("click", () => {
  overlayAvailable.style.visibility = "hidden";
  overlayAvailable.style.opacity = "0";
});

// إغلاق عند الضغط خارج البوب
overlayAvailable.addEventListener("click", (e) => {
  if (e.target === overlayAvailable) {
    overlayAvailable.style.visibility = "hidden";
    overlayAvailable.style.opacity = "0";
  }
});



// ==========================================================
// 📌 نظام الإشعار (Alert Message) — زي الصورة اللي طلبتها
// ==========================================================
function showAlert(message) {
  // احذف أي إشعار قديم
  const oldAlert = document.querySelector(".custom-alert");
  if (oldAlert) oldAlert.remove();

  // إنشاء الإشعار
  const alertBox = document.createElement("div");
  alertBox.className = "custom-alert";
  alertBox.textContent = message;

  Object.assign(alertBox.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "rgba(0, 255, 200, 0.25)",
    color: "#00ffaa",
    padding: "12px 25px",
    borderRadius: "12px",
    backdropFilter: "blur(6px)",
    boxShadow: "0 0 15px rgba(0,255,255,0.4)",
    fontSize: "18px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    maxWidth: "max-content",
    opacity: "1",
    transition: "opacity 0.8s ease",
    zIndex: "99999999"
  });

  document.body.appendChild(alertBox);

  // اختفاء تدريجي
  setTimeout(() => {
    alertBox.style.opacity = "0";
    setTimeout(() => alertBox.remove(), 800);
  }, 1500);
}



// ==========================================================
// 📌 زرار تأكيد الإرسال
// ==========================================================
confirmSendBtn.addEventListener("click", () => {
  overlayAvailable.style.visibility = "hidden";
  overlayAvailable.style.opacity = "0";

  // 🔥 عرض الإشعار الجديد
  showAlert("✔ تم إرسال إشعار للمستخدم بأن الدواء متوفر لديك");
});

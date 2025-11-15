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

    // 🔹 لو بتنزل → اخفي النافبار
    if (currentScroll > lastScrollTop && currentScroll > 100) {
      navbar.classList.add("hidden");
    }

    // 🔹 لو بتطلع لفوق → اظهر النافبار
    if (currentScroll < lastScrollTop) {
      navbar.classList.remove("hidden");
    }

    // 🔹 لو فوق خالص → اظهر النافبار دايمًا
    if (currentScroll <= 0) {
      navbar.classList.remove("hidden");
    }

    // 🔹 تغيير لون الخلفية والأيقونات مع النزول
    if (currentScroll > 50) {
      navbar.classList.add("scrolled");
      document.querySelectorAll(".a").forEach(el => el.style.color = "white");
    } else {
      navbar.classList.remove("scrolled");
      document.querySelectorAll(".a").forEach(el => el.style.color = "");
    }

    // 🔹 إظهار زر الصعود لأعلى
    scrollToTopBtn.style.display = window.scrollY > 200 ? "block" : "none";

    // تحديث آخر قيمة للسكرول
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  });

  // زر الصعود لأعلى
  scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });


  // ==========================================================
  // 📌  قائمة المستخدم (User Menu)
  // ==========================================================

  // فتح / إغلاق المنيو
  userInfo.addEventListener("click", (e) => {
    e.stopPropagation();
    userMenu.style.display = userMenu.style.display === "block" ? "none" : "block";
  });

  // غلقها لما تضغط براها
  document.addEventListener("click", () => {
    userMenu.style.display = "none";
  });

});








// ===============================
//  فتح البوب أب لما تدوس "متوفر لدي"
// ===============================

// كل أزرار "متوفر لدي"
const availableBtns = document.querySelectorAll(".btn-available");

// البوب أب + عناصره
const overlayAvailable = document.getElementById("overlayAvailable");
const confirmSendBtn = document.getElementById("confirmSend");
const cancelSendBtn = document.getElementById("cancelSend");

// فتح البوب أب عند ضغط أي زر "متوفر لدي"
availableBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        overlayAvailable.style.visibility = "visible";
        overlayAvailable.style.opacity = "1";
    });
});

// إغلاق عند الضغط على زر الإلغاء
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

// زرار تأكيد الإرسال
confirmSendBtn.addEventListener("click", () => {
    overlayAvailable.style.visibility = "hidden";
    overlayAvailable.style.opacity = "0";

    // هنا تقدر تبعت الريكويست للسيرفر
    alert("✔ تم إرسال إشعار للمستخدم بأن الدواء متوفر لديك");
});

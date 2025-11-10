// ==========================================================
// 📌  الجزء الأول: إعداد الـ NavBar وسلوك الصفحة أثناء التمرير
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {

  // ------------------------------
  // عناصر التحكم
  // ------------------------------
  let cart_clr = document.getElementById("cart_clr");
  let fav_clr = document.getElementById("fav_clr");
  const navbar = document.getElementById("navbar");
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  let lastScrollTop = 0;

  // ------------------------------
  // عند التمرير (Scroll)
  // ------------------------------
  window.addEventListener("scroll", () => {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // 🔹 إخفاء النافبار عند السحب للأسفل
    if (currentScroll > lastScrollTop && currentScroll > 100) {
      navbar.classList.add("hidden");
    } else {
      navbar.classList.remove("hidden");
    }


    // 🔹 إظهار زر الصعود لأعلى
    if (window.scrollY > 200) {
      scrollToTopBtn.style.display = "block";
    } else {
      scrollToTopBtn.style.display = "none";
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  });

  // ------------------------------
  // عند الضغط على زر الصعود لأعلى
  // ------------------------------
  scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

});

// ==========================================================
// 📌  الجزء الثاني: قائمة المستخدم (User Menu)
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {

  // ------------------------------
  // عناصر التحكم
  // ------------------------------
  const userInfo = document.querySelector(".user-info");
  const userMenu = document.querySelector(".user-menu");

  // ------------------------------
  // فتح/إغلاق القائمة عند الضغط على الأيقونة
  // ------------------------------
  userInfo.addEventListener("click", (e) => {
    e.stopPropagation(); // عشان مايقفلش لما تضغط على نفس الزر
    userMenu.style.display = userMenu.style.display === "block" ? "none" : "block";
  });

  // ------------------------------
  // إغلاق القائمة عند الضغط خارجها
  // ------------------------------
  document.addEventListener("click", () => {
    userMenu.style.display = "none";
  });

});















// Start button to hide

window.addEventListener("scroll", () => {
  const arrows = document.querySelectorAll(".tips-navigation a");
  const glassCard = document.querySelector(".tips-section"); // الكرت اللي فيه الازاز
  
  if (!glassCard) return;

  const rect = glassCard.getBoundingClientRect();
  const windowHeight = window.innerHeight;

  // لو الكرت طلع لفوق وعدّى نهايته → يخفي الأسهم
  if (rect.bottom <= windowHeight * 0.8) {
    arrows.forEach(a => a.classList.add("hidden"));
  } else {
    arrows.forEach(a => a.classList.remove("hidden"));
  }
});

// End button to hide




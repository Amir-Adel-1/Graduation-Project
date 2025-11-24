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

















 // ==========================================================
  // 📌 Testimonials Slider (Auto)
  // ==========================================================
  let index = 0;
  const cards = document.querySelectorAll(".testimonial-card");

  function updateSlider() {
    cards.forEach((card, i) => {
      card.classList.remove("active", "prev", "next", "hidden");

      if (i === index) card.classList.add("active");
      else if (i === (index - 1 + cards.length) % cards.length) card.classList.add("prev");
      else if (i === (index + 1) % cards.length) card.classList.add("next");
      else card.classList.add("hidden");
    });
  }

  function nextCard() {
    index = (index + 1) % cards.length;
    updateSlider();
  }

  if (cards.length > 0) {
    updateSlider();
    setInterval(nextCard, 2000);
  }


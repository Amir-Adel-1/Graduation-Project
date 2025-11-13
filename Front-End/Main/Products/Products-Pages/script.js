document.addEventListener("DOMContentLoaded", () => {

  // ==========================================================
  // 📌 الجزء الأول: إعداد الـ NavBar وسلوك الصفحة أثناء التمرير
  // ==========================================================

  let cart_clr = document.getElementById("cart_clr");
  let fav_clr = document.getElementById("fav_clr");
  const navbar = document.getElementById("navbar");
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  let lastScrollTop = 0;

  window.addEventListener("scroll", () => {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > lastScrollTop && currentScroll > 100) {
      navbar.classList.add("hidden");
    } else {
      navbar.classList.remove("hidden");
    }

    if (window.scrollY > 200) {
      scrollToTopBtn.style.display = "block";
    } else {
      scrollToTopBtn.style.display = "none";
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  });

  scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });


  // ==========================================================
  // 📌 الجزء الثاني: قائمة المستخدم (User Menu)
  // ==========================================================

  const userInfo = document.querySelector(".user-info");
  const userMenu = document.querySelector(".user-menu");

  userInfo.addEventListener("click", (e) => {
    e.stopPropagation();
    userMenu.style.display = userMenu.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", () => {
    userMenu.style.display = "none";
  });


  // ==========================================================
  // ⭐ Nova Pop-up Window (Final)
  // ==========================================================

  const novaPopup = document.getElementById("novaPopup");
  const novaCloseBtn = document.querySelector(".nova-close-btn");
  const eyeAreas = document.querySelectorAll(".overlay");

  eyeAreas.forEach(area => {
    area.addEventListener("click", () => {
      novaPopup.style.display = "flex";
      document.body.style.overflow = "hidden";
    });
  });

  novaCloseBtn.addEventListener("click", () => {
    novaPopup.style.display = "none";
    document.body.style.overflow = "";
  });

  window.addEventListener("click", (e) => {
    if (e.target === novaPopup) {
      novaPopup.style.display = "none";
      document.body.style.overflow = "";
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      novaPopup.style.display = "none";
      document.body.style.overflow = "";
    }
  });

});

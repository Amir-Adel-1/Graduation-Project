document.addEventListener("DOMContentLoaded", () => {

  // Start NavBar
  let cart_clr = document.getElementById("cart_clr");
  let fav_clr = document.getElementById("fav_clr");
  let lastScrollTop = 0;
  const navbar = document.getElementById('navbar');
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");

  window.addEventListener('scroll', () => {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // 🔹 إخفاء الناف بار عند السحب لتحت
    if (currentScroll > lastScrollTop && currentScroll > 100) {
      navbar.classList.add('hidden');
    } else {
      navbar.classList.remove('hidden');
    }

    // 🔹 تغيير لون الخلفية
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
      cart_clr.style.color = "white";
      fav_clr.style.color = "white";
      document.querySelectorAll('.a').forEach(el => el.style.color = "white");
    } else {
      navbar.classList.remove('scrolled');
      cart_clr.style.color = "white";
      fav_clr.style.color = "white";
    }

    // 🔹 إظهار زرار التوب
    if (window.scrollY > 200) {
      scrollToTopBtn.style.display = "block";
    } else {
      scrollToTopBtn.style.display = "none";
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  });

  // 🔹 عند الضغط على الزرار
  scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  // 🔹 تفعيل الصفحة الحالية في الناف بار
  const currentPage = window.location.pathname.split("/").pop();
  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach(link => {
    if (link.getAttribute("href").includes(currentPage)) {
      link.classList.add("active");
    }
  });

});









  // ==========================================================
  // 📌  الجزء الثالث: Pop-up Window (Eye Icon)
  // ==========================================================
  const novaPopup = document.getElementById("novaPopup");
  const novaCloseBtn = document.querySelector(".nova-close-btn");
  const eyeAreas = document.querySelectorAll(".card-overlay");

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


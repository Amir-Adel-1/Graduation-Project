// ==========================================================
// 📌 الجزء الأول + الثاني + السلايدر + كل شيء داخل DOMContentLoaded
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

  // ==========================================================
  // 📌  NavBar & Scroll
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

    if (currentScroll > 50) {
      navbar.classList.add("scrolled");
      cart_clr.style.color = "white";
      fav_clr.style.color = "white";
      document.querySelectorAll(".a").forEach(el => el.style.color = "white");
    } else {
      navbar.classList.remove("scrolled");
      cart_clr.style.color = "white";
      fav_clr.style.color = "white";
    }

    scrollToTopBtn.style.display = window.scrollY > 200 ? "block" : "none";

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  });

  scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });


  // ==========================================================
  // 📌 User Menu
  // ==========================================================
  const userInfo = document.querySelector(".user-info");
  const userMenu = document.querySelector(".user-menu");

  if (userInfo && userMenu) {
    userInfo.addEventListener("click", (e) => {
      e.stopPropagation();
      userMenu.style.display = userMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", () => {
      userMenu.style.display = "none";
    });
  }


  // ==========================================================
  // 📌 Pop-up Window (Eye Icon)
  // ==========================================================
  const novaPopup = document.getElementById("novaPopup");
  const novaCloseBtn = document.querySelector(".nova-close-btn");
  const eyeAreas = document.querySelectorAll(".card-overlay");

  if (novaPopup && novaCloseBtn) {

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
  }


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

}); // END DOMContentLoaded



// ==========================================================
// 📌 Notifications Badge (ده ممكن يفضل برا)
// ==========================================================
let newNotifications = 5;
const badge = document.getElementById("notifBadge");

if (badge) {
  if (newNotifications > 0) {
    badge.innerText = newNotifications;
    badge.style.display = "inline-block";
  } else {
    badge.style.display = "none";
  }
}

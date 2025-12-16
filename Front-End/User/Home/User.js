// ==========================================================
// Se7ty - User Home Page UI (Navbar + User Menu + Scroll + Notifications + Cart Badge)
// ==========================================================
(() => {
  document.addEventListener("DOMContentLoaded", () => {
    // -------------------------
    // 1) Navbar hide/show + scroll to top
    // -------------------------
    const navbar = document.getElementById("navbar");
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");
    let lastScrollTop = 0;

    window.addEventListener("scroll", () => {
      const currentScroll =
        window.pageYOffset || document.documentElement.scrollTop;

      if (currentScroll > lastScrollTop && currentScroll > 100) {
        navbar?.classList.add("hidden");
      } else {
        navbar?.classList.remove("hidden");
      }

      if (scrollToTopBtn) {
        scrollToTopBtn.style.display = window.scrollY > 200 ? "block" : "none";
      }

      lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    });

    scrollToTopBtn?.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // -------------------------
    // 2) User menu dropdown
    // -------------------------
    const userInfo = document.querySelector(".user-info");
    const userMenu = document.querySelector(".user-menu");

    userInfo?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!userMenu) return;
      userMenu.style.display = userMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", () => {
      if (userMenu) userMenu.style.display = "none";
    });

    // -------------------------
    // 3) Notifications (Demo)
    // -------------------------
    const notifBadge = document.getElementById("notifBadge");
    let newNotifications = 5;

    if (notifBadge) {
      if (newNotifications > 0) {
        notifBadge.innerText = newNotifications;
        notifBadge.style.display = "inline-block";
      } else {
        notifBadge.style.display = "none";
      }
    }

    // -------------------------
    // 4) Cart badge on load
    // -------------------------
    window.refreshCartBadge?.();
  });
})();

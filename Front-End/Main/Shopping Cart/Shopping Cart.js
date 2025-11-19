document.addEventListener("DOMContentLoaded", () => {

  // ==========================================================
  // 📌  الجزء الأول: NavBar + Scroll
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  });


  // ==========================================================
  // 📌  الجزء الثاني: User Menu
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

});




// ==========================================================
// 📌  الجزء الرابع: Quantity + / -
// ==========================================================

document.querySelectorAll('.qty-box').forEach(box => {
  const minusBtn = box.querySelectorAll('.qty-btn')[0];
  const plusBtn = box.querySelectorAll('.qty-btn')[1];
  const qtySpan = box.querySelector('.qty');

  minusBtn.addEventListener('click', () => {
    let value = parseInt(qtySpan.textContent);
    if (value > 1) {
      qtySpan.textContent = value - 1;
    }
  });

  plusBtn.addEventListener('click', () => {
    let value = parseInt(qtySpan.textContent);
    if (value < 5) {
      qtySpan.textContent = value + 1;
    }
  });
});
















// ==============================
// 1) ستايل الرسالة الخضرا - Pure JS (معدّل ومظبوط)
// ==============================
const successStyle = document.createElement("style");
successStyle.innerHTML = `
.success-message {
  position: fixed;
  top: 50%;                      /* منتصف الصفحة */
  left: 50%;                     /* منتصف الصفحة */
  transform: translate(-50%, -50%) scale(0.9);
  background: rgba(0, 255, 200, 0.25);
  color: #00ffaa;
  padding: 15px 30px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  backdrop-filter: blur(6px);
  box-shadow: 0 0 15px rgba(0,255,255,0.4);
  opacity: 0;
  transition: 0.35s ease;
  z-index: 999999;
  text-align: center;
}
`;
document.head.appendChild(successStyle);


// ==============================
// 2) دالة الرسالة الخضرا (نفس كودك – فقط تم ظبط الأنيميشن)
// ==============================
function showSuccessMessage(text) {
  const msg = document.createElement("div");
  msg.className = "success-message";
  msg.innerHTML = `<p>${text}</p>`;
  document.body.appendChild(msg);

  // ظهور الرسالة
  setTimeout(() => {
    msg.style.opacity = "1";
    msg.style.transform = "translate(-50%, -50%) scale(1)";
  }, 20);

  // اختفاء الرسالة
  setTimeout(() => {
    msg.style.opacity = "0";
    msg.style.transform = "translate(-50%, -60%) scale(0.9)";
    setTimeout(() => msg.remove(), 300);
  }, 2500);
}


// ==============================
// 3) دمج كود الشراء — بدون أي تغيير
// ==============================
const checkoutBtn = document.querySelector(".checkout-btn");
const confirmOverlay = document.getElementById("confirmOverlay");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");

// فتح نافذة التأكيد
checkoutBtn.addEventListener("click", () => {
  confirmOverlay.style.display = "flex";
});

// زر الإلغاء
confirmNo.addEventListener("click", () => {
  confirmOverlay.style.display = "none";
});

// زر التأكيد
confirmYes.addEventListener("click", () => {
  confirmOverlay.style.display = "none";

  // 🔥 الرسالة الخضرا
  showSuccessMessage("🎉 تم تأكيد عملية الشراء بنجاح!");
});






















// عدد الإشعارات (بدل الرقم ده هتجيبه من API)
let newNotifications = 5;

const badge = document.getElementById("notifBadge");

if (newNotifications > 0) {
    badge.innerText = newNotifications;
    badge.style.display = "inline-block";
} else {
    badge.style.display = "none";
}

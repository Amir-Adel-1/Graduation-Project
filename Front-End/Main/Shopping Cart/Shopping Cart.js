/* ==========================================================
   1) NavBar + Scroll
========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  let cart_clr = document.getElementById("cart_clr");
  let fav_clr = document.getElementById("fav_clr");
  const navbar = document.getElementById("navbar");
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  let lastScrollTop = 0;

  window.addEventListener("scroll", () => {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // إظهار/إخفاء النافبار
    if (currentScroll > lastScrollTop && currentScroll > 100) {
      navbar.classList.add("hidden");
    } else {
      navbar.classList.remove("hidden");
    }

    // تغيير لون الأيقونات
    if (currentScroll > 50) {
      navbar.classList.add("scrolled");
      cart_clr.style.color = "white";
      fav_clr.style.color = "white";
      document.querySelectorAll(".a").forEach((el) => (el.style.color = "white"));
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

  /* ==========================================================
      2) User Menu
  ========================================================== */
  const userInfo = document.querySelector(".user-info");
  const userMenu = document.querySelector(".user-menu");

  userInfo.addEventListener("click", (e) => {
    e.stopPropagation();
    userMenu.style.display = userMenu.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", () => {
    userMenu.style.display = "none";
  });

  /* ==========================================================
      3) Pop-up View (Eye)
  ========================================================== */
  const novaPopup = document.getElementById("novaPopup");
  const novaCloseBtn = document.querySelector(".nova-close-btn");
  const eyeAreas = document.querySelectorAll(".card-overlay");

  eyeAreas.forEach((area) => {
    area.addEventListener("click", () => {
      novaPopup.style.display = "flex";
      document.body.style.overflow = "hidden";
    });
  });

  novaCloseBtn?.addEventListener("click", () => {
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

/* ==========================================================
   4) Quantity + / -
========================================================== */
document.querySelectorAll(".qty-box").forEach((box) => {
  const minusBtn = box.querySelectorAll(".qty-btn")[0];
  const plusBtn = box.querySelectorAll(".qty-btn")[1];
  const qtySpan = box.querySelector(".qty");

  minusBtn.addEventListener("click", () => {
    let value = parseInt(qtySpan.textContent);
    if (value > 1) qtySpan.textContent = value - 1;
  });

  plusBtn.addEventListener("click", () => {
    let value = parseInt(qtySpan.textContent);
    if (value < 5) qtySpan.textContent = value + 1;
  });
});

/* ==========================================================
   6) Popup اختيار طريقة الدفع
========================================================== */
const checkoutBtn = document.querySelector(".checkout-btn");
const paymentOverlay = document.getElementById("paymentOverlay");
const closePayment = document.getElementById("closePayment");

checkoutBtn?.addEventListener("click", () => {
  paymentOverlay.style.display = "flex";
  document.body.style.overflow = "hidden";
});

closePayment?.addEventListener("click", () => {
  paymentOverlay.style.display = "none";
  document.body.style.overflow = "";
});

window.addEventListener("click", (e) => {
  if (e.target === paymentOverlay) {
    paymentOverlay.style.display = "none";
    document.body.style.overflow = "";
  }
});

/* ==========================================================
   7) Visa Popup — فتح / غلق
========================================================== */
const visaOverlay = document.getElementById("open-payment-visa");
const openVisaBtn = document.getElementById("openVisaBtn");
const visaRadio = document.querySelector('input[name="payment"][value="visa"]');
const closeVisa = document.getElementById("closeVisaPopup");

openVisaBtn?.addEventListener("click", () => {
  visaOverlay.style.display = "flex";
  document.body.style.overflow = "hidden";
});

visaRadio?.addEventListener("change", () => {
  if (visaRadio.checked) {
    paymentOverlay.style.display = "none";
    visaOverlay.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
});

closeVisa?.addEventListener("click", () => {
  visaOverlay.style.display = "none";
  document.body.style.overflow = "";
});

visaOverlay?.addEventListener("click", (e) => {
  if (e.target === visaOverlay) {
    visaOverlay.style.display = "none";
    document.body.style.overflow = "";
  }
});

/* ==========================================================
   8) Visa — تحديث بيانات الكارت
========================================================== */
document.getElementById("card-number")?.addEventListener("input", function () {
  let val = this.value.replace(/\D/g, "").substring(0, 16);
  val = val.replace(/(.{4})/g, "$1 ");
  this.value = val.trim();
  document.getElementById("preview-number").textContent =
    val || "**** **** **** ****";
});

document.getElementById("card-name")?.addEventListener("input", function () {
  document.getElementById("preview-name").textContent =
    this.value.toUpperCase() || "FULL NAME";
});

document.getElementById("card-exp")?.addEventListener("input", function () {
  let val = this.value.replace(/\D/g, "").substring(0, 4);
  if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2);
  this.value = val;
  document.getElementById("preview-exp").textContent = val || "MM/YY";
});

/* ==========================================================
   9) Cash Popup — فتح/غلق/تأكيد
========================================================== */
const cashPopup = document.getElementById("cashPopup");
const openCashBtn = document.getElementById("openCashBtn");
const closeCashBtn = document.getElementById("closeCashBtn");
const confirmCashBtn = document.querySelector(".confirm-cash-btn");

openCashBtn?.addEventListener("click", () => {
  cashPopup.style.display = "flex";
  document.body.style.overflow = "hidden";
});

closeCashBtn?.addEventListener("click", () => {
  cashPopup.style.display = "none";
  document.body.style.overflow = "";
});

cashPopup.addEventListener("click", (e) => {
  if (e.target === cashPopup) {
    cashPopup.style.display = "none";
    document.body.style.overflow = "";
  }
});

// زر تأكيد الكاش
confirmCashBtn?.addEventListener("click", () => {
  confirmCashBtn.innerHTML = "جارٍ تأكيد الطلب...";
  confirmCashBtn.disabled = true;

  setTimeout(() => {
    confirmCashBtn.innerHTML = "تم التأكيد ✓";
    confirmCashBtn.style.background = "#16c47f";
    confirmCashBtn.style.color = "#fff";
  }, 1200);
});

/* ==========================================================
   10) Visa — زر تأكيد الدفع
========================================================== */
const confirmVisaBtn = document.querySelector(".confirm-visa-btn");

confirmVisaBtn?.addEventListener("click", () => {
  confirmVisaBtn.innerHTML = "جارٍ تأكيد الدفع...";
  confirmVisaBtn.disabled = true;

  setTimeout(() => {
    confirmVisaBtn.innerHTML = "تم الدفع ✓";
    confirmVisaBtn.style.background = "#16c47f";
    confirmVisaBtn.style.color = "#fff";
  }, 1200);
});

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

    if (scrollToTopBtn) {
      scrollToTopBtn.style.display = window.scrollY > 200 ? "block" : "none";
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  });

  scrollToTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ==========================================================
      2) User Menu
  ========================================================== */
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

  /* ==========================================================
      3) Pop-up View (Eye)
  ========================================================== */
  const novaPopup = document.getElementById("novaPopup");
  const novaCloseBtn = document.querySelector(".nova-close-btn");
  const eyeAreas = document.querySelectorAll(".card-overlay");

  eyeAreas.forEach((area) => {
    area.addEventListener("click", () => {
      if (!novaPopup) return;
      novaPopup.style.display = "flex";
      document.body.style.overflow = "hidden";
    });
  });

  novaCloseBtn?.addEventListener("click", () => {
    if (!novaPopup) return;
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
    if (e.key === "Escape" && novaPopup) {
      novaPopup.style.display = "none";
      document.body.style.overflow = "";
    }
  });
});

/* ==========================================================
   ✅ Helpers للـ Popups
========================================================== */
function openOverlay(el) {
  if (!el) return;
  el.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeOverlay(el) {
  if (!el) return;
  el.style.display = "none";
  document.body.style.overflow = "";
}

function closeAllPaymentOverlays() {
  if (paymentOverlay) paymentOverlay.style.display = "none";
  if (visaOverlay) visaOverlay.style.display = "none";
  if (cashPopup) cashPopup.style.display = "none";
  document.body.style.overflow = "";
}

/* ==========================================================
   6) Popup اختيار طريقة الدفع
========================================================== */
const checkoutBtn = document.querySelector(".checkout-btn");
const paymentOverlay = document.getElementById("paymentOverlay");
const closePayment = document.getElementById("closePayment");

checkoutBtn?.addEventListener("click", () => {
  if (!paymentOverlay) return;
  openOverlay(paymentOverlay);
});

closePayment?.addEventListener("click", () => {
  if (!paymentOverlay) return;
  closeOverlay(paymentOverlay);
});

window.addEventListener("click", (e) => {
  if (e.target === paymentOverlay) {
    closeOverlay(paymentOverlay);
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
  if (!visaOverlay) return;
  if (paymentOverlay) paymentOverlay.style.display = "none";
  openOverlay(visaOverlay);
});

visaRadio?.addEventListener("change", () => {
  if (visaRadio.checked) {
    if (paymentOverlay) paymentOverlay.style.display = "none";
    openOverlay(visaOverlay);
  }
});

closeVisa?.addEventListener("click", () => {
  if (!visaOverlay) return;
  closeOverlay(visaOverlay);
});

visaOverlay?.addEventListener("click", (e) => {
  if (e.target === visaOverlay) {
    closeOverlay(visaOverlay);
  }
});

/* ==========================================================
   8) Visa — تحديث بيانات الكارت
========================================================== */
document.getElementById("card-number")?.addEventListener("input", function () {
  let val = this.value.replace(/\D/g, "").substring(0, 16);
  val = val.replace(/(.{4})/g, "$1 ");
  this.value = val.trim();
  document.getElementById("preview-number").textContent = val || "**** **** **** ****";
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
   9) Cash Popup — فتح/غلق/تأكيد + ✅ تحميل بيانات حقيقية
========================================================== */
const cashPopup = document.getElementById("cashPopup");
const openCashBtn = document.getElementById("openCashBtn");
const closeCashBtn = document.getElementById("closeCashBtn");
const confirmCashBtn = document.querySelector(".confirm-cash-btn");

// عناصر UI داخل Popup الكاش (لازم تكون موجودة في HTML)
const cashPhoneEl = document.getElementById("cashPhone");
const cashAddressEl = document.getElementById("cashAddress");
const cashOrderSummaryEl = document.getElementById("cashOrderSummary");

async function loadCashPopupData() {
  // usersApi.js لازم يكون متحمّل
  if (!window.usersApi?.me) {
    window.showErrorMessage?.("usersApi.js مش متحمّل أو مفيهوش me()");
    return;
  }
  if (!window.cartApi?.getMy) {
    window.showErrorMessage?.("cartApi.js مش متحمّل أو مفيهوش getMy()");
    return;
  }

  // placeholder
  if (cashPhoneEl) cashPhoneEl.textContent = "جارٍ التحميل...";
  if (cashAddressEl) cashAddressEl.textContent = "جارٍ التحميل...";
  if (cashOrderSummaryEl) cashOrderSummaryEl.textContent = "جارٍ التحميل...";

  const [me, cartRes] = await Promise.all([
    window.usersApi.me(),
    window.cartApi.getMy(),
  ]);

  const cart = normalizeCartResponse(cartRes);

  const phone = me?.phone ?? me?.Phone ?? "غير مسجل";
  const address = me?.address ?? me?.Address ?? "غير مسجل";

  if (cashPhoneEl) cashPhoneEl.textContent = phone;
  if (cashAddressEl) cashAddressEl.textContent = address;

  const totalProducts = cart.totalProducts ?? 0;
  const totalPrice = cart.totalPrice ?? 0;

  if (cashOrderSummaryEl) {
    cashOrderSummaryEl.textContent = `${totalProducts} منتج - إجمالي ${formatEGP(totalPrice)}`;
  }
}

openCashBtn?.addEventListener("click", async () => {
  if (!cashPopup) return;

  try {
    if (paymentOverlay) paymentOverlay.style.display = "none";
    openOverlay(cashPopup);

    await loadCashPopupData();
  } catch (err) {
    console.error(err);
    window.showErrorMessage?.(err?.message || "حصلت مشكلة في تحميل بيانات الدفع");
  }
});

closeCashBtn?.addEventListener("click", () => {
  if (!cashPopup) return;
  closeOverlay(cashPopup);
});

cashPopup?.addEventListener("click", (e) => {
  if (e.target === cashPopup) {
    closeOverlay(cashPopup);
  }
});

/* ==========================================================
   10) Visa — زر تأكيد الدفع
========================================================== */
const confirmVisaBtn = document.querySelector(".confirm-visa-btn");

/* ==========================================================
   ✅✅✅ Checkout API الحقيقي للأوردر
   - CASH = 2
   - VISA = 1
========================================================== */
const PAYMENT_METHODS = {
  VISA: 1,
  CASH: 2,
};

async function doCheckout(paymentMethodId, btn, busyText) {
  if (!window.ordersApi?.checkout) {
    window.showErrorMessage?.("ordersApi.js مش متحمّل أو مفيهوش checkout()");
    return;
  }

  const oldHtml = btn?.innerHTML;

  try {
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = busyText || "جارٍ التنفيذ...";
    }

    const result = await window.ordersApi.checkout(paymentMethodId);

    window.showSuccessMessage?.("تم تأكيد الطلب بنجاح ✅");

    closeAllPaymentOverlays();

    await renderCartPage();
    await window.refreshCartBadge?.();

    console.log("Checkout result:", result);
  } catch (err) {
    console.error("CHECKOUT ERROR:", err);
    window.showErrorMessage?.(err?.message || "فشل إتمام الطلب");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = oldHtml || "تأكيد";
    }
  }
}

/* ==========================================================
   Confirm Cash / Visa => يعمل Order فعلي
========================================================== */
confirmCashBtn?.addEventListener("click", async () => {
  await doCheckout(PAYMENT_METHODS.CASH, confirmCashBtn, "جارٍ تأكيد الطلب...");
});

confirmVisaBtn?.addEventListener("click", async (e) => {
  e.preventDefault();
  await doCheckout(PAYMENT_METHODS.VISA, confirmVisaBtn, "جارٍ تأكيد الدفع...");
});

/* ==========================================================
   (اختياري) ESC يقفل كل بوبات الدفع
========================================================== */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeAllPaymentOverlays();
  }
});

/* ==========================================================
   11) Cart API Render + Actions
========================================================== */

function formatEGP(n) {
  const num = Number(n || 0);
  return `${num.toFixed(2)} جنيه`;
}

function normalizeCartResponse(res) {
  if (!res) return { idCart: 0, totalProducts: 0, totalPrice: 0, items: [] };

  const cart = res.cart ? res.cart : res;

  const idCart = cart.idCart ?? cart.IdCart ?? 0;
  const totalProducts = cart.totalProducts ?? cart.TotalProducts ?? 0;
  const totalPrice = cart.totalPrice ?? cart.TotalPrice ?? 0;

  const items = cart.items ?? cart.Items ?? [];

  const normItems = (items || []).map((i) => ({
    idCartItem: i.idCartItem ?? i.IdCartItem,
    productApiName: i.productApiName ?? i.ProductApiName,
    quantity: i.quantity ?? i.Quantity ?? 1,
    price: i.price ?? i.Price ?? 0,
    imageUrl: i.imageUrl ?? i.ImageUrl ?? null,
  }));

  return { idCart, totalProducts, totalPrice, items: normItems };
}

function updateSummary(cart) {
  const badge = document.getElementById("cart_clr");
  if (badge) badge.textContent = cart.totalProducts ?? 0;

  const label = document.querySelector(
    ".cart-summary .summary-row:nth-of-type(1) span:nth-child(1)"
  );
  const value = document.querySelector(
    ".cart-summary .summary-row:nth-of-type(1) span:nth-child(2)"
  );

  if (label) label.textContent = `المجموع الفرعي (${cart.totalProducts ?? 0} منتجات)`;
  if (value) value.textContent = formatEGP(cart.totalPrice);

  const totalEl = document.querySelector(".cart-summary .total-price");
  if (totalEl) totalEl.textContent = `إجمالي المجموع :  ${formatEGP(cart.totalPrice)}`;
}

function buildCartItemHTML(item) {
  const imageHtml = item.imageUrl ? `<img src="${item.imageUrl}" class="item-img">` : "";

  return `
    <div class="cart-item" data-item-id="${item.idCartItem}">
      ${imageHtml}

      <div class="item-info">
        <h3 class="item-name">${item.productApiName}</h3>
        <button class="remove-btn" data-action="remove" data-id="${item.idCartItem}">
          <i class="fa-solid fa-trash"></i>
          إزالة
        </button>
      </div>

      <div class="item-price">
        <span class="price">${formatEGP(item.price)}</span>

        <div class="qty-box">
          <button class="qty-btn" data-action="inc" data-id="${item.idCartItem}" data-qty="${item.quantity}">+</button>
          <span class="qty">${item.quantity}</span>
          <button class="qty-btn" data-action="dec" data-id="${item.idCartItem}" data-qty="${item.quantity}">-</button>
        </div>
      </div>
    </div>
  `;
}

async function renderCartPage() {
  if (!window.cartApi) {
    console.error("cartApi.js مش متحمّل");
    return;
  }

  const list = document.getElementById("cartItemsList");
  if (!list) return;

  list.innerHTML = `<div style="padding:12px">جاري تحميل العربة...</div>`;

  const res = await cartApi.getMy();
  const cart = normalizeCartResponse(res);

  if (!cart.items || cart.items.length === 0) {
    list.innerHTML = `<div style="padding:12px">العربة فارغة</div>`;
    updateSummary({ totalProducts: 0, totalPrice: 0, items: [] });
    return;
  }

  list.innerHTML = cart.items.map(buildCartItemHTML).join("");
  updateSummary(cart);
}

async function handleCartClick(e) {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;
  const itemId = Number(btn.dataset.id);
  const currentQty = Number(btn.dataset.qty);

  try {
    if (action === "remove") {
      await cartApi.remove(itemId);
    } else if (action === "inc") {
      await cartApi.updateQty(itemId, currentQty + 1);
    } else if (action === "dec") {
      const newQty = currentQty - 1;
      if (newQty <= 0) await cartApi.remove(itemId);
      else await cartApi.updateQty(itemId, newQty);
    }

    await renderCartPage();
  } catch (err) {
    console.error("CART ACTION ERROR:", err);
    window.showErrorMessage?.("❌ حصل خطأ: " + (err?.message || err));
  }
}

async function clearCart() {
  try {
    await cartApi.clear();
    await renderCartPage();
  } catch (err) {
    console.error("CLEAR CART ERROR:", err);
    window.showErrorMessage?.("❌ حصل خطأ: " + (err?.message || err));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const clearBtn = document.getElementById("btnClearCart");
  if (clearBtn) clearBtn.addEventListener("click", clearCart);

  const list = document.getElementById("cartItemsList");
  if (list) list.addEventListener("click", handleCartClick);

  renderCartPage().catch(console.error);
});

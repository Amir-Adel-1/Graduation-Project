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

/* ==========================================================
   Favorites Page Logic
========================================================== */

function formatEGP(n) {
  const num = Number(n || 0);
  return `${num.toFixed(2)} جنيه`;
}

function normalizeFavResponse(res) {
  const list = res?.favorites ?? res?.Favorites ?? res?.items ?? res?.Items ?? [];
  const count = res?.count ?? res?.Count ?? list.length ?? 0;

  const items = (list || []).map((x) => ({
    idFavorite: x.idFavorite ?? x.IdFavorite,
    productApiName: x.productApiName ?? x.ProductApiName,
    price: x.price ?? x.Price ?? 0,
    imageUrl: x.imageUrl ?? x.ImageUrl ?? null,
  }));

  return { count, items };
}

function buildFavItemHTML(item) {
  const img = item.imageUrl
    ? `<img src="${item.imageUrl}" class="item-img" alt="${item.productApiName}">`
    : `<div class="item-img" style="display:flex;align-items:center;justify-content:center;">🩵</div>`;

  return `
    <div class="fav-item" data-id="${item.idFavorite}">
      ${img}

      <div class="item-info">
        <h3 class="item-name">${item.productApiName || "منتج"}</h3>

        <div class="item-actions">
          <button class="remove-btn" data-action="remove" data-id="${item.idFavorite}">
            <i class="fa-solid fa-trash"></i>
            إزالة
          </button>

          <button class="add-to-cart-btn" data-action="add-to-cart"
                  data-name="${encodeURIComponent(item.productApiName || "")}"
                  data-price="${item.price || 0}"
                  data-img="${encodeURIComponent(item.imageUrl || "")}">
            <i class="fa-solid fa-cart-plus"></i>
            إضافة إلى العربة
          </button>
        </div>
      </div>

      <div class="item-price">
        <span class="price">${formatEGP(item.price)}</span>
      </div>
    </div>
  `;
}

async function renderFavoritesPage() {
  const box = document.getElementById("favItemsList");
  if (!box) return;

  if (!window.favoritesApi?.my) {
    window.showErrorMessage?.("favoritesApi.js مش متحمّل أو مفيهوش my()");
    return;
  }

  box.innerHTML = `<div style="padding:12px">جاري تحميل المفضلة...</div>`;

  try {
    const res = await window.favoritesApi.my();
    const fav = normalizeFavResponse(res);

    // ✅ تحديث عداد المفضلة
    const favBadge = document.getElementById("fav_clr");
    if (favBadge) favBadge.textContent = fav.count;

    if (!fav.items.length) {
      box.innerHTML = `<div style="padding:12px">المفضلة فارغة</div>`;
      return;
    }

    box.innerHTML = fav.items.map(buildFavItemHTML).join("");
  } catch (err) {
    console.error("FAV LOAD ERROR:", err);
    window.showErrorMessage?.(err?.message || "فشل تحميل المفضلة");
    box.innerHTML = `<div style="padding:12px">حصل خطأ أثناء تحميل المفضلة</div>`;
  }
}

async function handleFavoritesClick(e) {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;

  // ✅ إزالة من المفضلة
  if (action === "remove") {
    const id = Number(btn.dataset.id);
    if (!id) return;

    try {
      btn.disabled = true;
      await window.favoritesApi.remove(id);

      window.showSuccessMessage?.("تمت الإزالة من المفضلة ✅");

      await renderFavoritesPage();
      await window.refreshFavBadge?.();
    } catch (err) {
      console.error("REMOVE FAV ERROR:", err);
      window.showErrorMessage?.(err?.message || "فشل حذف من المفضلة");
    } finally {
      btn.disabled = false;
    }
    return;
  }

  // ✅ إضافة للعربة (المطلوب)
  if (action === "add-to-cart") {
    if (!window.cartApi?.addItem) {
      window.showErrorMessage?.("cartApi.js مش متحمّل أو مفيهوش addItem()");
      return;
    }

    const name = decodeURIComponent(btn.dataset.name || "");
    const price = Number(btn.dataset.price || 0);
    const img = decodeURIComponent(btn.dataset.img || "");

    const payload = {
      name,
      price,
      imageUrl: img || null,
    };

    const oldHtml = btn.innerHTML;

    try {
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;

      // ✅ إضافة للكارت بكمية 1
      await window.cartApi.addItem(payload, 1);

      // ✅ تحديث عداد الكارت
      await window.refreshCartBadge?.();

      window.showSuccessMessage?.("تمت الإضافة إلى العربة ✅");
    } catch (err) {
      console.error("ADD TO CART FROM FAV ERROR:", err);
      window.showErrorMessage?.(err?.message || "فشل الإضافة للعربة");
    } finally {
      btn.disabled = false;
      btn.innerHTML = oldHtml;
    }
    return;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // ✅ تحديث العدادات أول ما الصفحة تفتح
  window.refreshCartBadge?.();
  window.refreshFavBadge?.();

  const box = document.getElementById("favItemsList");
  box?.addEventListener("click", handleFavoritesClick);

  renderFavoritesPage();
});


/* ==========================================================
   DOMContentLoaded (Nav + Badges + Load Favorites)
========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  // ✅ عداد الكارت + المفضلة
  window.refreshCartBadge?.();
  window.refreshFavBadge?.();

  // ✅ events
  const box = document.getElementById("favItemsList");
  box?.addEventListener("click", handleFavoritesClick);

  // ✅ render
  renderFavoritesPage();
});

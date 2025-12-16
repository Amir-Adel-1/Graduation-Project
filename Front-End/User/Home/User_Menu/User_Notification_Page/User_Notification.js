// ==========================================================
// Helpers
// ==========================================================
function timeAgo(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";

  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `منذ ${sec} ثانية`;

  const min = Math.floor(sec / 60);
  if (min < 60) return `منذ ${min} دقيقة`;

  const hr = Math.floor(min / 60);
  if (hr < 24) return `منذ ${hr} ساعة`;

  const day = Math.floor(hr / 24);
  return `منذ ${day} يوم`;
}

function openPopup(details) {
  const popup = document.getElementById("popup");
  const content = popup?.querySelector(".popup-content");
  if (!popup || !content) return;

  content.innerHTML = `
    <h3>تفاصيل الصيدلية</h3>
    <p><strong>الاسم:</strong> ${details?.pharmacyName || "غير متوفر"}</p>
    <p><strong>العنوان:</strong> ${details?.address || "غير متوفر"}</p>
    <p><strong>رقم الهاتف:</strong> ${details?.phone || "غير متوفر"}</p>
    <p><strong>البريد الإلكتروني:</strong> ${details?.email || "غير متوفر"}</p>
    <button id="closePopup" class="btn close">إغلاق</button>
  `;

  popup.classList.add("active");

  content.querySelector("#closePopup")?.addEventListener("click", () => {
    popup.classList.remove("active");
  });
}

function attachPopupOutsideClose() {
  const popup = document.getElementById("popup");
  if (!popup) return;

  popup.addEventListener("click", (e) => {
    if (e.target === popup) popup.classList.remove("active");
  });
}

function normalizeNotifResponse(res) {
  const list = res?.notifications ?? res?.Notifications ?? [];
  const items = (list || []).map((n) => ({
    idNotification: n.idNotification ?? n.IdNotification,
    createAt: n.createAt ?? n.CreateAt,
    idRequest: n.idRequest ?? n.IdRequest,
    isRead: n.isRead ?? n.IsRead ?? false,
    pharmacyName: n.pharmacyName ?? n.PharmacyName ?? "صيدلية",
  }));

  // count هنا unread من السيرفر
  const unreadCount = res?.count ?? res?.Count ?? items.filter(x => !x.isRead).length;
  return { unreadCount, items };
}

function buildCardHTML(n) {
  const reqTxt = n.idRequest
    ? `تم الرد على طلبك بخصوص طلب دواء رقم (${n.idRequest}).`
    : "لديك إشعار جديد.";

  // ✅ لو unread ضيف class new عشان العلامة الحمرا
  const newClass = n.isRead ? "" : "new";

  return `
    <div class="notification-card ${newClass}" data-id="${n.idNotification}">
      <div class="notif-header">
        <span class="dot"></span>
        <h3>${n.pharmacyName}</h3>
      </div>

      <p class="notif-text">${reqTxt}</p>
      <p class="notif-time">${timeAgo(n.createAt)}</p>

      <button class="view-btn" data-action="view" data-id="${n.idNotification}">
        <i class="fa-solid fa-eye"></i> عرض التفاصيل
      </button>
    </div>
  `;
}

async function renderNotificationsPage() {
  const listEl = document.getElementById("notificationsList");
  if (!listEl) return;

  if (!window.notificationsApi?.my) {
    listEl.innerHTML = `<div style="padding:12px">notificationsApi.js مش متحمّل</div>`;
    return;
  }

  listEl.innerHTML = `<div style="padding:12px">جاري تحميل الإشعارات...</div>`;

  try {
    const res = await window.notificationsApi.my();
    const { unreadCount, items } = normalizeNotifResponse(res);

    // ✅ badge الحقيقي (unread)
    const badge = document.getElementById("notifBadge");
    if (badge) {
      badge.textContent = unreadCount;
      badge.style.display = unreadCount > 0 ? "inline-block" : "none";
    }

    if (!items.length) {
      listEl.innerHTML = `<div style="padding:12px">لا توجد إشعارات حاليًا</div>`;
      return;
    }

    listEl.innerHTML = items.map(buildCardHTML).join("");
  } catch (err) {
    console.error("NOTIF LOAD ERROR:", err);
    listEl.innerHTML = `<div style="padding:12px">حصل خطأ أثناء تحميل الإشعارات</div>`;
  }
}

async function handleNotifActions(e) {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;
  const id = Number(btn.dataset.id);

  if (action !== "view") return;

  try {
    // ✅ details
    const details = await window.notificationsApi.details(id);
    openPopup(details);

    // ✅ mark read
    await window.notificationsApi.markRead(id);

    // ✅ شيل العلامة الحمرا فورًا من الكارت
    const card = btn.closest(".notification-card");
    card?.classList.remove("new");

    // ✅ حدث العداد + الليست من السيرفر
    await renderNotificationsPage();
  } catch (err) {
    console.error("VIEW NOTIF ERROR:", err);
    window.showErrorMessage?.(err?.message || "فشل عرض تفاصيل الإشعار");
  }
}

// ==========================================================
// NavBar + Scroll
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  let cart_clr = document.getElementById("cart_clr");
  let fav_clr = document.getElementById("fav_clr");
  const navbar = document.getElementById("navbar");
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  let lastScrollTop = 0;

  window.addEventListener("scroll", () => {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > lastScrollTop && currentScroll > 100) {
      navbar?.classList.add("hidden");
    } else {
      navbar?.classList.remove("hidden");
    }

    if (currentScroll > 50) {
      navbar?.classList.add("scrolled");
      if (cart_clr) cart_clr.style.color = "white";
      if (fav_clr) fav_clr.style.color = "white";
      document.querySelectorAll(".a").forEach((el) => (el.style.color = "white"));
    } else {
      navbar?.classList.remove("scrolled");
      if (cart_clr) cart_clr.style.color = "white";
      if (fav_clr) fav_clr.style.color = "white";
    }

    if (scrollToTopBtn) {
      scrollToTopBtn.style.display = window.scrollY > 200 ? "block" : "none";
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  });

  scrollToTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

// ==========================================================
// User Menu
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
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
});

// ==========================================================
// Load page
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  window.refreshCartBadge?.();
  window.refreshFavBadge?.();
  window.refreshNotifBadge?.();

  renderNotificationsPage();

  document
    .getElementById("notificationsList")
    ?.addEventListener("click", handleNotifActions);

  attachPopupOutsideClose();
});

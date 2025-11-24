
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

    // 🔹 تغيير لون الخلفية والأيقونات
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
















// Start Btn Tab Pages
const tabs = document.querySelectorAll(".req-tab");
const sections = document.querySelectorAll(".req-section");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {

        // tab styling
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        // show section
        const id = tab.getAttribute("data-tab");
        sections.forEach(sec => sec.classList.remove("active"));
        document.getElementById(id).classList.add("active");

    });
});







// Start Button View Details Requests

function openPopup() {
    const popup = document.getElementById("popup");
    popup.classList.add("active");

    // منع اسكرول الصفحة
    document.body.style.overflow = "hidden";
}

// ===============================
// زرار الإغلاق
// ===============================
document.getElementById("closePopup").addEventListener("click", function () {
    const popup = document.getElementById("popup");
    popup.classList.remove("active");

    // رجوع الاسكرول
    document.body.style.overflow = "auto";
});

// ===============================
// إغلاق لو المستخدم ضغط برا المحتوى
// ===============================
document.getElementById("popup").addEventListener("click", function (e) {

    // لو داس على الخلفية مش المحتوى
    if (e.target.id === "popup") {
        this.classList.remove("active");

        // رجوع الاسكرول
        document.body.style.overflow = "auto";
    }
});

// ===============================
// منع إغلاق البوب لو ضغط جوا المحتوى
// ===============================
document.querySelector(".popup-content").addEventListener("click", function (e) {
    e.stopPropagation();
});

// End Button View Details Requests















// Start Button View Details Order
function openOrderPopup(orderId) {
    // افتح الـ overlay
    const popup = document.getElementById("orderPopup");
    popup.style.display = "flex";

    // منع الاسكرول في الصفحة
    document.body.style.overflow = "hidden";

    // اخفي كل بوبات تفاصيل الأوردر
    const allOrderPopups = document.querySelectorAll(".order-popup");
    allOrderPopups.forEach(p => p.style.display = "none");

    // اعرض البوب الخاص بالأوردر اللي اتضغط عليه
    const targetPopup = document.getElementById(`order-${orderId}`);
    if (targetPopup) {
        targetPopup.style.display = "block";
    }
}

// قفل البوب
function closeOrderPopup() {
    document.getElementById("orderPopup").style.display = "none";

    // رجّع الاسكرول
    document.body.style.overflow = "auto";
}


// ===============================
// إغلاق البوب لو دوست برا المحتوى
// ===============================

// عنصر الـ overlay
const popupOverlay = document.getElementById("orderPopup");

// لو داس على الخلفية (مش البوب)
popupOverlay.addEventListener("click", function (e) {
    if (e.target === this) {
        closeOrderPopup();
    }
});

// منع إغلاق البوب لما تضغط جوة المحتوى
document.querySelectorAll(".order-popup-content").forEach(popup => {
    popup.addEventListener("click", function (e) {
        e.stopPropagation(); // يمنع إغلاقه
    });
});
// End Button View Details Order















// عدد الإشعارات (بدل الرقم ده هتجيبه من API)
let newNotifications = 5;

const badge = document.getElementById("notifBadge");

if (newNotifications > 0) {
    badge.innerText = newNotifications;
    badge.style.display = "inline-block";
} else {
    badge.style.display = "none";
}

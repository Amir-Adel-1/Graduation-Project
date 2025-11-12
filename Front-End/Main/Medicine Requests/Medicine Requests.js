
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











// ------------------ Start Menu Button ------------------

// الزرار والمنيو الجديدة
const menuBtn = document.getElementById("menuBtn");
const menuOptions = document.getElementById("menuOptions");

// فتح وغلق المنيو
menuBtn.addEventListener("click", () => {
  const isActive = menuBtn.classList.toggle("active");
  menuOptions.style.display = isActive ? "block" : "none";
});

// غلق المنيو عند الضغط خارجها
document.addEventListener("click", (e) => {
  if (!menuBtn.contains(e.target) && !menuOptions.contains(e.target)) {
    menuBtn.classList.remove("active");
    menuOptions.style.display = "none";
  }
});

document.getElementById("newChat").addEventListener("click", () => {
  // مسح كل الرسائل القديمة
  const chatBody = document.getElementById("chatBody");
  chatBody.innerHTML = "";

  // إضافة رسالة ترحيبية من البوت
  addMessage("🩺 تم بدء محادثة جديدة! كيف يمكنني مساعدتك اليوم؟", "bot");

  // إغلاق القائمة
  menuBtn.classList.remove("active");
  menuOptions.style.display = "none";
});


// ------------------ التحكم في قائمة الشاتات ------------------
const chatItems = document.querySelectorAll(".chat-history ul li");

chatItems.forEach((item) => {
  item.addEventListener("click", () => {
    // إزالة التحديد من الكل
    chatItems.forEach((li) => li.classList.remove("active"));
    // تفعيل الشات الحالي
    item.classList.add("active");

    // إضافة رسالة داخل الشات
    addMessage(`تم فتح ${item.textContent} 💬`, "bot");

    // ممكن تقفل المنيو بعد الاختيار (اختياري)
    menuBtn.classList.remove("active");
    menuOptions.style.display = "none";
  });
});

// ------------------ End Menu Button ------------------

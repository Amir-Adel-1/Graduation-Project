// ==========================================================
// 📌  إعداد الـ NavBar وسلوك الصفحة أثناء التمرير
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById("navbar");
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  const cartClr = document.getElementById("cart_clr");
  const favClr = document.getElementById("fav_clr");

  let lastScrollTop = 0;

  window.addEventListener("scroll", () => {
    const currentScroll =
      window.pageYOffset || document.documentElement.scrollTop;

    // إخفاء النافبار عند النزول
    if (currentScroll > lastScrollTop && currentScroll > 100) {
      navbar?.classList.add("hidden");
    } else {
      navbar?.classList.remove("hidden");
    }

    // تغيير الشكل عند التمرير
    if (currentScroll > 50) {
      navbar?.classList.add("scrolled");
      if (cartClr) cartClr.style.color = "white";
      if (favClr) favClr.style.color = "white";
    } else {
      navbar?.classList.remove("scrolled");
    }

    // زر الرجوع لأعلى
    if (scrollToTopBtn) {
      scrollToTopBtn.style.display = currentScroll > 200 ? "block" : "none";
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  });

  scrollToTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

// ==========================================================
// 📌  قائمة المستخدم (User Menu)
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
// 📌  عداد الكارت + المفضلة
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  window.refreshCartBadge?.();
  window.refreshFavBadge?.();
});

// ==========================================================
// ✅  تحميل بيانات المستخدم من الداتابيز وعرض الاسم
// - يعرض الاسم في: input + navbar
// - API بيرجع: firstName + lastName
// ==========================================================
document.addEventListener("DOMContentLoaded", async () => {
  const userNameInput = document.getElementById("userNameInput"); // داخل الفورم
  const userNameNav = document.getElementById("userName"); // في الـ NavBar

  try {
    const me = await window.medicineRequestsApi?.getMe();

    const full =
      (me?.fullName || me?.FullName || "").trim() ||
      `${me?.firstName ?? ""} ${me?.lastName ?? ""}`.trim() ||
      me?.userName ||
      me?.email ||
      "المستخدم";

    if (userNameInput) userNameInput.value = full;
    if (userNameNav) userNameNav.textContent = full;
  } catch (err) {
    console.error("GET ME ERROR:", err);

    if (userNameInput) userNameInput.value = "المستخدم";
    if (userNameNav) userNameNav.textContent = "المستخدم";

    window.showErrorMessage?.("مش قادر أجيب اسم المستخدم من الداتابيز. تأكد من تسجيل الدخول.");
  }
});

// ==========================================================
// 📌  Menu Button (القائمة الجانبية)
// ==========================================================
const menuBtn = document.getElementById("menuBtn");
const menuOptions = document.getElementById("menuOptions");

menuBtn?.addEventListener("click", () => {
  const isActive = menuBtn.classList.toggle("active");
  if (menuOptions) menuOptions.style.display = isActive ? "block" : "none";
});

document.addEventListener("click", (e) => {
  if (menuBtn && menuOptions) {
    if (!menuBtn.contains(e.target) && !menuOptions.contains(e.target)) {
      menuBtn.classList.remove("active");
      menuOptions.style.display = "none";
    }
  }
});

// ==========================================================
// ✅  زر "طلب جديد" (تفريغ الفورم) - IDs الصحيحة
// ==========================================================
document.getElementById("newChat")?.addEventListener("click", () => {
  const medInput = document.getElementById("medicineNameInput");
  const qtySelect = document.getElementById("quantitySelect");

  if (medInput) medInput.value = "";
  if (qtySelect) qtySelect.selectedIndex = 0;
});

// ==========================================================
// ✅  حفظ الطلب الجديد محليًا (LocalStorage) علشان يظهر فورًا في صفحة "طلباتي"
// ==========================================================
function pushPendingMedicineRequestToLocalStorage(item) {
  try {
    const key = "pending_medicine_requests";
    const old = JSON.parse(localStorage.getItem(key) || "[]");
    old.unshift(item);
    localStorage.setItem(key, JSON.stringify(old));
  } catch (e) {
    console.warn("LocalStorage save failed:", e);
  }
}

// ==========================================================
// ✅  إرسال طلب دواء ناقص
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  const form =
    document.getElementById("missingMedicineForm") ||
    document.querySelector(".form-grid-missing");

  if (!form) {
    console.error("Medicine Request form not found");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const medName = document.getElementById("medicineNameInput")?.value.trim();
    const quantity = document.getElementById("quantitySelect")?.value;

    if (!medName || !quantity || quantity === "اختر الكمية") {
      window.showErrorMessage?.("من فضلك أدخل اسم الدواء واختر الكمية");
      return;
    }

    try {
      const result = await window.medicineRequestsApi.create({
        medicineName: medName,
        quantity
      });

      window.showSuccessMessage?.("تم إرسال الطلب بنجاح ✅");

      // ✅ احفظ نسخة محلية (علشان تظهر فورًا في صفحة طلباتي حتى لو ما عملتش reload)
      pushPendingMedicineRequestToLocalStorage({
        requestId: result?.requestId ?? result?.RequestId ?? null,
        medicineName: medName,
        quantity: quantity,
        createAt: new Date().toISOString(),
        orderStatus: "Pending"
      });

      // تفريغ الفورم
      document.getElementById("medicineNameInput").value = "";
      document.getElementById("quantitySelect").selectedIndex = 0;

      // ✅ تحويل تلقائي لصفحة طلباتي
      window.location.href = "../../User/Home/User_Menu/User_Requests_Page/Requests.html";
    } catch (err) {
      console.error("MEDICINE REQUEST ERROR:", err);
      window.showErrorMessage?.(err?.message || "حصل خطأ أثناء إرسال الطلب");
    }
  });
});

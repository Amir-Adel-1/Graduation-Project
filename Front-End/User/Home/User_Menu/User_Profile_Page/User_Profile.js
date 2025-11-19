// ============================================================
// 📜 User_Profile.js (النسخة النهائية المدمجة بدون تعارض)
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

  // ============================================================
  // 🌐 الجزء الأول: الـ NavBar + زر الصعود لأعلى (Scroll To Top)
  // ============================================================

  const navbar = document.getElementById("navbar");
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  let lastScrollTop = 0;

  if (scrollToTopBtn) {
    scrollToTopBtn.style.display = "none";
    scrollToTopBtn.style.justifyContent = "center";
    scrollToTopBtn.style.alignItems = "center";
  }

  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // إخفاء النافبار عند السحب لأسفل
    if (currentScroll > lastScrollTop && currentScroll > 100) {
      navbar.classList.add("hidden");
    } else {
      navbar.classList.remove("hidden");
    }

    // إظهار أو إخفاء زر الصعود لأعلى
    if (scrollToTopBtn) {
      scrollToTopBtn.style.display = window.scrollY > 200 ? "flex" : "none";
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  });

  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ============================================================
  // 👤 الجزء الثاني: قائمة المستخدم (User Menu)
  // ============================================================

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

  // ============================================================
  // 🧩 الجزء الثالث: منطق الملف الشخصي (Profile Logic)
  // ============================================================

  const editBtn = document.getElementById("editBtn");
  const saveBtn = document.getElementById("saveBtn");
  const addPhoneBtn = document.getElementById("addPhoneBtn");
  const addAddressBtn = document.getElementById("addAddressBtn");

  let isEditing = false;

  // الحقول المقفولة دائمًا حتى في التعديل
  const lockedFields = [
    "الاسم الكامل:",
    "الجنس:",
    "تاريخ الميلاد:",
    "البريد الإلكتروني:",
    "رقم الهاتف:",
    "العنوان:"
  ];

  // إخفاء أزرار الإضافة في البداية
  [addPhoneBtn, addAddressBtn].forEach(btn => {
    if (btn) {
      btn.style.display = "none";
      btn.style.opacity = "0";
      btn.style.pointerEvents = "none";
    }
  });

  // ===============================
  // ✏️ تفعيل وضع التعديل
  // ===============================
  editBtn.addEventListener("click", () => {
    isEditing = true;

    document.querySelectorAll(".profile-field input, .profile-field textarea").forEach((input) => {
      const label = input.closest(".profile-field")?.querySelector("label")?.innerText.trim();

      if (!lockedFields.includes(label) || input.classList.contains("new-field")) {
        input.removeAttribute("readonly");
        input.style.background = "rgba(255,255,255,0.45)";
      }
    });

    const hasNewPhone = document.querySelector("#phoneRow .new-field");
    const hasNewAddress = document.querySelector("#addressRow .new-field");

    if (!hasNewPhone) {
      addPhoneBtn.style.display = "inline-flex";
      addPhoneBtn.style.opacity = "1";
      addPhoneBtn.style.pointerEvents = "auto";
    } else {
      addPhoneBtn.style.display = "none";
    }

    if (!hasNewAddress) {
      addAddressBtn.style.display = "inline-flex";
      addAddressBtn.style.opacity = "1";
      addAddressBtn.style.pointerEvents = "auto";
    } else {
      addAddressBtn.style.display = "none";
    }

    editBtn.disabled = true;
    saveBtn.disabled = false;
    editBtn.style.opacity = "0.6";
  });

  // ===============================
  // 💾 حفظ التغييرات
  // ===============================
  saveBtn.addEventListener("click", () => {
    isEditing = false;

    document.querySelectorAll(".profile-field input, .profile-field textarea").forEach((input) => {
      input.setAttribute("readonly", true);
      input.style.background = "rgba(255,255,255,0.25)";
    });

    document.querySelectorAll(".new-field").forEach((field) => {
      if (field.value.trim() === "") field.remove();
    });

    [addPhoneBtn, addAddressBtn].forEach(btn => {
      if (btn) {
        btn.style.display = "none";
        btn.style.opacity = "0";
        btn.style.pointerEvents = "none";
      }
    });

    saveBtn.disabled = true;
    editBtn.disabled = false;
    editBtn.style.opacity = "1";

    showSuccessMessage("✅ تم حفظ التغييرات بنجاح!");
  });

  // ===============================
  // ➕ إضافة رقم هاتف جديد
  // ===============================
  addPhoneBtn.addEventListener("click", () => {
    if (!isEditing) return;

    const phoneRow = document.getElementById("phoneRow");
    const existingNew = phoneRow.querySelector(".new-field");
    if (existingNew) return;

    const newInput = document.createElement("input");
    newInput.type = "text";
    newInput.className = "input-field new-field";
    newInput.placeholder = "رقم هاتف آخر";

    phoneRow.appendChild(newInput);
    addPhoneBtn.style.display = "none";
  });

  // ===============================
  // ➕ إضافة عنوان جديد
  // ===============================
  addAddressBtn.addEventListener("click", () => {
    if (!isEditing) return;

    const addressRow = document.getElementById("addressRow");
    const existingNew = addressRow.querySelector(".new-field");
    if (existingNew) return;

    const newArea = document.createElement("textarea");
    newArea.className = "input-field new-field";
    newArea.placeholder = "عنوان آخر";

    addressRow.appendChild(newArea);
    addAddressBtn.style.display = "none";

    autoResizeTextarea(newArea);
  });

  // ===============================
  // 🧠 تمدد تلقائي للـ Textarea
  // ===============================
  function autoResizeTextarea(textarea) {
    textarea.addEventListener("input", () => {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    });
  }

  document.querySelectorAll("textarea").forEach(autoResizeTextarea);

  // ===============================
  // ✅ رسالة نجاح مؤقتة
  // ===============================
  function showSuccessMessage(text) {
    const alertBox = document.createElement("div");
    alertBox.textContent = text;
    Object.assign(alertBox.style, {
      position: "fixed",
      top: "30px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(0, 255, 200, 0.25)",
      color: "#00ffaa",
      padding: "12px 25px",
      borderRadius: "12px",
      backdropFilter: "blur(6px)",
      boxShadow: "0 0 15px rgba(0,255,255,0.4)",
      transition: "opacity 0.8s ease",
      zIndex: "9999",
    });

    document.body.appendChild(alertBox);
    setTimeout(() => {
      alertBox.style.opacity = "0";
      setTimeout(() => alertBox.remove(), 800);
    }, 1500);
  }

}); // ✅ نهاية الكود























// عدد الإشعارات (بدل الرقم ده هتجيبه من API)
let newNotifications = 5;

const badge = document.getElementById("notifBadge");

if (newNotifications > 0) {
    badge.innerText = newNotifications;
    badge.style.display = "inline-block";
} else {
    badge.style.display = "none";
}


// عناصر صفحة إنشاء حساب الصيدلي
const openPharmacyRegister = document.getElementById("openPharmacyRegister"); // زر فتح البوب
const pharmacyOverlay = document.getElementById("popupPharmacy"); // الخلفية
const closePharmacyPopup = document.getElementById("closePharmacysignup"); // زر الإغلاق

// لو عندك صفحة لوجن وعايز تخفيها وقت ظهور البوب (اختياري)
const loginOverlay = document.querySelector(".overlay-login"); // لو مش موجود سيبه فاضي

// تأكد إن العناصر موجودة قبل تشغيل الكود
if (openPharmacyRegister && pharmacyOverlay && closePharmacyPopup) {

  // فتح نافذة إنشاء حساب صيدلي
  openPharmacyRegister.addEventListener("click", () => {
    pharmacyOverlay.style.display = "flex";

    // إخفاء صفحة اللوجن (اختياري)
    if (loginOverlay) loginOverlay.style.display = "none";

    // منع الاسكرول
    document.body.style.overflow = "hidden";
  });

  // غلق النافذة بزر الإغلاق
  closePharmacyPopup.addEventListener("click", () => {
    pharmacyOverlay.style.display = "none";
    document.body.style.overflow = "auto";
  });

  // غلق النافذة عند الضغط على الخلفية فقط
  pharmacyOverlay.addEventListener("click", (e) => {
    if (e.target === pharmacyOverlay) {
      pharmacyOverlay.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });
}

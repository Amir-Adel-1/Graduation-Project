// زرار فتح البوب
const btnOpen = document.getElementById("btnOpenPharmacyRegister");

// الخلفية (Overlay)
const overlay = document.querySelector(".overlay-pharmacist");

// البوب نفسه
const popup = document.getElementById("pharmacyOverlay");

// زرار الإغلاق داخل البوب
const closeBtn = document.getElementById("closePharmacysignup");


// فتح البوب
btnOpen.addEventListener("click", () => {
  overlay.style.display = "flex";
  document.body.style.overflow = "hidden"; // منع الاسكرول
});


// إغلاق بالزر
closeBtn.addEventListener("click", () => {
  overlay.style.display = "none";
  document.body.style.overflow = "auto";
});


// إغلاق عند الضغط على الخلفية
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    overlay.style.display = "none";
    document.body.style.overflow = "auto";
  }
});

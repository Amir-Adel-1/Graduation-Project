

// Start pop-up Window

// ===============================
// ⭐ Nova Pop-up Window (Final)
// ===============================

// عناصر البوب أب
const novaPopup = document.getElementById("novaPopup");
const novaCloseBtn = document.querySelector(".nova-close-btn");

// كل أيقونات العين في الكروت
const eyeAreas = document.querySelectorAll(".overlay");

// عند الضغط على أيقونة العين → افتح البوب أب
eyeAreas.forEach(area => {
  area.addEventListener("click", () => {
    novaPopup.style.display = "flex";
    document.body.style.overflow = "hidden"; 
  });
});


// عند الضغط على زر الإغلاق
novaCloseBtn.addEventListener("click", () => {
  novaPopup.style.display = "none";
  document.body.style.overflow = "";
});

// عند الضغط خارج محتوى البوب أب
window.addEventListener("click", (e) => {
  if (e.target === novaPopup) {
    novaPopup.style.display = "none";
    document.body.style.overflow = "";
  }
});

// إغلاق عند الضغط على ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    novaPopup.style.display = "none";
    document.body.style.overflow = "";
  }
});


// End pop-up Window

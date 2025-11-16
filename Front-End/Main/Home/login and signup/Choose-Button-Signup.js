
// عناصر البوب أب
const accountChoiceOverlay = document.querySelector(".account-choice-overlay");
const openChoiceBtns = document.querySelectorAll(".open-account-choice");
const closeChoiceBtn = document.querySelector(".close-choice-signup");

// دالة لإغلاق جميع النوافذ المنبثقة
function closeAllOverlays() {
    // إغلاق جميع النوافذ المنبثقة
    document.querySelectorAll('.overlay-login, .overlay-signup, .overlay-pharmacist, .account-choice-overlay').forEach(overlay => {
        overlay.style.display = 'none';
    });
    document.body.style.overflow = "auto";
}

// فتح بوب اختيار الحساب
openChoiceBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        closeAllOverlays();
        accountChoiceOverlay.style.display = "flex";
        document.body.style.overflow = "hidden";
    });
});

/////////////////////

  closeChoiceBtn.addEventListener('click', () => {
    accountChoiceOverlay.style.display = 'none';

    // 🔄 رجع الاسكرول
   const somethingOpen = (
  document.querySelector('.overlay-signup')?.style.display === "flex" ||
  document.querySelector('.overlay-pharmacist')?.style.display === "flex"
);

if (!somethingOpen) {
  document.body.style.overflow = "auto";
}

  });

  // غلق النافذة عند الضغط على الخلفية
  accountChoiceOverlay.addEventListener('click', (e) => {
    if (e.target === accountChoiceOverlay) accountChoiceOverlay.style.display = 'none';

    // 🔄 رجع الاسكرول
    const somethingOpen = (
  document.querySelector('.overlay-signup')?.style.display === "flex" ||
  document.querySelector('.overlay-pharmacist')?.style.display === "flex"
);

if (!somethingOpen) {
  document.body.style.overflow = "auto";
}

  });


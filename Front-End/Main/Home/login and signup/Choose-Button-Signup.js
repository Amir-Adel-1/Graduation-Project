
// عناصر البوب أب
const accountChoiceOverlay = document.querySelector(".account-choice-overlay");
const openChoiceBtns = document.querySelectorAll(".open-account-choice");
const closeChoiceBtn = document.querySelector(".close-choice-signup");

// فتح بوب اختيار الحساب
openChoiceBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      accountChoiceOverlay.style.display = "flex";
        document.querySelector('.overlay-login').style.display = 'none';
        
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


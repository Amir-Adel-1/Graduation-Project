// 🎯 عناصر بوب اختيار نوع الحساب
const openChoiceButtons = document.querySelectorAll('.open-account-choice');
const choiceOverlay = document.querySelector('.account-choice-overlay');
const closeChoicePopup = document.querySelector('.close-choice-signup');

// لو عندك بوب لوجن وعايز تخفيه
const loginOverlay = document.querySelector('.overlay-login');

// ✨ تأكد من أن كل العناصر موجودة
if (choiceOverlay && closeChoicePopup && openChoiceButtons.length > 0) {

  // ✔ فتح البوب عند الضغط على أي زر من نفس الكلاس
  openChoiceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      choiceOverlay.style.display = 'flex';

      // لو فيه لوجن مفتوح اقفله
      if (loginOverlay) loginOverlay.style.display = 'none';

      // منع الاسكرول
      document.body.style.overflow = "hidden";
    });
  });

  // ✔ غلق البوب بزر X
  closeChoicePopup.addEventListener('click', () => {
    choiceOverlay.style.display = 'none';

    // رجع الاسكرول
    document.body.style.overflow = "auto";
  });

  // ✔ غلق عند الضغط على الخلفية
  choiceOverlay.addEventListener('click', (e) => {
    if (e.target === choiceOverlay) {
      choiceOverlay.style.display = 'none';
      document.body.style.overflow = "auto";
    }
  });
}



















// عناصر البوب أب
const accountChoiceOverlay = document.querySelector(".account-choice-overlay");
const openChoiceBtns = document.querySelectorAll(".open-account-choice");
const closeChoiceBtn = document.querySelector(".close-choice-signup");

// فتح بوب اختيار الحساب
openChoiceBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        accountChoiceOverlay.classList.add("active");
    });
});

// قفل البوب لما تدوس ×
closeChoiceBtn.addEventListener("click", () => {
    accountChoiceOverlay.classList.remove("active");
});

// قفل البوب لما تدوس برا
accountChoiceOverlay.addEventListener("click", (e) => {
    if (e.target === accountChoiceOverlay) {
        accountChoiceOverlay.classList.remove("active");
    }
});


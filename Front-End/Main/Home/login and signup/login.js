// عناصر صفحة تسجيل الدخول
const openLoginButtons = document.querySelectorAll('.open-login');
const loginOverlay = document.querySelector('.overlay-login');
const closeLoginPopup = document.querySelector('.close-popup-login');

const accountchoiceoverlay = document.querySelector('.account-choice-overlay');
 const overlaypharmacist = document.querySelector('.overlay-pharmacist');

const conteiner_hide2 = document.querySelector('.overlay-signup');


// تأكد إن العناصر موجودة قبل تشغيل الكود
if (loginOverlay && closeLoginPopup && openLoginButtons.length > 0) {

  // فتح النافذة عند الضغط على أي زر من نفس الكلاس
  openLoginButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      loginOverlay.style.display = 'flex';
      conteiner_hide2.style.display = 'none';
      accountchoiceoverlay.style.display = 'none';
      overlaypharmacist.style.display = 'none';

      // ✋ منع الاسكرول
      document.body.style.overflow = "hidden";
    });
  });

  // غلق النافذة بزر الإغلاق
  closeLoginPopup.addEventListener('click', () => {
    loginOverlay.style.display = 'none';

    // 🔄 رجع الاسكرول
    document.body.style.overflow = "auto";
  });

  // غلق النافذة عند الضغط على الخلفية
  loginOverlay.addEventListener('click', (e) => {
    if (e.target === loginOverlay) loginOverlay.style.display = 'none';

    // 🔄 رجع الاسكرول
      document.body.style.overflow = "auto";
  });
}

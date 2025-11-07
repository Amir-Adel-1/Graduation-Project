// عناصر صفحة إنشاء الحساب
const openSignupButtons = document.querySelectorAll('.open-signup');
const signupOverlay = document.querySelector('.overlay-signup');
const closeSignupPopup = document.querySelector('.close-popup-signup');


const conteiner_hide = document.querySelector('.overlay-login');


// تأكد إن العناصر موجودة قبل تشغيل الكود
if (signupOverlay && closeSignupPopup && openSignupButtons.length > 0) {

  // فتح النافذة عند الضغط على أي زر من نفس الكلاس
  openSignupButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      signupOverlay.style.display = 'flex';
      conteiner_hide.style.display = 'none';
    });
  });

  // غلق النافذة بزر الإغلاق
  closeSignupPopup.addEventListener('click', () => {
    signupOverlay.style.display = 'none';
  });

  // غلق النافذة عند الضغط على الخلفية
  signupOverlay.addEventListener('click', (e) => {
    if (e.target === signupOverlay) signupOverlay.style.display = 'none';
  });
}

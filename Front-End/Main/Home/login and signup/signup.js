// عناصر صفحة إنشاء الحساب
const openSignupButtons = document.querySelectorAll('.open-signup');
const signupOverlay = document.querySelector('.overlay-signup');
const closeSignupPopup = document.querySelector('.close-popup-signup');

// دالة لإغلاق جميع النوافذ المنبثقة
function closeAllOverlays() {
    // إغلاق جميع النوافذ المنبثقة
    document.querySelectorAll('.overlay-login, .overlay-signup, .overlay-pharmacist, .account-choice-overlay').forEach(overlay => {
        overlay.style.display = 'none';
    });
    document.body.style.overflow = "auto";
}

// تأكد إن العناصر موجودة قبل تشغيل الكود
if (signupOverlay && closeSignupPopup && openSignupButtons.length > 0) {
    // فتح نافذة إنشاء الحساب
    openSignupButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllOverlays();
            signupOverlay.style.display = 'flex';
            document.body.style.overflow = "hidden";
        });
    });

    // غلق النافذة بزر الإغلاق
    closeSignupPopup.addEventListener('click', () => {
        signupOverlay.style.display = 'none';
        document.body.style.overflow = "auto";
    });

    // غلق النافذة عند الضغط على الخلفية
    signupOverlay.addEventListener('click', (e) => {
        if (e.target === signupOverlay) {
            signupOverlay.style.display = 'none';
            document.body.style.overflow = "auto";
        }
    });
}

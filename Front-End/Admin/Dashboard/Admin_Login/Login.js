// عناصر صفحة تسجيل الدخول
const openLoginButtons = document.querySelectorAll('.open-login');
const loginOverlay = document.querySelector('.overlay-login');
const closeLoginPopup = document.querySelector('.close-popup-login');

// دالة لإغلاق جميع النوافذ المنبثقة
function closeAllOverlays() {
    // إغلاق جميع النوافذ المنبثقة
    document.querySelectorAll('.overlay-login, .overlay-signup, .overlay-pharmacist, .account-choice-overlay').forEach(overlay => {
        overlay.style.display = 'none';
    });
    document.body.style.overflow = "auto";
}

// تأكد إن العناصر موجودة قبل تشغيل الكود
if (loginOverlay && closeLoginPopup && openLoginButtons.length > 0) {
    // فتح نافذة تسجيل الدخول
    openLoginButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllOverlays();
            loginOverlay.style.display = 'flex';
            document.body.style.overflow = "hidden";
        });
    });

    // غلق النافذة بزر الإغلاق
    closeLoginPopup.addEventListener('click', () => {
        loginOverlay.style.display = 'none';
        document.body.style.overflow = "auto";
    });

    // غلق النافذة عند الضغط على الخلفية
    loginOverlay.addEventListener('click', (e) => {
        if (e.target === loginOverlay) {
            loginOverlay.style.display = 'none';
            document.body.style.overflow = "auto";
        }
    });
}

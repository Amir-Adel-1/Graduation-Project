// عناصر صفحة تسجيل الدخول
const loginOverlay = document.querySelector('.overlay-login');
const closeLoginPopup = document.querySelector('.close-popup-login');

// دالة لإغلاق جميع النوافذ المنبثقة
function closeAllOverlays() {
    document.querySelectorAll(
        '.overlay-login, .overlay-signup, .overlay-pharmacist, .account-choice-overlay'
    ).forEach(overlay => {
        overlay.style.display = 'none';
    });
    document.body.style.overflow = "auto";
}

// --- Event Delegation لمعالجة الضغط على .open-login ---
document.addEventListener("click", (e) => {
    const btn = e.target.closest(".open-login");
    if (btn) {
        e.preventDefault();
        closeAllOverlays();
        if (loginOverlay) {
            loginOverlay.style.display = "flex";
            document.body.style.overflow = "hidden";
        }
    }
});

// غلق النافذة بزر الإغلاق
if (closeLoginPopup && loginOverlay) {
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

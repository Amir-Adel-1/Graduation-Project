// عناصر صفحة إنشاء حساب الصيدلي
const openPharmacyButtons = document.querySelectorAll('.open-pharmacy-signup');
const pharmacyOverlay = document.querySelector('.overlay-pharmacist');
const closePharmacyPopup = document.querySelector('.close-popup-pharmacist');

// دالة لإغلاق جميع النوافذ المنبثقة
function closeAllOverlays() {
    // إغلاق جميع النوافذ المنبثقة
    document.querySelectorAll('.overlay-login, .overlay-signup, .overlay-pharmacist, .account-choice-overlay').forEach(overlay => {
        overlay.style.display = 'none';
    });
    document.body.style.overflow = "auto";
}

// تأكد إن العناصر موجودة
if (pharmacyOverlay && closePharmacyPopup && openPharmacyButtons.length > 0) {
    // فتح نافذة تسجيل الصيدلي
    openPharmacyButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllOverlays();
            pharmacyOverlay.style.display = 'flex';
            document.body.style.overflow = "hidden";
        });
    });

    // غلق النافذة بزر الإغلاق
    closePharmacyPopup.addEventListener('click', () => {
        pharmacyOverlay.style.display = 'none';
        document.body.style.overflow = "auto";
    });

    // غلق النافذة عند الضغط على الخلفية
    pharmacyOverlay.addEventListener('click', (e) => {
        if (e.target === pharmacyOverlay) {
            pharmacyOverlay.style.display = 'none';
            document.body.style.overflow = "auto";
        }
    });
}

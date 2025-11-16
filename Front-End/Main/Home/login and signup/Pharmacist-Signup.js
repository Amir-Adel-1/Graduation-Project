// عناصر صفحة إنشاء حساب الصيدلي
const openPharmacyButtons = document.querySelectorAll('.open-pharmacy-signup'); 
const pharmacyOverlay = document.querySelector('.overlay-pharmacist'); 
const closePharmacyPopup = document.querySelector('.close-popup-pharmacist');

// لو عندك صفحة لوجن وعايز تخفيها لما يفتح تسجيل الصيدلي (اختياري)
const loginOverlayPh = document.querySelector('.overlay-login');


// تأكد إن العناصر موجودة
if (pharmacyOverlay && closePharmacyPopup && openPharmacyButtons.length > 0) {

  // فتح النافذة عند الضغط على أي زر من نفس الكلاس
  openPharmacyButtons.forEach(btn => {
    btn.addEventListener('click', () => {

      pharmacyOverlay.style.display = 'flex';


      // منع الاسكرول
      document.body.style.overflow = "hidden";
    });
  });

  // غلق النافذة بزر الإغلاق
  closePharmacyPopup.addEventListener('click', () => {
    pharmacyOverlay.style.display = 'none';
  
  });

  // غلق النافذة عند الضغط على الخلفية
  pharmacyOverlay.addEventListener('click', (e) => {
    if (e.target === pharmacyOverlay) {
      pharmacyOverlay.style.display = 'none';
     
    }
  });

}

const openButtons = document.querySelectorAll('.login');
const overlay = document.getElementById('overlay');
const closePopup = document.getElementById('closePopup');

// لما المستخدم يضغط على أي زر عنده الكلاس "open-login"
openButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    overlay.style.display = 'flex';
  });
});

// زر الإغلاق
closePopup.addEventListener('click', () => {
  overlay.style.display = 'none';
});

// لما يضغط برة النافذة
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) {
    overlay.style.display = 'none';
  }
});

// ✅ التحويل من Login إلى SignUp
const switchToSignup = document.getElementById('switchToSignup');
const signupOverlay2 = document.getElementById('signupOverlay');

if (switchToSignup) {
  switchToSignup.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('overlay').style.display = 'none'; // يخفي login
    if (signupOverlay2) signupOverlay2.style.display = 'flex'; // يظهر signup
  });
}


const signupButtons = document.querySelectorAll('.signup');
const signupOverlay = document.getElementById('signupOverlay');
const closeSignup = document.getElementById('closeSignup');
const switchToLogin = document.getElementById('switchToLogin');
const loginOverlay = document.getElementById('overlay'); // login popup

// فتح نافذة التسجيل
signupButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    signupOverlay.style.display = 'flex';
  });
});

// غلق نافذة التسجيل
closeSignup.addEventListener('click', () => {
  signupOverlay.style.display = 'none';
});

// لو ضغط برة النافذة
signupOverlay.addEventListener('click', (e) => {
  if (e.target === signupOverlay) {
    signupOverlay.style.display = 'none';
  }
});

// التحويل من signup إلى login
if (switchToLogin) {
  switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupOverlay.style.display = 'none';
    if (loginOverlay) loginOverlay.style.display = 'flex';
  });
}

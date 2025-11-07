const openButtons = document.querySelectorAll('.open-register');
const overlay = document.querySelector('.overlay');
const closePopup = document.querySelector('.close-popup');

// فتح النافذة عند الضغط على أي زر من نفس الكلاس
openButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    overlay.style.display = 'flex';
  });
});

// غلق النافذة
closePopup.addEventListener('click', () => {
  overlay.style.display = 'none';
});

// غلق النافذة عند الضغط على الخلفية
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) overlay.style.display = 'none';
});


// Start Dark Mode Button
document.addEventListener("DOMContentLoaded", function() {
  const checkbox = document.getElementById("input");
  const body = document.body;
  const STORAGE_KEY = "theme";

  // عند تحميل الصفحة، نقرأ الوضع المحفوظ أو تفضيل النظام
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    body.classList.add("dark");
    checkbox.checked = true;
  } else {
    body.classList.remove("dark");
    checkbox.checked = false;
  }

  // عند تغيير السويتش
  checkbox.addEventListener("change", function() {
    if (checkbox.checked) {
      body.classList.add("dark");
      localStorage.setItem(STORAGE_KEY, "dark");
    } else {
      body.classList.remove("dark");
      localStorage.setItem(STORAGE_KEY, "light");
    }
  });
});
// End Dark Mode Button







// حركة إخفاء الناف بار أثناء التمرير
  let lastScrollTop = 0;
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // 🟢 اخفاء الناف بار عند النزول
    if (currentScroll > lastScrollTop && currentScroll > 100) {
      navbar.classList.add('hidden');
    } else {
      navbar.classList.remove('hidden');
    }

    // 🟦 تغيير لون الخلفية بعد التمرير البسيط
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  });







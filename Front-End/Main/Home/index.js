
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






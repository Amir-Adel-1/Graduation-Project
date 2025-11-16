const dashboard = document.querySelector(".dashboard");
const logo = document.querySelector(".logo");

// الحالة المبدئية: Mini
dashboard.classList.add("mini");

// عند الضغط داخل الداشبورد → تفتح
dashboard.addEventListener("click", (e) => {
  e.stopPropagation(); 
  dashboard.classList.add("active");
  dashboard.classList.remove("mini");
});

// عند الضغط خارج الداشبورد → ترجع Mini
document.addEventListener("click", (e) => {
  if (!dashboard.contains(e.target)) {
    dashboard.classList.remove("active");
    dashboard.classList.add("mini");
  }
});

// اللوجو يعمل Toggle
logo.addEventListener("click", (e) => {
  e.stopPropagation();
  dashboard.classList.toggle("active");
  dashboard.classList.toggle("mini");
});


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



// Start NavBar
let cart_clr = document.getElementById("cart_clr");
let fav_clr = document.getElementById("fav_clr");

// currentScroll

  let lastScrollTop = 0;
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // اخفاء عند السحب لتحت
    if (currentScroll > lastScrollTop && currentScroll > 100) {
      navbar.classList.add('hidden');
    } else {
      navbar.classList.remove('hidden');
    }

    // لو الصفحة نزلت شوية -> خلي الخلفية بيضاء
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
      cart_clr.style.color = "black";
      fav_clr.style.color = "black";
    } else {
      navbar.classList.remove('scrolled');
      cart_clr.style.color = "white";
      fav_clr.style.color = "white";
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  });



// Button Login and Signup
let btnsignin = document.getElementById("login");
let btnsignup = document.getElementById("signup");
btnsignin.onclick = function() {
window.location.href = "../Log In/Log In.html";
}
btnsignup.onclick = function() {
window.location.href = "../Sign Up/Sign Up.html";
}
// End NavBar










// scroll To Top Btn
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 200) {
      scrollToTopBtn.style.display = "block";
    } else {
      scrollToTopBtn.style.display = "none";
    }
  });

  scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });


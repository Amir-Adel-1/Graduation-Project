// ==========================================================
// 📌  الجزء الأول: إعداد الـ NavBar وسلوك الصفحة أثناء التمرير
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {

  // ------------------------------
  // عناصر التحكم
  // ------------------------------
  let cart_clr = document.getElementById("cart_clr");
  let fav_clr = document.getElementById("fav_clr");
  const navbar = document.getElementById("navbar");
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  let lastScrollTop = 0;

  // ------------------------------
  // عند التمرير (Scroll)
  // ------------------------------
  window.addEventListener("scroll", () => {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // 🔹 إخفاء النافبار عند السحب للأسفل
    if (currentScroll > lastScrollTop && currentScroll > 100) {
      navbar.classList.add("hidden");
    } else {
      navbar.classList.remove("hidden");
    }

    // 🔹 إظهار زر الصعود لأعلى
    if (window.scrollY > 200) {
      scrollToTopBtn.style.display = "block";
    } else {
      scrollToTopBtn.style.display = "none";
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  });

  // ------------------------------
  // عند الضغط على زر الصعود لأعلى
  // ------------------------------
  scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

});


// ==========================================================
// 📌  الجزء الثاني: قائمة المستخدم (User Menu)
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {

  const userInfo = document.querySelector(".user-info");
  const userMenu = document.querySelector(".user-menu");

  userInfo.addEventListener("click", (e) => {
    e.stopPropagation();
    userMenu.style.display = userMenu.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", () => {
    userMenu.style.display = "none";
  });

});


// ==========================================================
// 📌  الجزء الثالث: البحث + Dropdown Results
// ==========================================================

// عناصر التحكم
const searchInput = document.getElementById("searchInput");
const searchDropdown = document.getElementById("searchDropdown");

// بيانات وهمية للبحث (بدّلها باللي عندك)
const fakeData = [
  { name: "iPhone 15 Pro", price: "45,000 L.E", img: "images/iphone.jpg" },
  { name: "Samsung S24", price: "38,000 L.E", img: "images/s24.jpg" },
  { name: "Lenovo Legion", price: "52,000 L.E", img: "images/lenovo.jpg" },
];

// تشغيل البحث أثناء الكتابة
searchInput.addEventListener("input", () => {
  const text = searchInput.value.trim();

  if (text === "") {
    searchDropdown.style.display = "none";
    return;
  }

  const results = fakeData.filter((x) =>
    x.name.toLowerCase().includes(text.toLowerCase())
  );

  searchDropdown.innerHTML = "";

  if (results.length === 0) {
    searchDropdown.innerHTML = `<div class="no-results">لا توجد نتائج</div>`;
  } else {
    results.forEach((item) => {
      const div = document.createElement("div");
      div.className = "search-item";
      div.innerHTML = `
        <img src="${item.img}">
        <div class="search-info">
          <h4>${item.name}</h4>
          <span class="price">${item.price}</span>
        </div>
      `;
      searchDropdown.appendChild(div);
    });
  }

  searchDropdown.style.display = "block";
});


// ==========================================================
// 📌 تشغيل البحث عند الضغط على زر Enter
// ==========================================================

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();

    const text = searchInput.value.trim();

    if (text === "") {
      searchDropdown.style.display = "none";
      return;
    }

    const results = fakeData.filter((x) =>
      x.name.toLowerCase().includes(text.toLowerCase())
    );

    searchDropdown.innerHTML = "";

    if (results.length === 0) {
      searchDropdown.innerHTML = `<div class="no-results">لا توجد نتائج</div>`;
    } else {
      results.forEach((item) => {
        const div = document.createElement("div");
        div.className = "search-item";
        div.innerHTML = `
          <img src="${item.img}">
          <div class="search-info">
            <h4>${item.name}</h4>
            <span class="price">${item.price}</span>
          </div>
        `;
        searchDropdown.appendChild(div);
      });
    }

    searchDropdown.style.display = "block";
  }
});


// ==========================================================
// 📌 إغلاق القائمة عند الضغط خارجها
// ==========================================================
document.addEventListener("click", (e) => {
  if (!searchInput.contains(e.target)) {
    searchDropdown.style.display = "none";
  }
});

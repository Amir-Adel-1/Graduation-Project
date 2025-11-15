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






//// جزء ال سرش و ال api


const input = document.getElementById("searchInput");
const dropdown = document.getElementById("searchDropdown");

input.addEventListener("input", async () => {
    let text = input.value.trim();

    if (text.length < 2) {
        dropdown.style.display = "none";
        return;
    }

    dropdown.style.display = "block";
    dropdown.innerHTML = `<div class="loading">جاري البحث...</div>`;

    let products = await searchProducts(text);

    if (!products || products.length === 0) {
        dropdown.innerHTML = `<div class="no-results">لا توجد نتائج</div>`;
        return;
    }

    showProducts(products);
});

// ⭐ API CALL
async function searchProducts(query) {
    const apiUrl = `https://moelshafey.xyz/API/MD/search.php?name=${encodeURIComponent(query)}`;
    const proxy = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
    
    try {
        let res = await fetch(proxy);
        let json = await res.json();

        // إذا API يرجع {products: [...]} 
        return json.products || [];
    } catch (e) {
        console.error("API Error:", e);
        return [];
    }
}

// ⭐ عرض النتائج
function showProducts(products) {
    dropdown.innerHTML = "";

    products.forEach(p => {
        dropdown.innerHTML += `
            <div class="search-item">
                <img src="${p.image || 'default.jpg'}">

                <div  class="data">
                    <h4>${p.name}</h4>
                    <p class="price">${p.price || 0} جنيه</p>
                </div>

                ${
                  
                     `<button class="add-btn">إضافة</button>`
              
                }
            </div>
        `;
    });
}

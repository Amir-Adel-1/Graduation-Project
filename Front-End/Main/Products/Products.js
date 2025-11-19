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

// بيانات وهمية للبحث (تستخدم في حالة فشل الاتصال بالخادم)
const fakeData = [
  { name: "iPhone 15 Pro", price: "45,000", image: "images/iphone.jpg" },
  { name: "Samsung S24", price: "38,000", image: "images/s24.jpg" },
  { name: "Lenovo Legion", price: "52,000", image: "images/lenovo.jpg" },
];

// متغير لتخزين مؤقت للبحث
let searchTimeout;

// عرض حالة التحميل
function showLoading() {
  searchDropdown.innerHTML = '<div class="loading">جاري البحث...</div>';
  searchDropdown.style.display = 'block';
}

// عرض نتائج البحث
async function showSearchResults(text) {
  if (!text) {
    searchDropdown.style.display = 'none';
    return;
  }

  showLoading();

  try {
    // استخدام API للبحث
    const products = await searchProducts(text);
    
    // إذا لم تكن هناك نتائج من API، استخدم البيانات الوهمية
    const results = products.length > 0 ? products : fakeData.filter(item => 
      item.name.toLowerCase().includes(text.toLowerCase())
    );

    displayResults(results);
  } catch (error) {
    console.error('Search error:', error);
    // في حالة حدوث خطأ، استخدم البيانات الوهمية
    const results = fakeData.filter(item => 
      item.name.toLowerCase().includes(text.toLowerCase())
    );
    displayResults(results);
  }
}

// عرض النتائج في القائمة المنسدلة
function displayResults(products) {
  searchDropdown.innerHTML = '';
  
  if (!products || products.length === 0) {
    searchDropdown.innerHTML = '<div class="no-results">لا توجد نتائج</div>';
  } else {
    products.forEach(product => {
      const div = document.createElement('div');
      div.className = 'search-item';
      div.innerHTML = `
        <img src="${product.image || 'default.jpg'}">
        <div class="data">
          <h4>${product.name}</h4>
          <p class="price">${product.price || 'N/A'} جنيه</p>
        </div>
        <button class="add-btn">إضافة</button>
      `;
      searchDropdown.appendChild(div);
    });
  }
  
  searchDropdown.style.display = 'block';
}

// البحث عند الكتابة (مع تأخير 300 مللي ثانية)
searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  const searchText = e.target.value.trim();
  
  if (searchText.length < 2) {
    searchDropdown.style.display = 'none';
    return;
  }
  
  searchTimeout = setTimeout(() => {
    showSearchResults(searchText);
  }, 300);
});

// إظهار النتائج عند النقر على حقل البحث
searchInput.addEventListener('click', (e) => {
  e.stopPropagation();
  if (searchInput.value.trim().length >= 2) {
    showSearchResults(searchInput.value.trim());
  }
});

// إغلاق القائمة عند النقر خارجها
document.addEventListener('click', () => {
  searchDropdown.style.display = 'none';
});

// منع إغلاق القائمة عند النقر عليها
searchDropdown.addEventListener('click', (e) => {
  e.stopPropagation();
});

// ⭐ API CALL للبحث عن المنتجات
async function searchProducts(query) {
  const apiUrl = `https://moelshafey.xyz/API/MD/search.php?name=${encodeURIComponent(query)}`;
  const proxy = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
  
  try {
    const response = await fetch(proxy);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    return Array.isArray(data) ? data : (data.products || []);
  } catch (error) {
    console.error("API Error:", error);
    return []; // إرجاع مصفوفة فارغة في حالة الخطأ
  }
}

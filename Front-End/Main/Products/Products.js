// ==========================================================
// 📌  الجزء الأول: إعداد الـ NavBar وسلوك الصفحة أثناء التمرير
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById("navbar");
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  let lastScrollTop = 0;

  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > lastScrollTop && currentScroll > 100) {
      navbar?.classList.add("hidden");
    } else {
      navbar?.classList.remove("hidden");
    }

    if (scrollToTopBtn) {
      scrollToTopBtn.style.display = window.scrollY > 200 ? "block" : "none";
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  });

  scrollToTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});


// ==========================================================
// 📌  الجزء الثاني: قائمة المستخدم
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  const userInfo = document.querySelector(".user-info");
  const userMenu = document.querySelector(".user-menu");

  if (!userInfo || !userMenu) return;

  userInfo.addEventListener("click", (e) => {
    e.stopPropagation();
    userMenu.style.display = userMenu.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", () => {
    userMenu.style.display = "none";
  });
});


// ==========================================================
// 📌  الجزء الثالث: البحث + Dropdown
// ==========================================================
const searchInput = document.getElementById("searchInput");
const searchDropdown = document.getElementById("searchDropdown");

const fakeData = [
  { name: "iPhone 15 Pro", price: "45,000", image: "images/iphone.jpg" },
  { name: "Samsung S24", price: "38,000", image: "images/s24.jpg" },
  { name: "Lenovo Legion", price: "52,000", image: "images/lenovo.jpg" },
];

let searchTimeout;

function showLoading() {
  if (!searchDropdown) return;
  searchDropdown.innerHTML = '<div class="loading">جاري البحث...</div>';
  searchDropdown.style.display = "block";
}

async function showSearchResults(text) {
  if (!text || !searchDropdown) {
    if (searchDropdown) searchDropdown.style.display = "none";
    return;
  }

  showLoading();

  const products = await searchProducts(text);

  const results =
    products.length > 0
      ? products
      : fakeData.filter((item) =>
          item.name.toLowerCase().includes(text.toLowerCase())
        );

  displayResults(results);
}

function displayResults(products) {
  if (!searchDropdown) return;

  searchDropdown.innerHTML = "";

  if (!products || products.length === 0) {
    searchDropdown.innerHTML = '<div class="no-results">لا توجد نتائج</div>';
  } else {
    products.forEach((product) => {
      const div = document.createElement("div");
      div.className = "search-item";

      div.innerHTML = `
        <img src="${product.image || "default.jpg"}" alt="">
        <div class="data">
          <h4>${product.name ?? "بدون اسم"}</h4>
          <p class="price">${product.price ?? "N/A"} جنيه</p>
        </div>
        <button class="add-btn">إضافة</button>
      `;

      searchDropdown.appendChild(div);
    });
  }

  searchDropdown.style.display = "block";
}

// debounce input
searchInput?.addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  const searchText = e.target.value.trim();

  if (searchText.length < 2) {
    if (searchDropdown) searchDropdown.style.display = "none";
    return;
  }

  searchTimeout = setTimeout(() => {
    showSearchResults(searchText);
  }, 300);
});

searchInput?.addEventListener("click", (e) => {
  e.stopPropagation();
  const v = searchInput.value.trim();
  if (v.length >= 2) showSearchResults(v);
});

document.addEventListener("click", () => {
  if (searchDropdown) searchDropdown.style.display = "none";
});

searchDropdown?.addEventListener("click", (e) => {
  e.stopPropagation();
});


// ==========================================================
// ⭐ API SEARCH عبر Proxy (حل CORS)
// ==========================================================
function getProxyBase() {
  // لو على localhost شغّل proxy المحلي
  const isLocal =
    location.hostname === "localhost" || location.hostname === "127.0.0.1";

  return isLocal ? "http://localhost:3000" : ""; 
  // في الإنتاج الأفضل تخلي البروكسي على نفس الدومين وتسيبها ""
}

function normalizeProducts(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.products)) return data.products;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

async function searchProducts(query) {
  const base = getProxyBase();
  const url = `${base}/api/search?q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Search failed:", response.status, errorText);
      return [];
    }

    const data = await response.json();
    return normalizeProducts(data);
  } catch (error) {
    console.error("Search error:", error);

    // fallback لو البروكسي مش شغال
    return fakeData.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }
}


// ==========================================================
// 🔔 Notifications
// ==========================================================
let newNotifications = 5;
const badge = document.getElementById("notifBadge");

if (badge) {
  if (newNotifications > 0) {
    badge.innerText = newNotifications;
    badge.style.display = "inline-block";
  } else {
    badge.style.display = "none";
  }
}

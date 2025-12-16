/* ==========================================================
   Se7ty - Shared UI + Search + Navbar + User Menu + Notifications
   - Single DOMContentLoaded
   - Search via Proxy
   - Add from dropdown to Cart API + success/error message (ui.js)
========================================================== */

(() => {
  // =========================
  // Helpers
  // =========================
  function getProxyBase() {
    const isLocal =
      location.hostname === "localhost" || location.hostname === "127.0.0.1";
    return isLocal ? "http://localhost:3000" : "";
  }

  function normalizeProducts(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.products)) return data.products;
    if (data && Array.isArray(data.data)) return data.data;

    if (data && typeof data.contents === "string") {
      try {
        return normalizeProducts(JSON.parse(data.contents));
      } catch (_) {}
    }

    return [];
  }

  function safeText(v, fallback = "") {
    if (v === null || v === undefined) return fallback;
    const s = String(v).trim();
    return s ? s : fallback;
  }

  // ✅ FIX: price ممكن يرجع نص/عملة/حقول مختلفة
  function parsePrice(product) {
    const raw =
      product?.price ??
      product?.Price ??
      product?.discounted_price ??
      product?.finalPrice ??
      product?.amount ??
      0;

    const num = Number(String(raw).replace(/[^\d.]/g, ""));
    return Number.isFinite(num) ? num : 0;
  }

  // ✅ FIX: name/image ممكن حقول مختلفة
  function mapSearchProductToCartPayload(product) {
    const name =
      safeText(product?.name) ||
      safeText(product?.Name) ||
      safeText(product?.title) ||
      safeText(product?.product_name) ||
      safeText(product?.productName) ||
      "Unknown";

    const price = parsePrice(product);

    const imageUrl =
      product?.image ||
      product?.img ||
      product?.image_url ||
      product?.imageUrl ||
      product?.photo ||
      product?.thumbnail ||
      product?.thumb ||
      "";

    return { name, price, imageUrl };
  }

  async function searchProducts(query) {
    const base = getProxyBase();
    const url = `${base}/api/search?q=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.error("Search failed:", response.status, errorText);
        return [];
      }

      const data = await response.json();
      return normalizeProducts(data);
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  }

  // =========================
  // Main
  // =========================
  document.addEventListener("DOMContentLoaded", () => {
    // -------------------------
    // 1) NavBar + Scroll To Top
    // -------------------------
    const navbar = document.getElementById("navbar");
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");
    let lastScrollTop = 0;

    window.addEventListener("scroll", () => {
      const currentScroll =
        window.pageYOffset || document.documentElement.scrollTop;

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

    // -------------------------
    // 2) User Menu
    // -------------------------
    const userInfo = document.querySelector(".user-info");
    const userMenu = document.querySelector(".user-menu");

    userInfo?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!userMenu) return;
      userMenu.style.display = userMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", () => {
      if (userMenu) userMenu.style.display = "none";
    });

    // -------------------------
    // 3) Search + Dropdown
    // -------------------------
    const searchInput = document.getElementById("searchInput");
    const searchDropdown = document.getElementById("searchDropdown");
    let searchTimeout;

    // fallback data (اختياري)
    const fakeData = [
      { name: "iPhone 15 Pro", price: "45000", image: "images/iphone.jpg" },
      { name: "Samsung S24", price: "38000", image: "images/s24.jpg" },
      { name: "Lenovo Legion", price: "52000", image: "images/lenovo.jpg" },
    ];

    function showLoading() {
      if (!searchDropdown) return;
      searchDropdown.innerHTML = '<div class="loading">جاري البحث...</div>';
      searchDropdown.style.display = "block";
    }

    function hideDropdown() {
      if (!searchDropdown) return;
      searchDropdown.style.display = "none";
    }

    function displayResults(products) {
      if (!searchDropdown) return;

      searchDropdown.innerHTML = "";

      if (!products || products.length === 0) {
        searchDropdown.innerHTML = '<div class="no-results">لا توجد نتائج</div>';
        searchDropdown.style.display = "block";
        return;
      }

      products.forEach((product) => {
        const div = document.createElement("div");
        div.className = "search-item";

        const name =
          safeText(product?.name) ||
          safeText(product?.title) ||
          safeText(product?.product_name) ||
          "بدون اسم";

        const priceNum = parsePrice(product);
        const priceText = priceNum ? `${priceNum} جنيه` : `${safeText(product?.price, "N/A")} جنيه`;
        const image = product?.image || product?.thumbnail || "default.jpg";

        div.innerHTML = `
          <img src="${image}" alt="">
          <div class="data">
            <h4>${name}</h4>
            <p class="price">${priceText}</p>
          </div>
          <button class="add-btn" type="button">إضافة</button>
        `;

        // ✅ زر إضافة للكارت
        const addBtn = div.querySelector(".add-btn");
        addBtn?.addEventListener("click", async (e) => {
          e.stopPropagation();

          if (!window.cartApi) {
            window.showErrorMessage?.("cartApi.js مش متحمل");
            return;
          }

          try {
            const payload = mapSearchProductToCartPayload(product);

            if (!payload.name || payload.name === "Unknown") {
              console.warn("Search product missing name:", product);
            }

            await window.cartApi.addItem(payload, 1);

            // تحديث العداد
            if (window.refreshCartBadge) await window.refreshCartBadge();

            // رسالة نجاح
            window.showSuccessMessage?.("تم إضافة المنتج للكارت بنجاح");

            hideDropdown();
          } catch (err) {
            console.error("Add from search error:", err);
            window.showErrorMessage?.(err?.message || "حصل خطأ أثناء الإضافة للكارت");
          }
        });

        searchDropdown.appendChild(div);
      });

      searchDropdown.style.display = "block";
    }

    async function showSearchResults(text) {
      if (!text || !searchDropdown) {
        hideDropdown();
        return;
      }

      showLoading();

      const apiProducts = await searchProducts(text);

      const results =
        apiProducts.length > 0
          ? apiProducts
          : fakeData.filter((item) =>
              (item.name || "").toLowerCase().includes(text.toLowerCase())
            );

      displayResults(results);
    }

    // debounce
    searchInput?.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      const value = e.target.value.trim();

      if (value.length < 2) {
        hideDropdown();
        return;
      }

      searchTimeout = setTimeout(() => {
        showSearchResults(value);
      }, 300);
    });

    searchInput?.addEventListener("click", (e) => {
      e.stopPropagation();
      const v = searchInput.value.trim();
      if (v.length >= 2) showSearchResults(v);
    });

    document.addEventListener("click", () => hideDropdown());

    searchDropdown?.addEventListener("click", (e) => e.stopPropagation());


    // -------------------------
    // 4) Refresh cart badge on load
    // -------------------------
    if (window.refreshCartBadge) window.refreshCartBadge();
  });
})();

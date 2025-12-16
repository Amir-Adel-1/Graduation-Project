// ==========================================================
// Se7ty - Home Offers Cards (4 products) + Popup + Add To Cart
// Depends on: cartApi.js + ui.js
// ==========================================================

// Search terms
const searchTerms = ["شامبو", "زيت", "البشرة"];

// Decode Unicode escape
const decodeText = (str) => {
  if (!str) return "";
  return str.replace(/\\u([\dA-F]{4})/gi, (match, grp) =>
    String.fromCharCode(parseInt(grp, 16))
  );
};

// ==============================
// ✅ Image filter
// ==============================
function isValidImageUrl(url) {
  if (!url || typeof url !== "string") return false;

  const u = url.toLowerCase().trim();
  if (u.endsWith("/")) return false;
  if (u.includes("/uploads") && !u.match(/\.(jpg|jpeg|png|webp|gif)$/i)) return false;
  if (!u.match(/\.(jpg|jpeg|png|webp|gif)$/i)) return false;

  return true;
}

// ==============================
// Proxy helpers
// ==============================
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

function pickDetailsText(details) {
  if (!details) return null;
  if (typeof details === "string") return details.replace(/&nbsp;/g, " ");

  const direct =
    details.msg ||
    details.message ||
    details.description ||
    details.info ||
    details.details ||
    details.content ||
    details.desc ||
    details.text;

  if (direct) return String(direct).replace(/&nbsp;/g, " ");

  const nested =
    details.data?.msg ||
    details.data?.description ||
    details.data?.info ||
    details.data?.content ||
    details.product?.description ||
    details.product?.info ||
    details.product?.content ||
    details.result?.description ||
    details.result?.info;

  return nested ? String(nested).replace(/&nbsp;/g, " ") : null;
}

// ==============================
// API Calls
// ==============================
async function fetchProducts(searchTerm) {
  try {
    const normalizedTerm = (searchTerm || "").toString().normalize("NFC");
    const base = getProxyBase();
    const url = `${base}/api/search?q=${encodeURIComponent(normalizedTerm)}`;

    const response = await fetch(url, { headers: { Accept: "application/json" } });

    if (!response.ok) {
      const err = await response.text().catch(() => "");
      console.error("Search failed:", err);
      return [];
    }

    const data = await response.json();
    const products = normalizeProducts(data);

    return products.filter((p) => isValidImageUrl(p.image));
  } catch (error) {
    console.error(`Error fetching products for ${searchTerm}:`, error);
    return [];
  }
}

async function getProductDetails(productId) {
  const base = getProxyBase();
  const url = `${base}/api/info?id=${encodeURIComponent(productId)}`;

  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error(`Info failed (${response.status}):`, text);
      return null;
    }

    const text = await response.text().catch(() => "");
    if (!text || text.trim() === "null") return null;

    try {
      return JSON.parse(text);
    } catch (_) {
      return { msg: text };
    }
  } catch (error) {
    console.error(`Error fetching details for product ${productId}:`, error);
    return null;
  }
}

// ==============================
// HTML sanitize
// ==============================
function decodeAndSanitize(html) {
  if (!html) return "";

  const textarea = document.createElement("textarea");
  textarea.innerHTML = html;
  let decoded = textarea.value;

  decoded = decodeText(decoded);

  const allowedTags = ["p","br","b","strong","i","em","u","ul","ol","li","div","span"];
  const doc = new DOMParser().parseFromString(decoded, "text/html");
  const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);

  const nodesToRemove = [];
  let node;

  while ((node = walker.nextNode())) {
    if (!allowedTags.includes(node.tagName.toLowerCase())) {
      nodesToRemove.push(node);
      continue;
    }
    for (let i = node.attributes.length - 1; i >= 0; i--) {
      const attr = node.attributes[i];
      if (!["class", "style"].includes(attr.name.toLowerCase())) {
        node.removeAttribute(attr.name);
      }
    }
  }

  nodesToRemove.forEach((n) => n.parentNode?.removeChild(n));
  return doc.body.innerHTML || "لا توجد تفاصيل متاحة";
}

// ==============================
// Popup
// ==============================
function createPopup(product, detailsHtmlOrText) {
  const popup = document.createElement("div");
  popup.className = "nova-popup";

  const name = decodeText(product.name) || "اسم المنتج غير متوفر";

  popup.innerHTML = `
    <div class="nova-content">
      <span class="nova-close-btn">&times;</span>
      <h3>${name}</h3>
      <div class="popup-details">${detailsHtmlOrText || "جاري تحميل التفاصيل..."}</div>
    </div>
  `;

  document.body.appendChild(popup);
  return popup;
}

// ==============================
// Cart helpers
// ==============================
function parsePrice(product) {
  const n = Number(product?.price);
  return Number.isFinite(n) ? n : 0;
}

function productToCartPayload(product) {
  const name = decodeText(product?.name) || "Unknown";

  // السعر بعد خصم 10% لو موجود
  let price = parsePrice(product);
  if (price > 0) price = +(price - price * 0.1).toFixed(2);

  const imageUrl =
    product?.image ||
    product?.img ||
    product?.image_url ||
    product?.imageUrl ||
    product?.photo ||
    product?.thumbnail ||
    "";

  return { name, price, imageUrl };
}

// ==============================
// Card UI
// ==============================
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "card";

  const name = decodeText(product.name) || "اسم المنتج غير متوفر";

  let priceDisplay = "السعر غير متوفر";
  let originalPrice = "";

  if (product.price) {
    const price = parseFloat(product.price);
    if (!isNaN(price)) {
      const discountedPrice = price - price * 0.1;
      originalPrice = `
        <span class="original-price">${price.toFixed(2)} ج.م</span>
        <span class="discount-badge">خصم 10%</span>
      `;
      priceDisplay = `${discountedPrice.toFixed(2)} ج.م`;
    } else {
      priceDisplay = `${product.price} ج.م`;
    }
  }

  const image = product.image;

  card.innerHTML = `
    <div class="card-content">
      <div class="card-image">
        <img src="${image}" alt="${name}" />
        <div class="overlay">
          <i class="fa-solid fa-eye"></i>
        </div>
      </div>

      <div class="card-text">
        <p class="card__title">${name}</p>
      </div>

      <div class="card-footer">
        <div class="price-container">
          ${originalPrice}
          <div class="card__price">${priceDisplay}</div>
        </div>

        <div class="buttons">
          <button class="card-button add-to-cart" type="button" data-product-id="${product.id}">
            <i class="fa-solid fa-cart-shopping"></i>
          </button>

          <button class="card-button add-to-favorites" type="button" data-product-id="${product.id}">
            <i class="fa-solid fa-heart"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  // Eye -> details popup
  const overlay = card.querySelector(".overlay");
  overlay.addEventListener("click", async () => {
    const popup = createPopup(product, "جاري تحميل التفاصيل...");
    popup.style.display = "flex";
    document.body.style.overflow = "hidden";

    try {
      const details = await getProductDetails(product.id);
      const detailsText = pickDetailsText(details) || "لا توجد تفاصيل متاحة";
      const detailsElement = popup.querySelector(".popup-details");
      if (detailsElement) detailsElement.innerHTML = decodeAndSanitize(detailsText);
    } catch (error) {
      console.error("Error fetching product details:", error);
      const detailsElement = popup.querySelector(".popup-details");
      if (detailsElement) detailsElement.textContent = "حدث خطأ في تحميل التفاصيل";
    }
  });

  return card;
}

// ==============================
// Render products
// ==============================
async function displayAllProducts() {
  const container = document.querySelector(".container-cards");
  if (!container) return;

  container.innerHTML = '<div class="loading">جاري تحميل المنتجات...</div>';

  const uniqueProducts = new Map();
  const maxProducts = 4;

  try {
    for (const term of searchTerms) {
      if (uniqueProducts.size >= maxProducts) break;

      const products = await fetchProducts(term);

      for (const product of products) {
        const id = String(product.id || "");
        if (id && !uniqueProducts.has(id)) {
          uniqueProducts.set(id, product);
          if (uniqueProducts.size >= maxProducts) break;
        }
      }
    }

    container.innerHTML = "";

    let count = 0;
    for (const product of uniqueProducts.values()) {
      if (count >= maxProducts) break;
      container.appendChild(createProductCard(product));
      count++;
    }

    if (uniqueProducts.size === 0) {
      container.innerHTML = '<div class="no-products">لا توجد منتجات متاحة حالياً</div>';
    }

    bindGlobalEvents(uniqueProducts);
  } catch (error) {
    console.error("Error displaying products:", error);
    container.innerHTML =
      '<div class="error">حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقاً.</div>';
  }
}

// ==============================
// Global events (once)
// ==============================
let globalEventsBound = false;

function bindGlobalEvents(productsMap) {
  window.__se7tyProductsMap = productsMap;

  if (globalEventsBound) return;
  globalEventsBound = true;

  document.addEventListener("click", async (e) => {
    // Close popup
    if (e.target.classList.contains("nova-close-btn")) {
      const popup = e.target.closest(".nova-popup");
      popup?.remove();
      document.body.style.overflow = "";
      return;
    }
    if (e.target.classList.contains("nova-popup")) {
      e.target.remove();
      document.body.style.overflow = "";
      return;
    }

    // Add to cart
    const addBtn = e.target.closest(".add-to-cart");
    if (addBtn) {
      const id = String(addBtn.dataset.productId || "");
      const product = window.__se7tyProductsMap?.get(id);

      if (!product) {
        window.showErrorMessage?.("المنتج غير موجود");
        return;
      }

      if (!window.cartApi) {
        window.showErrorMessage?.("cartApi.js مش متحمّل");
        return;
      }

      try {
        const payload = productToCartPayload(product);
        await window.cartApi.addItem(payload, 1);

        await window.refreshCartBadge?.();

        // ✅ الرسائل حسب الاتفاق
        window.showSuccessMessage?.("تم إضافة المنتج للكارت بنجاح");
      } catch (err) {
        console.error("ADD TO CART ERROR:", err);
        window.showErrorMessage?.(err?.message || "حصل خطأ أثناء الإضافة للكارت");
      }

      return;
    }

    // Favorites placeholder
    const favBtn = e.target.closest(".add-to-favorites");
    if (favBtn) {
      console.log("Added to favorites:", favBtn.dataset.productId);
      return;
    }
  });

  // Close popup on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const popup = document.querySelector(".nova-popup");
      popup?.remove();
      document.body.style.overflow = "";
    }
  });
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  displayAllProducts();
  window.refreshCartBadge?.();
});

// Search terms from the image
const searchTerms = ["شامبو", "زيت", "البشرة"];

// Function to decode Unicode escape sequences
const decodeText = (str) => {
  if (!str) return "";
  return str.replace(/\\u([\dA-F]{4})/gi, (match, grp) =>
    String.fromCharCode(parseInt(grp, 16))
  );
};

// ==============================
// ✅ Image filter (remove uploads/ and non-images)
// ==============================
function isValidImageUrl(url) {
  if (!url || typeof url !== "string") return false;

  const u = url.toLowerCase().trim();

  // ❌ لو اللينك منتهي بـ /
  if (u.endsWith("/")) return false;

  // ❌ لو فيه uploads ومفيش امتداد صورة
  if (u.includes("/uploads") && !u.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
    return false;
  }

  // ❌ لازم يكون صورة فعلًا
  if (!u.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
    return false;
  }

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

  let direct =
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
// ✅ Fetch products via NEW proxy
// ==============================
async function fetchProducts(searchTerm) {
  const base = getProxyBase();
  const url = `${base}/api/search?q=${encodeURIComponent(searchTerm)}`;

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Search failed:", error);
      return [];
    }

    const data = await response.json();
    const products = normalizeProducts(data);

    // ✅ فلترة المنتجات اللي صورها uploads/ أو بدون امتداد صورة
    return products.filter((p) => isValidImageUrl(p.image));
  } catch (error) {
    console.error(`Error fetching products for ${searchTerm}:`, error);
    return [];
  }
}

// ==============================
// ✅ Product details via NEW proxy
// ==============================
async function getProductDetails(productId) {
  const base = getProxyBase();
  const url = `${base}/api/info?id=${encodeURIComponent(productId)}`;

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Info failed (${response.status}):`, text);
      return null;
    }

    const text = await response.text();
    if (!text) return null;
    if (text.trim() === "null") return null;

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

// Function to safely decode and sanitize HTML
function decodeAndSanitize(html) {
  if (!html) return "";

  const textarea = document.createElement("textarea");
  textarea.innerHTML = html;
  let decoded = textarea.value;

  decoded = decodeText(decoded);

  const allowedTags = [
    "p",
    "br",
    "b",
    "strong",
    "i",
    "em",
    "u",
    "ul",
    "ol",
    "li",
    "div",
    "span",
  ];
  const doc = new DOMParser().parseFromString(decoded, "text/html");

  const walker = document.createTreeWalker(
    doc.body,
    NodeFilter.SHOW_ELEMENT,
    null,
    false
  );

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

// Function to create a popup element
function createPopup(product, detailsHtmlOrText) {
  const popup = document.createElement("div");
  popup.className = "nova-popup";
  popup.id = `popup-${product.id}`;

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

// Function to create a product card
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "card";

  const name = decodeText(product.name) || "اسم المنتج غير متوفر";

  // Calculate discounted price (10% off)
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

  // ✅ الصورة هنا سليمة لأننا فلترنا قبل العرض
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
          <button
            class="card-button add-to-cart open-login"
            data-product-id="${product.id}"
            data-original-price="${product.price || ""}"
            data-discounted-price="${priceDisplay.replace(" ج.م", "")}"
          >
            <i class="fa-solid fa-cart-shopping"></i>
          </button>
          <button class="card-button add-to-favorites open-login" data-product-id="${product.id}">
            <i class="fa-solid fa-heart"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  // Add click handler for the eye icon
  const overlay = card.querySelector(".overlay");
  overlay.addEventListener("click", async () => {
    const popup = createPopup(product, "جاري تحميل التفاصيل...");
    popup.style.display = "flex";
    document.body.style.overflow = "hidden";

    try {
      const details = await getProductDetails(product.id);
      const detailsText = pickDetailsText(details) || "لا توجد تفاصيل متاحة";

      const detailsElement = popup.querySelector(".popup-details");
      if (detailsElement) {
        detailsElement.innerHTML = decodeAndSanitize(detailsText);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      const detailsElement = popup.querySelector(".popup-details");
      if (detailsElement) detailsElement.textContent = "حدث خطأ في تحميل التفاصيل";
    }
  });

  return card;
}

// Function to display all products
async function displayAllProducts() {
  const container = document.querySelector(".container-cards");
  if (!container) {
    console.error("Container element not found");
    return;
  }

  container.innerHTML = '<div class="loading">جاري تحميل المنتجات...</div>';

  const uniqueProducts = new Map();
  const maxProducts = 4;

  try {
    for (const term of searchTerms) {
      if (uniqueProducts.size >= maxProducts) break;

      const products = await fetchProducts(term);

      for (const product of products) {
        if (product.id && !uniqueProducts.has(product.id)) {
          uniqueProducts.set(product.id, product);
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
      container.innerHTML =
        '<div class="no-products">لا توجد منتجات متاحة حالياً</div>';
    }

    addEventListeners();
  } catch (error) {
    console.error("Error displaying products:", error);
    container.innerHTML =
      '<div class="error">حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقاً.</div>';
  }
}

// ===== flag علشان ما نكررش listeners بتوع البوب-اب =====
let popupListenersAdded = false;

function addEventListeners() {
  if (popupListenersAdded) return;
  popupListenersAdded = true;

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("nova-close-btn")) {
      const popup = e.target.closest(".nova-popup");
      if (popup) {
        popup.remove();
        document.body.style.overflow = "";
      }
    } else if (e.target.classList.contains("nova-popup")) {
      e.target.remove();
      document.body.style.overflow = "";
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const popup = document.querySelector(".nova-popup");
      if (popup) {
        popup.remove();
        document.body.style.overflow = "";
      }
    }
  });
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  displayAllProducts();
});

document.addEventListener("click", (e) => {
  const card = e.target.closest(".card-image");
  if (card) {
    card.classList.toggle("flipped");
  }
});

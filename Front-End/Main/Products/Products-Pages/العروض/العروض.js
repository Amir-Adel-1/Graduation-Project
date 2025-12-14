// Search terms
const searchTerms = [
  "شامبو",
  "زيت",
  "البشرة",
];

// Function to decode Unicode escape sequences
const decodeText = (str) => {
  if (!str) return "";
  return str.replace(/\\u([\dA-F]{4})/gi, (match, grp) =>
    String.fromCharCode(parseInt(grp, 16))
  );
};

// ==============================
// Proxy helpers
// ==============================
function getProxyBase() {
  const isLocal =
    location.hostname === "localhost" || location.hostname === "127.0.0.1";
  return isLocal ? "http://localhost:3000" : "";
}

// Normalize search response
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

// Extract details message from info response
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

// Function to check if an image URL is valid
async function isValidImageUrl(url) {
  if (!url || typeof url !== "string") return false;

  // ends with / or not image extension
  if (url.endsWith("/") || !/\.(jpg|jpeg|png|webp|gif)$/i.test(url)) {
    return false;
  }

  // known invalid pattern (optional rule from your code)
  if (url.includes("/uploads/") && !url.match(/\/\d+\.(jpg|jpeg|png|webp|gif)$/i)) {
    return false;
  }

  return true;
}

// ==============================
// API Calls via Proxy
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
    console.log("Search results:", data);

    if (!products || products.length === 0) {
      console.warn(`No products found for search term: ${searchTerm}`);
      return [];
    }

    // Filter out invalid images (keep your logic)
    const validProducts = [];
    for (const product of products) {
      if (await isValidImageUrl(product.image)) {
        validProducts.push(product);
      } else {
        console.log("Filtered out product with invalid image URL:", product.image);
      }
    }

    return validProducts;
  } catch (error) {
    console.error(`Error fetching products for ${searchTerm}:`, error);
    return [];
  }
}

// Get product details by ID (NEW API via proxy)
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
      // لو رجع نص مش JSON
      return { msg: text };
    }
  } catch (error) {
    console.error(`Error fetching details for product ${productId}:`, error);
    return null;
  }
}

// ==============================
// HTML sanitize + popup
// ==============================
function decodeAndSanitize(html) {
  if (!html) return "";

  const textarea = document.createElement("textarea");
  textarea.innerHTML = html;
  let decoded = textarea.value;

  decoded = decodeText(decoded);

  const allowedTags = [
    "p", "br", "b", "strong", "i", "em", "u",
    "ul", "ol", "li", "div", "span"
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

// ==============================
// Card UI
// ==============================
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
      const discount = price * 0.1;
      const discountedPrice = price - discount;
      originalPrice = `
        <span class="original-price">${price.toFixed(2)} ج.م</span>
        <span class="discount-badge">خصم 10%</span>
      `;
      priceDisplay = `${discountedPrice.toFixed(2)} ج.م`;
    } else {
      priceDisplay = `${product.price} ج.م`;
    }
  }

  // Use placeholder if no valid image URL
  const image =
    product.image &&
    product.image.endsWith &&
    !product.image.endsWith("/") &&
    /\.(jpg|jpeg|png|webp|gif)$/i.test(product.image)
      ? product.image
      : "placeholder-image.jpg";

  card.innerHTML = `
    <div class="card-content">
      <div class="card-image">
        <img src="${image}" alt="${name}"
             onerror="this.onerror=null; this.src='placeholder-image.jpg';" />
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
          <button class="card-button add-to-cart"
                  data-product-id="${product.id}"
                  data-original-price="${product.price || ""}"
                  data-discounted-price="${priceDisplay.replace(" ج.م", "")}">
            <i class="fa-solid fa-cart-shopping"></i>
          </button>
          <button class="card-button add-to-favorites" data-product-id="${product.id}">
            <i class="fa-solid fa-heart"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  // Eye click -> popup + load details
  const overlay = card.querySelector(".overlay");
  overlay.addEventListener("click", async () => {
    const popup = createPopup(product, "جاري تحميل التفاصيل...");
    popup.style.display = "flex";
    document.body.style.overflow = "hidden";

    const detailsElement = popup.querySelector(".popup-details");

    try {
      console.log("INFO REQUEST ID:", product.id);

      const details = await getProductDetails(product.id);
      console.log("INFO RESPONSE:", details);

      if (details == null) {
        detailsElement.textContent = "لا توجد تفاصيل متاحة لهذا المنتج";
        return;
      }

      const detailsText = pickDetailsText(details);

      if (detailsText) {
        detailsElement.innerHTML = decodeAndSanitize(detailsText);
      } else {
        detailsElement.textContent = "لا توجد تفاصيل متاحة لهذا المنتج";
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      if (detailsElement) detailsElement.textContent = "حدث خطأ في تحميل التفاصيل";
    }
  });

  return card;
}

// ==============================
// Display products
// ==============================
async function displayAllProducts() {
  const container = document.querySelector(".container-cards");
  if (!container) {
    console.error("Container element not found");
    return;
  }

  container.innerHTML = '<div class="loading">جاري تحميل المنتجات...</div>';

  const uniqueProducts = new Map();

  try {
    for (const term of searchTerms) {
      const products = await fetchProducts(term);

      products.forEach((product) => {
        if (product.id && !uniqueProducts.has(product.id)) {
          uniqueProducts.set(product.id, product);
        }
      });

      if (uniqueProducts.size >= 20) break;
    }

    container.innerHTML = "";

    for (const product of uniqueProducts.values()) {
      const card = createProductCard(product);
      container.appendChild(card);
    }

    if (uniqueProducts.size === 0) {
      container.innerHTML = '<div class="no-products">لا توجد منتجات متاحة حالياً</div>';
    }

    addEventListeners();
  } catch (error) {
    console.error("Error displaying products:", error);
    container.innerHTML =
      '<div class="error">حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقاً.</div>';
  }
}

// ==============================
// Events
// ==============================
function addEventListeners() {
  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", (e) => {
      const productId = e.currentTarget.dataset.productId;
      console.log("Added to cart:", productId);
    });
  });

  document.querySelectorAll(".add-to-favorites").forEach((button) => {
    button.addEventListener("click", (e) => {
      const productId = e.currentTarget.dataset.productId;
      console.log("Added to favorites:", productId);
    });
  });

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

// Flip image
document.addEventListener("click", (e) => {
  const card = e.target.closest(".card-image");
  if (card) card.classList.toggle("flipped");
});

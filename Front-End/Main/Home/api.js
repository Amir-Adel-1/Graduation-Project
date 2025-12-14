// Search terms from the image
const searchTerms = [
  'شامبو',
  'زيت',
  'البشرة',
];

// Function to decode Unicode escape sequences
const decodeText = (str) => {
  if (!str) return '';
  return str.replace(/\\u([\dA-F]{4})/gi, (match, grp) =>
    String.fromCharCode(parseInt(grp, 16))
  );
};

// Function to check if an image URL is valid
async function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;

  // Check if URL is just a directory (ends with /) or doesn't have an image extension
  if (url.endsWith('/') || !/\.(jpg|jpeg|png|webp|gif)$/i.test(url)) {
    return false;
  }

  // Check for known invalid patterns
  if (url.includes('/uploads/') && !url.match(/\/\d+\.(jpg|jpeg|png|webp|gif)$/i)) {
    return false;
  }

  return true;
}

// Function to fetch products from the API
async function fetchProducts(searchTerm) {
  try {
    // First, normalize the search term
    const normalizedTerm = searchTerm.normalize('NFC');

    // Encode the search term for URL
    const encodedTerm = encodeURIComponent(normalizedTerm);

    // Create the API URL with the encoded term
    const apiUrl = `https://moelshafey.xyz/API/MD/search.php?name=${encodedTerm}`;

    // Create a direct request without CORS proxy first
    let response;
    try {
      // Try direct request first
      response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      });
    } catch (error) {
      console.log('Direct request failed, trying with CORS proxy...');
      // If direct request fails, try with CORS proxy
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
      response = await fetch(proxyUrl, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let text = await response.text();
    let data;

    // Try to parse the JSON response
    try {
      data = JSON.parse(text);
      // Handle nested JSON if needed
      if (data && data.contents) {
        try {
          data = JSON.parse(data.contents);
        } catch (e) {
          console.log('Contents is not JSON, using as is');
        }
      }
    } catch (e) {
      console.warn("Parsing JSON failed, trying fallback:", e);
      // Try to extract JSON from text if response is not pure JSON
      const match = text.match(/\{.*\}/s);
      if (match) {
        try {
          data = JSON.parse(match[0]);
        } catch (parseError) {
          console.error('Failed to parse JSON from response:', parseError);
          return [];
        }
      } else {
        console.error('No valid JSON found in response');
        return [];
      }
    }

    if (!data || !Array.isArray(data.products) || data.products.length === 0) {
      console.warn(`No products found for search term: ${searchTerm}`);
      return [];
    }

    // Filter out products with invalid image URLs
    const validProducts = [];
    for (const product of data.products) {
      if (await isValidImageUrl(product.image)) {
        validProducts.push(product);
      } else {
        console.log('Filtered out product with invalid image URL:', product.image);
      }
    }

    return validProducts;
  } catch (error) {
    console.error(`Error fetching products for ${searchTerm}:`, error);
    return [];
  }
}

// Function to get product details by ID
async function getProductDetails(productId) {
  const apiUrl = `https://moelshafey.xyz/API/MD/info.php?id=${productId}`;
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;

  try {
    const response = await fetch(proxyUrl);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching details for product ${productId}:`, error);
    return null;
  }
}

// Function to safely decode and sanitize HTML
function decodeAndSanitize(html) {
  if (!html) return '';

  // First decode any HTML entities
  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;
  let decoded = textarea.value;

  // Decode any Unicode escape sequences
  decoded = decodeText(decoded);

  // Basic HTML sanitization (allow common safe tags)
  const allowedTags = ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 'ul', 'ol', 'li', 'div', 'span'];
  const doc = new DOMParser().parseFromString(decoded, 'text/html');

  // Remove any potentially dangerous tags and attributes
  const walker = document.createTreeWalker(
    doc.body,
    NodeFilter.SHOW_ELEMENT,
    null,
    false
  );

  const nodesToRemove = [];
  let node;

  while (node = walker.nextNode()) {
    // Remove disallowed tags
    if (!allowedTags.includes(node.tagName.toLowerCase())) {
      nodesToRemove.push(node);
      continue;
    }

    // Remove all attributes except for class and style
    for (let i = node.attributes.length - 1; i >= 0; i--) {
      const attr = node.attributes[i];
      if (!['class', 'style'].includes(attr.name.toLowerCase())) {
        node.removeAttribute(attr.name);
      }
    }
  }

  // Remove disallowed nodes
  nodesToRemove.forEach(node => node.parentNode?.removeChild(node));

  return doc.body.innerHTML || 'لا توجد تفاصيل متاحة';
}

// Function to create a popup element
function createPopup(product, details) {
  const popup = document.createElement('div');
  popup.className = 'nova-popup';
  popup.id = `popup-${product.id}`;

  const name = decodeText(product.name) || 'اسم المنتج غير متوفر';
  const detailsText = details ? (details.msg || details.description || details.info || 'لا توجد تفاصيل متاحة') : 'جاري تحميل التفاصيل...';

  popup.innerHTML = `
    <div class="nova-content">
      <span class="nova-close-btn">&times;</span>
      <h3>${name}</h3>
      <div class="popup-details">${details ? decodeAndSanitize(detailsText) : 'جاري تحميل التفاصيل...'}</div>
    </div>
  `;

  document.body.appendChild(popup);
  return popup;
}

// Function to create a product card
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'card';

  const name = decodeText(product.name) || 'اسم المنتج غير متوفر';

  // Calculate discounted price (10% off)
  let priceDisplay = 'السعر غير متوفر';
  let originalPrice = '';

  if (product.price) {
    const price = parseFloat(product.price);
    if (!isNaN(price)) {
      const discount = price * 0.1; // 10% discount
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

  // Use a placeholder if no valid image URL
  const image = (product.image &&
    product.image.endsWith &&
    !product.image.endsWith('/') &&
    /\.(jpg|jpeg|png|webp|gif)$/i.test(product.image))
    ? product.image
    : 'placeholder-image.jpg';

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
          <button class="card-button add-to-cart open-login" data-product-id="${product.id}" data-original-price="${product.price || ''}" data-discounted-price="${priceDisplay.replace(' ج.م', '')}">
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
  const overlay = card.querySelector('.overlay');
  overlay.addEventListener('click', async () => {
    // Show loading state
    const popup = createPopup(product, null);
    popup.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    try {
      // Load product details
      const details = await getProductDetails(product.id);
      const detailsText = details?.msg || details?.description || details?.info || 'لا توجد تفاصيل متاحة';
      const detailsElement = popup.querySelector('.popup-details');
      if (detailsElement) {
        detailsElement.innerHTML = decodeAndSanitize(detailsText);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      const detailsElement = popup.querySelector('.popup-details');
      if (detailsElement) {
        detailsElement.textContent = 'حدث خطأ في تحميل التفاصيل';
      }
    }
  });

  return card;
}

// Function to display all products
async function displayAllProducts() {
  const container = document.querySelector('.container-cards');
  if (!container) {
    console.error('Container element not found');
    return;
  }

  // Show loading state
  container.innerHTML = '<div class="loading">جاري تحميل المنتجات...</div>';

  // Use Map to store unique products by ID
  const uniqueProducts = new Map();
  const maxProducts = 4; // Limit to 4 products

  try {
    // Fetch products for each search term until we have enough
    for (const term of searchTerms) {
      if (uniqueProducts.size >= maxProducts) break;

      const products = await fetchProducts(term);

      // Add products to the map using their ID as the key to avoid duplicates
      for (const product of products) {
        if (product.id && !uniqueProducts.has(product.id)) {
          uniqueProducts.set(product.id, product);
          if (uniqueProducts.size >= maxProducts) break;
        }
      }
    }

    // Clear loading state
    container.innerHTML = '';

    // Add up to 4 products to the container
    let count = 0;
    for (const product of uniqueProducts.values()) {
      if (count >= maxProducts) break;
      const card = createProductCard(product);
      container.appendChild(card);
      count++;
    }

    // If no products found
    if (uniqueProducts.size === 0) {
      container.innerHTML = '<div class="no-products">لا توجد منتجات متاحة حالياً</div>';
    }

    // Add event listeners to the new buttons
    addEventListeners();

  } catch (error) {
    console.error('Error displaying products:', error);
    container.innerHTML = '<div class="error">حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقاً.</div>';
  }
}

// ===== إضافة flag علشان ما نكررش listeners بتوع البوب-اب =====
let popupListenersAdded = false;

// Function to add event listeners
function addEventListeners() {
  if (popupListenersAdded) return;
  popupListenersAdded = true;

  // Close popup when clicking the close button or outside
  document.addEventListener('click', (e) => {
    // Close when clicking the close button
    if (e.target.classList.contains('nova-close-btn')) {
      const popup = e.target.closest('.nova-popup');
      if (popup) {
        popup.remove();
        document.body.style.overflow = "";
      }
    }
    // Close when clicking outside the popup content
    else if (e.target.classList.contains('nova-popup')) {
      e.target.remove();
      document.body.style.overflow = "";
    }
  });

  // Close popup with ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
      const popup = document.querySelector('.nova-popup');
      if (popup) {
        popup.remove();
        document.body.style.overflow = "";
      }
    }
  });
}

// Initialize the page when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  displayAllProducts();
});

document.addEventListener('click', (e) => {
  const card = e.target.closest('.card-image');
  if (card) {
    card.classList.toggle('flipped');
  }
});

// Search terms for mother and baby care products
const searchTerms = [
  'حفاضات',         // Diapers
  'رضاعة',          // Baby bottles
  'استحمام اطفال',   // Baby bath
  'غسول اطفال',     // Baby wash
  'كريم حفاضات',    // Diaper cream
  'حليب اطفال',     // Baby formula
  'فيتامينات اطفال', // Baby vitamins
  'العناية بالحامل', // Pregnancy care
  'فوط صحية',       // Sanitary pads
  'حمالات صدر رضاعة' // Nursing bras
];


// Function to decode Unicode escape sequences
const decodeText = (str) => {
  if (!str) return '';
  return str.replace(/\\u([\dA-F]{4})/gi, (match, grp) =>
    String.fromCharCode(parseInt(grp, 16))
  );
};

// Function to fetch products from the API
async function fetchProducts(searchTerm) {
  const apiUrl = `https://moelshafey.xyz/API/MD/search.php?name=${encodeURIComponent(searchTerm)}`;
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
  
  try {
    const response = await fetch(proxyUrl);
    let text = await response.text();
    
    // Try to parse the JSON response
    let data;
    try {
      data = JSON.parse(text);
      if (data && data.contents) {
        data = JSON.parse(data.contents);
      }
    } catch (e) {
      console.warn("Parsing JSON failed, trying fallback:", e);
      const match = text.match(/\{.*\}/s);
      if (match) data = JSON.parse(match[0]);
    }

    if (!data || !Array.isArray(data.products) || data.products.length === 0) {
      console.warn(`No products found for search term: ${searchTerm}`);
      return [];
    }

    return data.products;
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
  const price = product.price ? `${product.price} ج.م` : 'السعر غير متوفر';
  const image = product.image || 'placeholder-image.jpg';
  
  card.innerHTML = `
    <div class="card-content">
      <div class="card-image">
        <img src="${image}" alt="${name}" onerror="this.src='placeholder-image.jpg'" />
        <div class="overlay">
          <i class="fa-solid fa-eye"></i>
        </div>
      </div>
      <div class="card-text">
        <p class="card__title">${name}</p>
      </div>
      <div class="card-footer">
        <div class="card__price">${price}</div>
        <div class="buttons">
          <button class="card-button add-to-cart" data-product-id="${product.id}">
            <i class="fa-solid fa-cart-shopping"></i>
          </button>
          <button class="card-button add-to-favorites" data-product-id="${product.id}">
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
  
  // Use Set to avoid duplicate products
  const uniqueProducts = new Map();
  
  try {
    // Fetch products for each search term
    for (const term of searchTerms) {
      const products = await fetchProducts(term);
      
      // Add products to the map using their ID as the key to avoid duplicates
      products.forEach(product => {
        if (product.id && !uniqueProducts.has(product.id)) {
          uniqueProducts.set(product.id, product);
        }
      });
      
      // If we've already found some products, we can break early
      if (uniqueProducts.size >= 20) break; // Limit to 20 products
    }
    
    // Clear loading state
    container.innerHTML = '';
    
    // Add each product to the container
    for (const product of uniqueProducts.values()) {
      const card = createProductCard(product);
      container.appendChild(card);
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

// Function to add event listeners
function addEventListeners() {
  // Add to cart functionality
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = e.currentTarget.dataset.productId;
      // Add your add to cart logic here
      console.log('Added to cart:', productId);
      // You can update the cart count here
    });
  });
  
  // Add to favorites functionality
  document.querySelectorAll('.add-to-favorites').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = e.currentTarget.dataset.productId;
      // Add your add to favorites logic here
      console.log('Added to favorites:', productId);
      // You can update the favorites count here
    });
  });
  
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

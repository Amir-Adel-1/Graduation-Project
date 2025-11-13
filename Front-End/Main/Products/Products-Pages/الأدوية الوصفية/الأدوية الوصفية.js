// Search terms from the image
const searchTerms = [
  'polyfresh',
  'polyfresh advanced',
  'polyfresh advanced eye drops',
  'polyfresh eye drops',
  'polyfresh eye',
  'poly fresh',
  'poly fresh eye drops',
  'poly fresh eye',
  'polyfresh drops',
  'poly fresh drops'
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
        <div class="card-image-front">
          <img src="${image}" alt="${name}" onerror="this.src='placeholder-image.jpg'" />
        </div>
        <div class="card-image-back">
          <h4>${name}</h4>
          <p>${name} - اضغط لمعرفة المزيد</p>
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
      e.stopPropagation();
      const productId = e.currentTarget.dataset.productId;
      // Add your add to cart logic here
      console.log('Added to cart:', productId);
      // You can update the cart count here
    });
  });
  
  // Add to favorites functionality
  document.querySelectorAll('.add-to-favorites').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = e.currentTarget.dataset.productId;
      // Add your add to favorites logic here
      console.log('Added to favorites:', productId);
      // You can update the favorites count here
    });
  });
  
  // Use event delegation for card flip
  document.addEventListener('click', function(event) {
    // Check if the clicked element or any of its parents have the card-image class
    const cardImage = event.target.closest('.card-image');
    if (cardImage) {
      event.preventDefault();
      event.stopPropagation();
      cardImage.classList.toggle('flipped');
    }
  });
}

// Initialize the page when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  displayAllProducts();
});
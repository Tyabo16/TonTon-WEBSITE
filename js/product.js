// Product loading and filtering functionality

let allProducts = [];
let currentCategory = '';

document.addEventListener('DOMContentLoaded', function() {
  // Determine current page/category
  const path = window.location.pathname;
  if (path.includes('phones.html')) {
    currentCategory = 'phones';
  } else if (path.includes('tablets.html')) {
    currentCategory = 'tablets';
  } else if (path.includes('laptops.html')) {
    currentCategory = 'laptops';
  } else if (path.includes('consoles.html')) {
    currentCategory = 'consoles';
  } else if (path.includes('accessories.html')) {
    currentCategory = 'accessories';
  } else if (path.includes('category.html')) {
    // Try to get category from sessionStorage (for redirect from specific category page)
    const storedCategory = sessionStorage.getItem('currentCategory');
    if (storedCategory) {
      currentCategory = storedCategory;
    }
  }

  // Initialize product page
  if (path.includes('category.html') || currentCategory) {
    initProductPage();
  }
});

/**
 * Initialize the product page with filters and product grid
 */
function initProductPage() {
  // Hide loading indicator when products are loaded
  const loadingIndicator = document.getElementById('products-loading');
  
  loadProducts()
    .then(() => {
      // Hide loading indicator
      if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
      }
      
      // Initialize filters with callback to render products
      if (window.productFilters) {
        window.productFilters.initFilters(allProducts, renderProducts, currentCategory);
      } else {
        // Fallback if filters.js is not loaded
        renderProducts(allProducts);
      }
    })
    .catch(error => {
      console.error('Error loading products:', error);
      showErrorMessage('Failed to load products. Please try again later.');
    });
}

/**
 * Load products from JSON file
 */
function loadProducts() {
  return fetch('products.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(products => {
      // Add image error handling to each product
      products.forEach(product => {
        // Update image paths to use placeholder if original doesn't exist
        product.originalImage = product.image;
        product.image = product.image;
      });
      
      // Filter by category if specified, otherwise show all products
      if (currentCategory) {
        allProducts = products.filter(product => product.category === currentCategory);
      } else {
        allProducts = products;
      }
      
      // Update page title and description
      updatePageTitle();
      
      return allProducts;
    });
}

/**
 * Update page title based on current category
 */
function updatePageTitle() {
  const categoryTitle = document.getElementById('category-title');
  const categoryDescription = document.querySelector('.text-gray-600.dark\\:text-gray-400');
  
  if (categoryTitle && currentCategory) {
    // Format category name for display (capitalize first letter)
    const displayName = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
    categoryTitle.textContent = displayName;
    
    if (categoryDescription) {
      categoryDescription.textContent = `Showing all ${displayName.toLowerCase()}`;
    }
  }
}

/**
 * Render products in the product grid
 */
function renderProducts(products) {
  const productGrid = document.querySelector('.products-grid .grid');
  if (!productGrid) return;

  productGrid.innerHTML = '';

  if (products.length === 0) {
    productGrid.innerHTML = `
      <div class="col-span-full text-center py-12">
        <i class="ri-shopping-bag-line text-4xl text-gray-400 mb-4"></i>
        <h3 class="text-xl font-semibold mb-2">No products found</h3>
        <p class="text-gray-500">Try adjusting your filters</p>
      </div>
    `;
    return;
  }

  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all';
    productCard.setAttribute('data-product-id', product.id);
    
    // Use a placeholder image URL
    const placeholderImage = `https://placehold.co/600x400?text=${encodeURIComponent(product.name)}`;
    
    productCard.innerHTML = `
      <a href="product-detail.html?id=${product.id}" aria-label="View details of ${product.name}">
        <img 
          src="${product.image}" 
          alt="${product.name}" 
          class="w-full h-48 object-contain p-4" 
          loading="lazy"
          onerror="this.onerror=null; this.src='${placeholderImage}';">
        <div class="p-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">${product.name}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">${product.specs}</p>
          <div class="flex justify-between items-center">
            <span class="text-xl font-bold text-gray-900 dark:text-white">${product.price.toLocaleString()} DZD</span>
          </div>
        </div>
      </a>
      <div class="p-4 pt-0 flex justify-between">
        <button 
          class="add-to-wishlist-btn w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-primary transition-all" 
          data-id="${product.id}"
          aria-label="Add ${product.name} to wishlist">
          <i class="ri-heart-line" aria-hidden="true"></i>
        </button>
        <button 
          class="add-to-cart-btn bg-primary text-white font-medium py-2 px-4 rounded-button hover:shadow-md transition-all" 
          data-id="${product.id}" 
          data-name="${product.name}" 
          data-price="${product.price}" 
          data-image="${placeholderImage}" 
          data-description="${product.description}"
          aria-label="Add ${product.name} to cart">
          Add to Cart
        </button>
      </div>
    `;
    
    productGrid.appendChild(productCard);
  });

  // Initialize add to cart buttons
  initAddToCartButtons();
  initWishlistButtons();
}

/**
 * Initialize add to cart buttons
 */
function initAddToCartButtons() {
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
  if (addToCartButtons.length > 0) {
    addToCartButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        // Check if user is logged in
        if (!userData.isLoggedIn) {
          alert('Please log in to add items to your cart.');
          const loginBtn = document.getElementById('loginBtn');
          if (loginBtn) loginBtn.click();
          return;
        }
        
        // Get product details
        const id = this.getAttribute('data-id');
        const name = this.getAttribute('data-name');
        const price = this.getAttribute('data-price');
        const image = this.getAttribute('data-image');
        const description = this.getAttribute('data-description');
        
        // Add to cart
        addToCart(id, name, price, image, description);
      });
    });
  }
}

/**
 * Add a product to cart
 */
function addToCart(id, name, price, image, description) {
  let cart = JSON.parse(localStorage.getItem('userCart') || '[]');
  
  // Check if item is already in cart
  const existingItemIndex = cart.findIndex(item => item.id === id);
  
  if (existingItemIndex >= 0) {
    // Increase quantity if already in cart
    cart[existingItemIndex].quantity++;
  } else {
    // Add new item to cart
    cart.push({
      id: id,
      name: name,
      price: price,
      image: image,
      description: description,
      quantity: 1
    });
  }
  
  // Save cart to localStorage
  localStorage.setItem('userCart', JSON.stringify(cart));
  
  // Update cart count badge
  updateCartCount();
  
  // Notify user
  if (window.productFilters) {
    window.productFilters.showNotification(`${name} added to cart`, 'bg-green-600');
  } else {
    showAddedToCartNotification(name);
  }
}

/**
 * Update the cart count badge
 */
function updateCartCount() {
  const cartCountBadge = document.getElementById('cart-count');
  if (cartCountBadge) {
    const cart = JSON.parse(localStorage.getItem('userCart') || '[]');
    cartCountBadge.textContent = cart.length.toString();
  }
}

/**
 * Show a notification that an item has been added to cart
 */
function showAddedToCartNotification(productName) {
  const notification = document.createElement('div');
  notification.className = 'fixed bottom-4 right-4 bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg z-50';
  notification.innerHTML = `<i class="ri-check-line mr-2"></i> ${productName} added to cart`;
  notification.style.transition = 'opacity 0.3s, transform 0.3s';
  notification.style.opacity = '0';
  notification.style.transform = 'translateY(10px)';

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(10px)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Initialize wishlist buttons
 */
function initWishlistButtons() {
  const wishlistButtons = document.querySelectorAll('.add-to-wishlist-btn');
  if (wishlistButtons.length > 0) {
    // Check which products are in wishlist
    const wishlist = JSON.parse(localStorage.getItem('userWishlist') || '[]');
    const wishlistIds = wishlist.map(item => item.id);
    
    wishlistButtons.forEach(button => {
      const productId = button.getAttribute('data-id');
      
      // Mark as active if in wishlist
      if (wishlistIds.includes(productId)) {
        button.innerHTML = '<i class="ri-heart-fill"></i>';
        button.classList.add('text-primary');
      }
      
      button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        // Check if user is logged in
        if (!userData.isLoggedIn) {
          alert('Please log in to add items to your wishlist.');
          const loginBtn = document.getElementById('loginBtn');
          if (loginBtn) loginBtn.click();
          return;
        }
        
        toggleWishlistItem(this);
      });
    });
  }
}

/**
 * Toggle a product in the wishlist
 */
function toggleWishlistItem(button) {
  const productId = button.getAttribute('data-id');
  let wishlist = JSON.parse(localStorage.getItem('userWishlist') || '[]');
  
  // Check if item is already in wishlist
  const existingItemIndex = wishlist.findIndex(item => item.id === productId);
  
  if (existingItemIndex >= 0) {
    // Remove from wishlist
    wishlist.splice(existingItemIndex, 1);
    button.innerHTML = '<i class="ri-heart-line"></i>';
    button.classList.remove('text-primary');
    
    if (window.productFilters) {
      window.productFilters.showNotification('Removed from wishlist', 'bg-gray-700');
    }
  } else {
    // Find product details
    const product = allProducts.find(p => p.id.toString() === productId);
    if (product) {
      // Add to wishlist
      wishlist.push({
        id: productId,
        name: product.name,
        price: product.price,
        image: product.image,
        description: product.description
      });
      button.innerHTML = '<i class="ri-heart-fill"></i>';
      button.classList.add('text-primary');
      
      if (window.productFilters) {
        window.productFilters.showNotification('Added to wishlist', 'bg-primary');
      }
    }
  }
  
  // Save wishlist to localStorage
  localStorage.setItem('userWishlist', JSON.stringify(wishlist));
}

/**
 * Show an error message
 */
function showErrorMessage(message) {
  const productGrid = document.querySelector('.products-grid .grid');
  if (productGrid) {
    productGrid.innerHTML = `
      <div class="col-span-full text-center py-12">
        <i class="ri-error-warning-line text-4xl text-red-500 mb-4"></i>
        <h3 class="text-xl font-semibold mb-2">Error</h3>
        <p class="text-gray-500">${message}</p>
      </div>
    `;
  }
} 
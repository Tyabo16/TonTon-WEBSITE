/**
 * Products Module for TontonPhone
 * Provides product loading, filtering, and cart functionality
 */

// Product management
const ProductManager = (function() {
  // Private variables
  let allProducts = [];
  let filteredProducts = [];
  let loadingState = 'idle'; // idle, loading, error, success
  
  // DOM elements
  const elements = {
    productsGrid: document.querySelector('.products-grid .grid'),
    loadingIndicator: document.getElementById('products-loading'),
    errorMessage: document.getElementById('products-error'),
    productCount: document.querySelector('.product-count'),
    filterForm: document.querySelector('.filter-card')
  };
  
  // Load products from JSON
  async function loadProducts(category = null) {
    if (!elements.productsGrid) return;
    
    try {
      loadingState = 'loading';
      updateUI();
      
      const response = await fetch('products.json');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      allProducts = await response.json();
      
      // Filter by category if provided
      if (category) {
        filteredProducts = allProducts.filter(product => product.category === category);
      } else {
        filteredProducts = [...allProducts];
      }
      
      loadingState = 'success';
      renderProducts();
    } catch (error) {
      console.error('Error loading products:', error);
      loadingState = 'error';
      updateUI();
    }
  }
  
  // Render products to grid
  function renderProducts() {
    if (!elements.productsGrid) return;
    
    updateUI();
    
    // Clear grid
    elements.productsGrid.innerHTML = '';
    
    if (filteredProducts.length === 0) {
      elements.productsGrid.innerHTML = `
        <div class="col-span-full text-center py-12">
          <div class="text-gray-400 text-5xl mb-4">
            <i class="ri-shopping-bag-line"></i>
          </div>
          <h3 class="text-xl font-semibold mb-2">No products found</h3>
          <p class="text-gray-600 dark:text-gray-400">Try adjusting your filters</p>
        </div>
      `;
    } else {
      // Update product count if element exists
      if (elements.productCount) {
        elements.productCount.textContent = filteredProducts.length;
      }
      
      // Render each product
      filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        elements.productsGrid.appendChild(productCard);
      });
      
      // Initialize buttons
      initProductButtons();
    }
  }
  
  // Create product card element
  function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden product-card hover:shadow-md transition-all';
    
    // Use placeholder image with onerror fallback
    const placeholderImage = `https://placehold.co/600x400?text=${encodeURIComponent(product.name)}`;
    
    card.innerHTML = `
      <a href="product-detail.html?id=${product.id}" aria-label="View details of ${product.name}">
        <div class="aspect-square bg-gray-50 dark:bg-gray-700 p-4 flex items-center justify-center">
          <img 
            src="${product.image}" 
            alt="${product.name}" 
            class="max-h-48 object-contain" 
            loading="lazy" 
            onerror="this.onerror=null; this.src='${placeholderImage}';">
        </div>
        <div class="p-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">${product.name}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">${product.specs || ''}</p>
          <div class="flex justify-between items-center">
            <span class="text-xl font-bold text-gray-900 dark:text-white">${product.price.toLocaleString()} DZD</span>
          </div>
        </div>
      </a>
      <div class="px-4 pb-4 flex justify-between">
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
          aria-label="Add ${product.name} to cart">
          Add to Cart
        </button>
      </div>
    `;
    
    return card;
  }
  
  // Update UI based on loading state
  function updateUI() {
    if (!elements.loadingIndicator || !elements.errorMessage || !elements.productsGrid) return;
    
    switch (loadingState) {
      case 'loading':
        elements.loadingIndicator.style.display = 'flex';
        elements.errorMessage.style.display = 'none';
        elements.productsGrid.innerHTML = '';
        break;
      case 'error':
        elements.loadingIndicator.style.display = 'none';
        elements.errorMessage.style.display = 'block';
        elements.productsGrid.innerHTML = '';
        break;
      case 'success':
        elements.loadingIndicator.style.display = 'none';
        elements.errorMessage.style.display = 'none';
        break;
      default:
        break;
    }
  }
  
  // Initialize product buttons
  function initProductButtons() {
    // Add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
      button.addEventListener('click', function() {
        const id = this.dataset.id;
        const name = this.dataset.name;
        const price = parseFloat(this.dataset.price);
        
        CartManager.addToCart(id, name, price);
        showNotification(`${name} added to cart!`);
      });
    });
    
    // Add to wishlist buttons
    const wishlistButtons = document.querySelectorAll('.add-to-wishlist-btn');
    wishlistButtons.forEach(button => {
      button.addEventListener('click', function() {
        const id = this.dataset.id;
        const product = allProducts.find(p => p.id === id);
        
        if (product) {
          WishlistManager.toggleWishlist(product);
        }
      });
    });
  }
  
  // Apply filters to products
  function applyFilters(filters) {
    if (!allProducts.length) return;
    
    // Start with all products
    let filtered = [...allProducts];
    
    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }
    
    // Apply brand filter
    if (filters.brand && filters.brand !== '') {
      filtered = filtered.filter(product => product.brand === filters.brand);
    }
    
    // Apply price range
    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      filtered = filtered.filter(product => 
        product.price >= filters.minPrice && product.price <= filters.maxPrice
      );
    }
    
    // Apply storage filter
    if (filters.storage && filters.storage.length > 0) {
      filtered = filtered.filter(product => 
        filters.storage.some(storage => product.storage && product.storage.includes(storage))
      );
    }
    
    // Apply RAM filter
    if (filters.ram && filters.ram.length > 0) {
      filtered = filtered.filter(product => 
        filters.ram.some(ram => product.ram && product.ram.includes(ram))
      );
    }
    
    // Update filtered products
    filteredProducts = filtered;
    
    // Render updated products
    renderProducts();
    
    return filtered.length;
  }
  
  // Initialize filters
  function initializeFilters() {
    if (!elements.filterForm) return;
    
    // Storage buttons
    const storageButtons = document.querySelectorAll('.storage-btn');
    storageButtons.forEach(button => {
      button.addEventListener('click', function() {
        this.classList.toggle('active');
      });
    });
    
    // Apply filters button
    const applyFiltersBtn = elements.filterForm.querySelector('button');
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener('click', function() {
        // Collect filter values
        const filters = {
          category: document.body.dataset.category,
          brand: elements.filterForm.querySelector('select')?.value,
          minPrice: parseFloat(elements.filterForm.querySelector('input[type="number"][min="0"]')?.value || 0),
          maxPrice: parseFloat(elements.filterForm.querySelector('input[type="number"][value="250000"]')?.value || 250000),
          storage: Array.from(elements.filterForm.querySelectorAll('.storage-btn.active')).map(btn => btn.textContent.trim()),
          ram: Array.from(elements.filterForm.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.nextElementSibling.textContent.trim())
        };
        
        // Apply filters
        const count = applyFilters(filters);
        
        // Show notification
        showNotification(`Filters applied. Found ${count} products.`);
      });
    }
    
    // Initialize price range slider
    const priceSlider = elements.filterForm.querySelector('.price-slider');
    const maxPriceInput = elements.filterForm.querySelector('input[type="number"][value="250000"]');
    
    if (priceSlider && maxPriceInput) {
      priceSlider.addEventListener('input', function() {
        maxPriceInput.value = this.value;
      });
      
      maxPriceInput.addEventListener('change', function() {
        priceSlider.value = this.value;
      });
    }
  }
  
  // Public API
  return {
    loadProducts,
    renderProducts,
    applyFilters,
    initializeFilters
  };
})();

// Cart management
const CartManager = (function() {
  // Add product to cart
  function addToCart(id, name, price, quantity = 1, image = '') {
    // Get current cart
    const cart = JSON.parse(localStorage.getItem('userCart') || '[]');
    
    // Check if product already in cart
    const existingItemIndex = cart.findIndex(item => item.id === id);
    
    if (existingItemIndex !== -1) {
      // Update quantity
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.push({
        id,
        name,
        price,
        quantity,
        image
      });
    }
    
    // Save to localStorage
    localStorage.setItem('userCart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    return cart;
  }
  
  // Update cart count in UI
  function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
      const cart = JSON.parse(localStorage.getItem('userCart') || '[]');
      cartCount.textContent = cart.length.toString();
    }
  }
  
  // Get cart items
  function getCartItems() {
    return JSON.parse(localStorage.getItem('userCart') || '[]');
  }
  
  // Calculate cart total
  function getCartTotal() {
    const cart = getCartItems();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
  
  // Remove item from cart
  function removeFromCart(id) {
    let cart = getCartItems();
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('userCart', JSON.stringify(cart));
    updateCartCount();
    return cart;
  }
  
  // Clear cart
  function clearCart() {
    localStorage.setItem('userCart', JSON.stringify([]));
    updateCartCount();
  }
  
  // Public API
  return {
    addToCart,
    removeFromCart,
    getCartItems,
    getCartTotal,
    updateCartCount,
    clearCart
  };
})();

// Wishlist management
const WishlistManager = (function() {
  // Toggle product in wishlist
  function toggleWishlist(product) {
    // Get current wishlist
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    // Check if product already in wishlist
    const existingItemIndex = wishlist.findIndex(item => item.id === product.id);
    
    if (existingItemIndex !== -1) {
      // Remove from wishlist
      wishlist.splice(existingItemIndex, 1);
      showNotification(`${product.name} removed from wishlist`, 'bg-gray-600');
    } else {
      // Add to wishlist
      wishlist.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      });
      showNotification(`${product.name} added to wishlist`);
    }
    
    // Save to localStorage
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    
    return wishlist;
  }
  
  // Get wishlist items
  function getWishlistItems() {
    return JSON.parse(localStorage.getItem('wishlist') || '[]');
  }
  
  // Check if product is in wishlist
  function isInWishlist(id) {
    const wishlist = getWishlistItems();
    return wishlist.some(item => item.id === id);
  }
  
  // Public API
  return {
    toggleWishlist,
    getWishlistItems,
    isInWishlist
  };
})();

// Notification helper
function showNotification(message, bgColor = 'bg-green-600') {
  const notification = document.createElement('div');
  notification.className = `fixed bottom-4 right-4 ${bgColor} text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fadeIn`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.add('animate-fadeOut');
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
  // Get page category from body data attribute
  const category = document.body.dataset.category;
  
  // Load products
  if (category) {
    ProductManager.loadProducts(category);
  } else if (document.querySelector('.products-grid')) {
    ProductManager.loadProducts();
  }
  
  // Initialize filters
  ProductManager.initializeFilters();
  
  // Update cart count
  CartManager.updateCartCount();
}); 
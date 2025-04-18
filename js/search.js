// Search functionality for TonTonPhone

let allProducts = [];

document.addEventListener('DOMContentLoaded', function() {
  // Initialize search
  initSearch();
});

/**
 * Initialize search functionality
 */
function initSearch() {
  // Get search form and input
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  
  if (searchForm && searchInput) {
    // Load all products for searching
    loadAllProducts();
    
    // Add event listener for search form submission
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const query = searchInput.value.trim().toLowerCase();
      
      if (query.length > 0) {
        // Redirect to search results page
        window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
      }
    });
  }
  
  // Check if we're on the search results page
  if (window.location.pathname.includes('search-results.html')) {
    // Get search query from URL
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    
    if (query) {
      // Update search input with query
      if (searchInput) {
        searchInput.value = query;
      }
      
      // Show search results
      showSearchResults(query);
    }
  }
}

/**
 * Load all products for searching
 */
function loadAllProducts() {
  fetch('/products.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(products => {
      allProducts = products;
    })
    .catch(error => {
      console.error('Error loading products for search:', error);
    });
}

/**
 * Show search results on the search results page
 */
function showSearchResults(query) {
  // Get search results container and query display element
  const resultsContainer = document.getElementById('search-results-container');
  const queryDisplay = document.getElementById('search-query-display');
  
  if (!resultsContainer) return;
  
  // Show query in the header
  if (queryDisplay) {
    queryDisplay.textContent = `"${query}"`;
  }
  
  // Load products if not already loaded
  if (allProducts.length === 0) {
    fetch('/products.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(products => {
        allProducts = products;
        displaySearchResults(query, resultsContainer);
      })
      .catch(error => {
        console.error('Error loading products for search results:', error);
        resultsContainer.innerHTML = `
          <div class="text-center py-12">
            <i class="ri-error-warning-line ri-3x text-red-500 mb-4"></i>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error</h3>
            <p class="text-gray-600 dark:text-gray-400">Failed to load search results. Please try again later.</p>
          </div>
        `;
      });
  } else {
    displaySearchResults(query, resultsContainer);
  }
}

/**
 * Display search results in the container
 */
function displaySearchResults(query, container) {
  // Filter products based on search query
  const results = allProducts.filter(product => {
    // Search in name, description, brand, category, and specs
    return (
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase()) ||
      product.brand.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase()) ||
      product.specs.toLowerCase().includes(query.toLowerCase())
    );
  });
  
  // Update container with results
  if (results.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12">
        <i class="ri-search-line text-4xl text-gray-400 mb-4"></i>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No results found</h3>
        <p class="text-gray-600 dark:text-gray-400">Try a different search term or browse our categories</p>
      </div>
    `;
  } else {
    // Update result count
    const resultCount = document.getElementById('search-result-count');
    if (resultCount) {
      resultCount.textContent = `${results.length} results found`;
    }
    
    // Create grid for results
    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    
    // Create product cards
    results.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = 'product-card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all';
      
      productCard.innerHTML = `
        <a href="product-detail.html?id=${product.id}">
          <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-contain p-4">
          <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">${product.name}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">${product.specs}</p>
            <div class="flex justify-between items-center">
              <span class="text-xl font-bold text-gray-900 dark:text-white">${product.price.toLocaleString()} DZD</span>
            </div>
          </div>
        </a>
        <div class="p-4 pt-0 flex justify-between">
          <button class="add-to-wishlist-btn w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-primary transition-all" data-id="${product.id}">
            <i class="ri-heart-line"></i>
          </button>
          <button class="add-to-cart-btn bg-primary text-white font-medium py-2 px-4 rounded-button hover:shadow-md transition-all" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}" data-description="${product.description}">
            Add to Cart
          </button>
        </div>
      `;
      
      gridContainer.appendChild(productCard);
    });
    
    container.innerHTML = '';
    container.appendChild(gridContainer);
    
    // Initialize add to cart buttons
    initAddToCartButtons();
    
    // Initialize wishlist buttons if available
    if (typeof initWishlistButtons === 'function') {
      initWishlistButtons();
    }
  }
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
// Product filtering functionality

document.addEventListener('DOMContentLoaded', function() {
  initializeProductFilters();
});

function initializeProductFilters() {
  const applyFiltersBtn = document.querySelector('.filter-card button');
  if (!applyFiltersBtn) return;

  initializePriceSlider();
  initializeStorageButtons();
  initializeFilterOptions();
  applyFiltersBtn.addEventListener('click', applyProductFilters);
}

function initializeFilterOptions() {
  // Initialize filter options with click handlers
  const filterOptions = document.querySelectorAll('input[type="checkbox"]');
  filterOptions.forEach(option => {
    option.addEventListener('change', function() {
      // Highlight selected filters - already handled by CSS
    });
  });
}

function initializeStorageButtons() {
  // Storage buttons
  const storageButtons = document.querySelectorAll('.storage-btn');
  
  storageButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Toggle active class on clicked button
      this.classList.toggle('active');
    });
  });
}

function initializePriceSlider() {
  const priceSlider = document.querySelector('.price-slider');
  const maxPriceInput = document.querySelector('input[type="number"][value]');
  
  if (priceSlider && maxPriceInput) {
    priceSlider.addEventListener('input', function() {
      maxPriceInput.value = this.value;
    });
    
    maxPriceInput.addEventListener('change', function() {
      priceSlider.value = this.value;
    });
  }
}

function applyProductFilters() {
  // Determine current page/category
  const currentCategory = getCurrentCategory();
  
  // Reload products with filters applied
  loadProducts(currentCategory);
  
  // Show notification
  showFilterNotification();
}

function getCurrentCategory() {
  // Determine current category based on page URL or title
  const path = window.location.pathname;
  
  if (path.includes('phones')) return 'phones';
  if (path.includes('tablets')) return 'tablets';
  if (path.includes('laptops')) return 'laptops';
  if (path.includes('consoles')) return 'consoles';
  if (path.includes('accessories')) return 'accessories';
  
  // Default to phones if can't determine
  return 'phones';
}

function loadProducts(category = 'phones') {
  const productsGrid = document.querySelector('.products-grid .grid');
  const loadingIndicator = document.getElementById('products-loading');
  const errorMessage = document.getElementById('products-error');
  
  // Show loading indicator
  if (loadingIndicator) {
    loadingIndicator.style.display = 'flex';
  }
  
  fetch('products.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(products => {
      // Filter products by category
      let filteredProducts = products.filter(product => product.category === category);
      
      // Apply additional filters
      filteredProducts = applyFilters(filteredProducts, category);
      
      // Hide loading indicator
      if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
      }
      
      // Clear and populate products grid
      if (productsGrid) {
        productsGrid.innerHTML = '';
        
        if (filteredProducts.length === 0) {
          displayNoProductsMessage(productsGrid, category);
        } else {
          filteredProducts.forEach(product => {
            const productCard = createProductCard(product);
            productsGrid.appendChild(productCard);
          });
          
          // Update product count
          updateProductCount(filteredProducts.length, products.filter(p => p.category === category).length);
        }
      }
    })
    .catch(error => {
      console.error('Error loading products:', error);
      
      // Hide loading indicator and show error message
      if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
      }
      
      if (errorMessage) {
        errorMessage.style.display = 'block';
      }
    });
}

function applyFilters(products, category) {
  const filters = getFiltersForCategory(category);
  
  return products.filter(product => {
    // Brand filter
    if (filters.brand && filters.brand !== '' && product.brand !== filters.brand) {
      return false;
    }
    
    // Price filter
    if (filters.maxPrice && product.price > filters.maxPrice) {
      return false;
    }
    
    // Storage filter for applicable categories
    if (['phones', 'tablets', 'laptops', 'consoles'].includes(category) && 
        filters.storage && filters.storage.length > 0) {
      if (!matchesStorage(product, filters.storage)) {
        return false;
      }
    }
    
    // Category-specific filters
    switch(category) {
      case 'phones':
        return matchesPhoneFilters(product, filters);
      case 'tablets':
        return matchesTabletFilters(product, filters);
      case 'laptops':
        return matchesLaptopFilters(product, filters);
      case 'consoles':
        return matchesConsoleFilters(product, filters);
      case 'accessories':
        return matchesAccessoryFilters(product, filters);
      default:
        return true;
    }
  });
}

function getFiltersForCategory(category) {
  // Common filters
  const filters = {
    brand: getSelectedBrand(),
    maxPrice: getMaxPrice()
  };
  
  // Add storage filter for applicable categories
  if (['phones', 'tablets', 'laptops', 'consoles'].includes(category)) {
    filters.storage = getSelectedStorage();
  }
  
  // Add category-specific filters
  switch(category) {
    case 'phones':
      filters.ram = getSelectedRAM();
      break;
    case 'tablets':
      filters.os = getSelectedOS();
      filters.displaySize = getSelectedDisplaySize();
      filters.connectivity = getSelectedConnectivity();
      break;
    case 'laptops':
      filters.processor = getSelectedProcessor();
      filters.ram = getSelectedRAM();
      filters.displaySize = getSelectedDisplaySize();
      break;
    case 'consoles':
      filters.consoleType = getSelectedConsoleType();
      break;
    case 'accessories':
      filters.accessoryType = getSelectedAccessoryType();
      filters.compatibility = getSelectedCompatibility();
      break;
  }
  
  return filters;
}

function getSelectedBrand() {
  const brandSelect = document.querySelector('select option:checked');
  return brandSelect && brandSelect.value !== '' ? brandSelect.value : null;
}

function getMaxPrice() {
  const priceSlider = document.querySelector('.price-slider');
  return priceSlider ? parseInt(priceSlider.value) : Infinity;
}

function getSelectedStorage() {
  const storage = [];
  document.querySelectorAll('.storage-btn.active').forEach(button => {
    storage.push(button.textContent.trim());
  });
  return storage;
}

function getSelectedRAM() {
  const ram = [];
  document.querySelectorAll('div h3').forEach(header => {
    if (header.textContent.includes('RAM')) {
      const checkboxes = header.closest('div').querySelectorAll('input[type="checkbox"]:checked');
      checkboxes.forEach(checkbox => {
        const label = checkbox.closest('label');
        if (label) {
          ram.push(label.textContent.trim());
        }
      });
    }
  });
  return ram;
}

function getSelectedProcessor() {
  const processors = [];
  document.querySelectorAll('div h3').forEach(header => {
    if (header.textContent.includes('Processor')) {
      const checkboxes = header.closest('div').querySelectorAll('input[type="checkbox"]:checked');
      checkboxes.forEach(checkbox => {
        const label = checkbox.closest('label');
        if (label) {
          processors.push(label.textContent.trim());
        }
      });
    }
  });
  return processors;
}

function getSelectedOS() {
  const os = [];
  document.querySelectorAll('div h3').forEach(header => {
    if (header.textContent.includes('Operating System')) {
      const checkboxes = header.closest('div').querySelectorAll('input[type="checkbox"]:checked');
      checkboxes.forEach(checkbox => {
        const label = checkbox.closest('label');
        if (label) {
          os.push(label.textContent.trim());
        }
      });
    }
  });
  return os;
}

function getSelectedDisplaySize() {
  const sizes = [];
  document.querySelectorAll('div h3').forEach(header => {
    if (header.textContent.includes('Display Size')) {
      const checkboxes = header.closest('div').querySelectorAll('input[type="checkbox"]:checked');
      checkboxes.forEach(checkbox => {
        const label = checkbox.closest('label');
        if (label) {
          sizes.push(label.textContent.trim());
        }
      });
    }
  });
  return sizes;
}

function getSelectedConnectivity() {
  const connectivity = [];
  document.querySelectorAll('div h3').forEach(header => {
    if (header.textContent.includes('Connectivity')) {
      const checkboxes = header.closest('div').querySelectorAll('input[type="checkbox"]:checked');
      checkboxes.forEach(checkbox => {
        const label = checkbox.closest('label');
        if (label) {
          connectivity.push(label.textContent.trim());
        }
      });
    }
  });
  return connectivity;
}

function getSelectedConsoleType() {
  const types = [];
  document.querySelectorAll('div h3').forEach(header => {
    if (header.textContent.includes('Console Type')) {
      const checkboxes = header.closest('div').querySelectorAll('input[type="checkbox"]:checked');
      checkboxes.forEach(checkbox => {
        const label = checkbox.closest('label');
        if (label) {
          types.push(label.textContent.trim());
        }
      });
    }
  });
  return types;
}

function getSelectedAccessoryType() {
  const types = [];
  document.querySelectorAll('div h3').forEach(header => {
    if (header.textContent.includes('Accessory Type')) {
      const checkboxes = header.closest('div').querySelectorAll('input[type="checkbox"]:checked');
      checkboxes.forEach(checkbox => {
        const label = checkbox.closest('label');
        if (label) {
          types.push(label.textContent.trim());
        }
      });
    }
  });
  return types;
}

function getSelectedCompatibility() {
  const compatibility = [];
  document.querySelectorAll('div h3').forEach(header => {
    if (header.textContent.includes('Compatible With')) {
      const checkboxes = header.closest('div').querySelectorAll('input[type="checkbox"]:checked');
      checkboxes.forEach(checkbox => {
    const label = checkbox.closest('label');
    if (label) {
          compatibility.push(label.textContent.trim());
        }
      });
    }
  });
  return compatibility;
}

function matchesStorage(product, selectedStorage) {
  if (!selectedStorage || selectedStorage.length === 0) {
    return true;
  }
  
  return selectedStorage.some(storage => 
    product.specs && product.specs.includes(storage)
  );
}

function matchesPhoneFilters(product, filters) {
  // RAM filter
  if (filters.ram && filters.ram.length > 0) {
    if (!filters.ram.some(ram => product.specs && product.specs.includes(ram))) {
      return false;
    }
  }
  
  return true;
}

function matchesTabletFilters(product, filters) {
  // OS filter
  if (filters.os && filters.os.length > 0) {
    if (!filters.os.some(os => product.specs && product.specs.includes(os))) {
      return false;
    }
  }
  
  // Display size filter
  if (filters.displaySize && filters.displaySize.length > 0) {
    if (!filters.displaySize.some(size => product.specs && product.specs.includes(size))) {
      return false;
    }
  }
  
  // Connectivity filter
  if (filters.connectivity && filters.connectivity.length > 0) {
    if (!filters.connectivity.some(conn => product.specs && product.specs.includes(conn))) {
      return false;
    }
  }
  
  return true;
}

function matchesLaptopFilters(product, filters) {
  // Processor filter
  if (filters.processor && filters.processor.length > 0) {
    if (!filters.processor.some(processor => product.specs && product.specs.includes(processor))) {
      return false;
    }
  }
  
  // RAM filter
  if (filters.ram && filters.ram.length > 0) {
    if (!filters.ram.some(ram => product.specs && product.specs.includes(ram))) {
      return false;
    }
  }
  
  // Display size filter
  if (filters.displaySize && filters.displaySize.length > 0) {
    if (!filters.displaySize.some(size => product.specs && product.specs.includes(size))) {
      return false;
    }
  }
  
  return true;
}

function matchesConsoleFilters(product, filters) {
  // Console type filter
  if (filters.consoleType && filters.consoleType.length > 0) {
    if (!filters.consoleType.some(type => product.specs && product.specs.includes(type))) {
      return false;
    }
  }
  
  return true;
}

function matchesAccessoryFilters(product, filters) {
  // Accessory type filter
  if (filters.accessoryType && filters.accessoryType.length > 0) {
    if (!filters.accessoryType.some(type => product.specs && product.specs.includes(type))) {
      return false;
    }
  }
  
  // Compatibility filter
  if (filters.compatibility && filters.compatibility.length > 0) {
    if (!filters.compatibility.some(comp => product.specs && product.specs.includes(comp))) {
      return false;
    }
  }
  
  return true;
}

function displayNoProductsMessage(container, category) {
  let icon, message;
  
  switch(category) {
    case 'phones':
      icon = 'ri-smartphone-line';
      message = 'No phones found';
      break;
    case 'tablets':
      icon = 'ri-tablet-line';
      message = 'No tablets found';
      break;
    case 'laptops':
      icon = 'ri-laptop-line';
      message = 'No laptops found';
      break;
    case 'consoles':
      icon = 'ri-gamepad-line';
      message = 'No gaming consoles found';
      break;
    case 'accessories':
      icon = 'ri-headphone-line';
      message = 'No accessories found';
      break;
    default:
      icon = 'ri-shopping-bag-line';
      message = 'No products found';
  }
  
  container.innerHTML = `
    <div class="col-span-full text-center py-12">
      <div class="text-gray-400 text-5xl mb-4">
        <i class="${icon}"></i>
      </div>
      <h3 class="text-xl font-semibold mb-2">${message}</h3>
      <p class="text-gray-600 dark:text-gray-400">Try adjusting your filters</p>
    </div>
  `;
}

function updateProductCount(filteredCount, totalCount) {
  const countDisplay = document.querySelector('.text-gray-600.dark\\:text-gray-400');
  if (countDisplay) {
    countDisplay.textContent = `Showing ${filteredCount} of ${totalCount} products`;
  }
}

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
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">${product.specs}</p>
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
  
  // Add event listener for add to cart button
  const addToCartBtn = card.querySelector('.add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', function(e) {
      e.preventDefault();
      addToCart(product.id, product.name, product.price);
    });
  }
  
  return card;
}

function addToCart(id, name, price) {
  // Get current cart or initialize empty array
  const cart = JSON.parse(localStorage.getItem('userCart') || '[]');
  
  // Check if item already exists in cart
  const existingItem = cart.find(item => item.id === id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: id,
      name: name,
      price: price,
      quantity: 1
    });
  }
  
  // Save updated cart
  localStorage.setItem('userCart', JSON.stringify(cart));
  
  // Update cart count in UI
  updateCartCount();
  
  // Show notification
  showNotification('Added to cart!');
}

function updateCartCount() {
  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    const cart = JSON.parse(localStorage.getItem('userCart') || '[]');
    cartCount.textContent = cart.length.toString();
  }
}

function showFilterNotification() {
  showNotification('Filters applied successfully!');
}

function showNotification(message, bgColor = 'bg-green-600') {
  const notification = document.createElement('div');
  notification.className = `fixed bottom-4 right-4 ${bgColor} text-white py-2 px-4 rounded-lg shadow-lg z-50`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.add('opacity-0');
    notification.style.transition = 'opacity 0.5s ease';

  setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 3000);
}

// Helper function for selecting elements by text content
Element.prototype.contains = function(text) {
  return this.textContent.includes(text);
};
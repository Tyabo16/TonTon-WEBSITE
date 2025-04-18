/**
 * Product Filters Functionality
 * This script handles the filtering of products on category pages
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize price slider display
  const priceSlider = document.querySelector(".price-slider")
  if (priceSlider) {
    const priceDisplay = document.querySelector(".font-medium.text-primary")

    // Update price display on load
    if (priceDisplay) {
      updatePriceDisplay(priceSlider.value, priceDisplay)
    }

    // Update price display when slider changes
    priceSlider.addEventListener("input", function () {
      if (priceDisplay) {
        updatePriceDisplay(this.value, priceDisplay)
      }
    })
  }

  function updatePriceDisplay(value, displayElement) {
    // Format the price with commas
    const formattedPrice = Number.parseInt(value).toLocaleString() + " DZD"
    displayElement.textContent = formattedPrice
  }

  // Filter Functionality
  const applyFiltersBtn = document.querySelector(".filters-sidebar button.w-full.bg-primary")
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener("click", () => {
      // Get all selected filters
      const selectedBrands = []
      document.querySelectorAll(".filters-sidebar .form-checkbox:checked").forEach((checkbox) => {
        selectedBrands.push(checkbox.nextElementSibling.textContent.trim().split(" ")[0])
      })

      const priceRange = document.querySelector(".price-slider").value
      const selectedStorage = []
      document.querySelectorAll(".filters-sidebar .filter-option input:checked").forEach((checkbox) => {
        selectedStorage.push(checkbox.nextElementSibling.textContent.trim())
      })

      // Get all product cards
      const productCards = document.querySelectorAll(
        ".products-grid .grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3.gap-6 > div",
      )

      // Get total product count from the showing text
      const showingText = document.querySelector(".products-grid .text-gray-600.dark\\:text-gray-400")
      let totalProducts = 0
      if (showingText) {
        const match = showingText.textContent.match(/of (\d+) products/)
        if (match && match[1]) {
          totalProducts = Number.parseInt(match[1])
        }
      }

      // Filter products based on selections
      let visibleCount = 0
      productCards.forEach((card) => {
        let showCard = true

        // Filter by brand if any selected
        if (selectedBrands.length > 0) {
          const productTitle = card.querySelector("h3").textContent
          const brandMatch = selectedBrands.some((brand) => productTitle.includes(brand))
          if (!brandMatch) {
            showCard = false
          }
        }

        // Filter by price
        const priceText = card.querySelector(".text-xl.font-bold").textContent
        const price = Number.parseInt(priceText.replace(/[^0-9]/g, ""))
        if (price > Number.parseInt(priceRange)) {
          showCard = false
        }

        // Filter by storage/RAM if any selected
        if (selectedStorage.length > 0) {
          const productDesc = card.querySelector("p").textContent
          const storageMatch = selectedStorage.some((storage) => productDesc.includes(storage))
          if (!storageMatch) {
            showCard = false
          }
        }

        // Apply filters
        if (showCard) {
          card.style.display = ""
          visibleCount++
        } else {
          card.style.display = "none"
        }
      })

      // Update the showing count
      if (showingText) {
        showingText.textContent = `Showing 1-${visibleCount} of ${totalProducts} products`
      }
    })
  }
})

// Product Filtering Functionality

/**
 * Initialize filter controls
 * @param {Array} products - The array of products to filter
 * @param {Function} renderCallback - Callback to render filtered products
 * @param {String} category - Current product category
 */
function initFilters(products, renderCallback, category) {
  const allProducts = products;
  
  // Show/hide category-specific filters
  showCategorySpecificFilters(category);
  
  // Brand filter
  const brandFilter = document.getElementById('brand-filter');
  if (brandFilter) {
    // Get unique brands from products
    const brands = [...new Set(allProducts.map(p => p.brand))].sort();
    
    // Add brand options
    brandFilter.innerHTML = '<option value="">All Brands</option>';
    brands.forEach(brand => {
      brandFilter.innerHTML += `<option value="${brand}">${brand}</option>`;
    });
    
    brandFilter.addEventListener('change', () => applyFilters(allProducts, renderCallback, category));
  }
  
  // Price filter
  const priceFilter = document.getElementById('price-filter');
  const priceDisplay = document.getElementById('price-display');
  
  if (priceFilter && priceDisplay) {
    // Set max price based on products
    const maxPrice = Math.max(...allProducts.map(p => p.price));
    priceFilter.max = maxPrice;
    priceFilter.value = maxPrice;
    
    // Update price display
    priceDisplay.textContent = maxPrice.toLocaleString() + ' DZD';
    
    priceFilter.addEventListener('input', function() {
      priceDisplay.textContent = parseInt(this.value).toLocaleString() + ' DZD';
      applyFilters(allProducts, renderCallback, category);
    });
  }
  
  // Add event listeners to all filter options (checkboxes)
  const allCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
  allCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const span = this.nextElementSibling;
      if (span) {
        if (this.checked) {
          span.classList.add('bg-primary', 'text-white', 'border-primary');
        } else {
          span.classList.remove('bg-primary', 'text-white', 'border-primary');
        }
      }
    });
  });
  
  // Reset filters button
  const resetButton = document.getElementById('reset-filters');
  if (resetButton) {
    resetButton.addEventListener('click', function() {
      // Reset brand filter
      if (brandFilter) brandFilter.value = '';
      
      // Reset price filter
      if (priceFilter && priceDisplay) {
        const maxPrice = Math.max(...allProducts.map(p => p.price));
        priceFilter.value = maxPrice;
        priceDisplay.textContent = maxPrice.toLocaleString() + ' DZD';
      }
      
      // Reset checkboxes
      allCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
        const span = checkbox.nextElementSibling;
        if (span) {
          span.classList.remove('bg-primary', 'text-white', 'border-primary');
        }
      });
      
      // Apply filters (reset)
      applyFilters(allProducts, renderCallback, category);
      
      // Show notification
      showNotification('Filters have been reset', 'bg-blue-600');
    });
  }
  
  // Initial filter application
  applyFilters(allProducts, renderCallback, category);
}

/**
 * Show or hide category-specific filters based on current category
 * @param {String} category - Current product category
 */
function showCategorySpecificFilters(category) {
  // Get all filter sections
  const storageFilterSection = document.getElementById('storage-filter-section');
  const ramFilterSection = document.getElementById('ram-filter-section');
  const osFilterSection = document.getElementById('os-filter-section');
  const processorFilterSection = document.getElementById('processor-filter-section');
  
  if (storageFilterSection) {
    // Show storage filter for devices that typically have storage options
    storageFilterSection.style.display = 
      ['phones', 'tablets', 'laptops', 'consoles'].includes(category) ? 'block' : 'none';
  }
  
  if (ramFilterSection) {
    // Show RAM filter for devices that typically have RAM options
    ramFilterSection.style.display = 
      ['phones', 'tablets', 'laptops'].includes(category) ? 'block' : 'none';
  }
  
  if (osFilterSection) {
    // Show OS filter only for phones, tablets and laptops
    osFilterSection.style.display = 
      ['phones', 'tablets', 'laptops'].includes(category) ? 'block' : 'none';
  }
  
  if (processorFilterSection) {
    // Show processor filter only for laptops
    processorFilterSection.style.display = 
      category === 'laptops' ? 'block' : 'none';
  }
}

/**
 * Apply filters to products
 * @param {Array} products - All products to filter
 * @param {Function} renderCallback - Callback to render filtered products
 * @param {String} category - Current product category
 */
function applyFilters(products, renderCallback, category) {
  // Get filter values
  const brandFilter = document.getElementById('brand-filter');
  const selectedBrand = brandFilter ? brandFilter.value : '';
  
  const priceFilter = document.getElementById('price-filter');
  const maxPrice = priceFilter ? parseInt(priceFilter.value) : Infinity;
  
  // Get all checked storage options
  const storageOptions = [];
  document.querySelectorAll('#storage-filter-section .filter-option input:checked').forEach(checkbox => {
    storageOptions.push(checkbox.nextElementSibling.textContent.trim());
  });
  
  // Get all checked RAM options
  const ramOptions = [];
  document.querySelectorAll('#ram-filter-section .filter-option input:checked').forEach(checkbox => {
    ramOptions.push(checkbox.nextElementSibling.textContent.trim());
  });
  
  // Get all checked OS options
  const osOptions = [];
  document.querySelectorAll('#os-filter-section .filter-option input:checked').forEach(checkbox => {
    osOptions.push(checkbox.nextElementSibling.textContent.trim());
  });
  
  // Get all checked processor options
  const processorOptions = [];
  document.querySelectorAll('#processor-filter-section .filter-option input:checked').forEach(checkbox => {
    processorOptions.push(checkbox.nextElementSibling.textContent.trim());
  });
  
  // Filter products
  const filteredProducts = products.filter(product => {
    // Brand filter
    if (selectedBrand && product.brand !== selectedBrand) {
      return false;
    }
    
    // Price filter
    if (product.price > maxPrice) {
      return false;
    }
    
    // Storage filter
    if (storageOptions.length > 0) {
      const hasMatchingStorage = storageOptions.some(option => 
        product.specs.toLowerCase().includes(option.toLowerCase())
      );
      if (!hasMatchingStorage) {
        return false;
      }
    }
    
    // RAM filter
    if (ramOptions.length > 0) {
      const hasMatchingRAM = ramOptions.some(option => 
        product.specs.toLowerCase().includes(option.toLowerCase())
      );
      if (!hasMatchingRAM) {
        return false;
      }
    }
    
    // OS filter
    if (osOptions.length > 0) {
      const hasMatchingOS = osOptions.some(option => 
        product.specs.toLowerCase().includes(option.toLowerCase()) || 
        product.description.toLowerCase().includes(option.toLowerCase())
      );
      if (!hasMatchingOS) {
        return false;
      }
    }
    
    // Processor filter
    if (processorOptions.length > 0) {
      const hasMatchingProcessor = processorOptions.some(option => 
        product.specs.toLowerCase().includes(option.toLowerCase()) || 
        product.description.toLowerCase().includes(option.toLowerCase())
      );
      if (!hasMatchingProcessor) {
        return false;
      }
    }
    
    return true;
  });
  
  // Update product count and render
  updateProductCount(filteredProducts.length, products.length);
  renderCallback(filteredProducts);
  
  // Show notification
  showNotification('Filters applied');
}

/**
 * Update the product count display
 * @param {Number} visibleCount - Number of visible products
 * @param {Number} totalCount - Total number of products
 */
function updateProductCount(visibleCount, totalCount) {
  const countDisplay = document.querySelector('.products-grid .text-gray-600.dark\\:text-gray-400');
  if (countDisplay) {
    countDisplay.textContent = `Showing 1-${visibleCount} of ${totalCount} products`;
  }
}

/**
 * Show a notification to the user
 * @param {String} message - The message to display
 * @param {String} bgColor - Background color class for the notification
 */
function showNotification(message, bgColor = 'bg-primary') {
  const notification = document.createElement('div');
  notification.className = `fixed bottom-4 right-4 ${bgColor} text-white py-2 px-4 rounded-lg shadow-lg z-50`;
  notification.textContent = message;
  
  // Apply initial styles
  notification.style.opacity = '0';
  notification.style.transform = 'translateY(10px)';
  notification.style.transition = 'all 0.3s ease';
  
  // Add to DOM
  document.body.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);
  
  // Remove after delay
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(10px)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Export functions
window.productFilters = {
  initFilters,
  applyFilters,
  showNotification
};

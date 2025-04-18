// Main JavaScript file for tontonPhone website

// Dark Mode Functionality
document.addEventListener('DOMContentLoaded', function() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  
  // Check for saved dark mode preference
  if (localStorage.getItem('darkMode') === 'true') {
    document.documentElement.classList.add('dark');
  }
  
  // Toggle dark mode
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      const isDarkMode = document.documentElement.classList.toggle('dark');
      localStorage.setItem('darkMode', isDarkMode);
    });
  }
  
  // User Registration and Login Functionality
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const username = document.getElementById('registerUsername').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      
      // Store user data in localStorage
      const userData = {
        username: username,
        email: email,
        password: password, // In a real app, never store passwords in localStorage
        isLoggedIn: true
      };
      
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Close modal and redirect to account page
      const registerModal = document.getElementById('registerModal');
      if (registerModal) {
        registerModal.querySelector('.modal-content').style.transform = 'translateY(-20px)';
        registerModal.querySelector('.modal-content').style.opacity = '0';
        
        setTimeout(() => {
          registerModal.classList.remove('show');
          window.location.href = 'account.html';
        }, 300);
      }
    });
  }
  
  // Login Form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      // In a real app, you would validate against server data
      // For demo purposes, retrieve existing user data if available
      const existingUserData = JSON.parse(localStorage.getItem('userData')) || {};
      
      // Update the login status
      existingUserData.isLoggedIn = true;
      
      // Only update username if it's not already set (keeping existing username)
      if (!existingUserData.username && email) {
        const usernameFromEmail = email.split('@')[0];
        existingUserData.username = existingUserData.username || usernameFromEmail;
      }
      
      // Only update email if it's not already set
      existingUserData.email = existingUserData.email || email;
      
      // Save the updated user data
      localStorage.setItem('userData', JSON.stringify(existingUserData));
      
      // Close modal and redirect to account page
      const loginModal = document.getElementById('loginModal');
      if (loginModal) {
        loginModal.querySelector('.modal-content').style.transform = 'translateY(-20px)';
        loginModal.querySelector('.modal-content').style.opacity = '0';
        
        setTimeout(() => {
          loginModal.classList.remove('show');
          window.location.href = 'account.html';
        }, 300);
      }
    });
  }
  
  // Load User Data in Account Page
  const userDisplayName = document.getElementById('userDisplayName');
  const userProfileName = document.getElementById('userProfileName');
  const userProfileEmail = document.getElementById('userProfileEmail');
  
  // Check login status and update UI for all pages
  checkLoginStatus();
  
  function checkLoginStatus() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const authButtons = document.getElementById('auth-buttons');
    const cartButton = document.getElementById('cart-button');
    
    // Update user account page if on account.html
    if (userDisplayName || userProfileName || userProfileEmail) {
      if (userData.username) {
        if (userDisplayName) userDisplayName.textContent = userData.username;
        if (userProfileName) userProfileName.textContent = userData.username;
        if (userProfileEmail) userProfileEmail.textContent = userData.email || '';
      }
    }
    
    // Update auth buttons and cart visibility on all pages
    if (userData.isLoggedIn) {
      // Hide auth buttons and show cart
      if (authButtons) authButtons.classList.add('hidden');
      if (cartButton) cartButton.classList.remove('hidden');
    } else {
      // Show auth buttons and hide cart
      if (authButtons) authButtons.classList.remove('hidden');
      if (cartButton) cartButton.classList.add('hidden');
    }
    
    // Update cart count badge
    updateCartCount();
  }
  
  function updateCartCount() {
    const cartCountBadge = document.getElementById('cart-count');
    if (cartCountBadge) {
      const cart = JSON.parse(localStorage.getItem('userCart') || '[]');
      cartCountBadge.textContent = cart.length.toString();
    }
  }
  
  // Add event listeners to "Add to Cart" buttons on product pages
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
  if (addToCartButtons.length > 0) {
    addToCartButtons.forEach(button => {
      button.addEventListener('click', function() {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        // Check if user is logged in
        if (!userData.isLoggedIn) {
          alert('Please log in to add items to your cart.');
          const loginBtn = document.getElementById('loginBtn');
          if (loginBtn) loginBtn.click();
          return;
        }
        
        // Get product details
        const productCard = this.closest('.product-card');
        if (!productCard) return;
        
        const name = productCard.querySelector('h3').textContent;
        const price = productCard.querySelector('.text-xl').textContent;
        const image = productCard.querySelector('img').src;
        const description = productCard.querySelector('p').textContent;
        
        // Add to cart
        addToCart(name, price, image, description);
      });
    });
  }
  
  // Function to add a product to cart
  function addToCart(name, price, image, description) {
    let cart = JSON.parse(localStorage.getItem('userCart') || '[]');
    
    // Check if item is already in cart
    const existingItemIndex = cart.findIndex(item => item.name === name);
    
    if (existingItemIndex >= 0) {
      // Increase quantity if already in cart
      cart[existingItemIndex].quantity++;
    } else {
      // Add new item to cart
      cart.push({
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
    alert(`${name} has been added to your cart.`);
  }
  
  // Filter Functionality
  const applyFiltersBtn = document.querySelector('button.w-full.bg-primary');
  if (applyFiltersBtn && (window.location.href.includes('phones.html') || window.location.href.includes('tablets.html') || window.location.href.includes('laptops.html'))) {
    applyFiltersBtn.addEventListener('click', function() {
      // Get all selected filters
      const selectedBrands = [];
      document.querySelectorAll('.form-checkbox:checked').forEach(checkbox => {
        selectedBrands.push(checkbox.nextElementSibling.textContent.trim().split(' ')[0]);
      });
      
      const priceRange = document.querySelector('.price-slider').value;
      
      // Get device-specific filters
      let additionalFilters = {};
      
      if (window.location.href.includes('laptops.html')) {
        // Get selected processors
        const selectedProcessors = [];
        document.querySelectorAll('h3:contains("Processor") + div .form-checkbox:checked').forEach(checkbox => {
          selectedProcessors.push(checkbox.nextElementSibling.textContent.trim());
        });
        
        // Get selected RAM
        const selectedRAM = [];
        document.querySelectorAll('.filter-option input:checked').forEach(checkbox => {
          selectedRAM.push(checkbox.nextElementSibling.textContent.trim());
        });
        
        // Get selected screen sizes
        const selectedScreenSizes = [];
        document.querySelectorAll('h3:contains("Screen Size") + div .form-checkbox:checked').forEach(checkbox => {
          selectedScreenSizes.push(checkbox.nextElementSibling.textContent.trim());
        });
        
        additionalFilters = {
          processors: selectedProcessors,
          ram: selectedRAM,
          screenSizes: selectedScreenSizes
        };
      } else {
        // For phones and tablets, get storage options
        const selectedStorage = [];
        document.querySelectorAll('.filter-option input:checked').forEach(checkbox => {
          selectedStorage.push(checkbox.nextElementSibling.textContent.trim());
        });
        additionalFilters = { storage: selectedStorage };
      }
      
      // For demo purposes, we'll just log the selected filters
      console.log('Selected Brands:', selectedBrands);
      console.log('Price Range:', priceRange);
      console.log('Additional Filters:', additionalFilters);
      
      // In a real app, you would filter the products based on these selections
      // For now, we'll just show an alert
      alert('Filters applied! In a real app, the product list would be filtered.');
    });
  }
  
  // Price Range Slider Functionality
  const priceSliders = document.querySelectorAll('.price-slider');
  if (priceSliders.length > 0) {
    priceSliders.forEach(priceSlider => {
      // Find the closest price display element within the same filter section
      const filterSection = priceSlider.closest('.mb-6');
      const priceDisplay = filterSection ? filterSection.querySelector('.font-medium.text-primary') : null;
      
      // Update price display on load
      if (priceDisplay) {
        updatePriceDisplay(priceSlider.value, priceDisplay);
      }
      
      // Update price display when slider changes
      priceSlider.addEventListener('input', function() {
        if (priceDisplay) {
          updatePriceDisplay(this.value, priceDisplay);
        }
      });
    });
  }
  
  function updatePriceDisplay(value, displayElement) {
    // Format the price with commas
    const formattedPrice = parseInt(value).toLocaleString() + ' DZD';
    displayElement.textContent = formattedPrice;
  }
});
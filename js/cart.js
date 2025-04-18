// Cart functionality

document.addEventListener('DOMContentLoaded', function() {
  // Initialize cart
  initCart();
  
  // Add event listeners for cart page elements if on cart page
  if (window.location.pathname.includes('cart.html')) {
    initCartPage();
  }
});

/**
 * Initialize cart functionality
 */
function initCart() {
  // Make sure cart exists in localStorage
  if (!localStorage.getItem('userCart')) {
    localStorage.setItem('userCart', JSON.stringify([]));
  }
  
  // Update cart count badge
  updateCartCount();
}

/**
 * Initialize cart page functionality
 */
function initCartPage() {
  // Render cart items
  renderCartItems();
  
  // Add event listener to checkout button
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', processCheckout);
  }
  
  // Add event listener to clear cart button
  const clearCartBtn = document.getElementById('clear-cart-btn');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', clearCart);
  }
}

/**
 * Add an item to the cart
 */
function addToCart(productId, name, price, image, description) {
  // Get current cart
  let cart = JSON.parse(localStorage.getItem('userCart') || '[]');
  
  // Check if item already exists in cart
  const existingItemIndex = cart.findIndex(item => item.id === productId);
  
  if (existingItemIndex >= 0) {
    // Increase quantity
    cart[existingItemIndex].quantity++;
  } else {
    // Add new item
    cart.push({
      id: productId,
      name: name,
      price: price,
      image: image,
      description: description,
      quantity: 1
    });
  }
  
  // Save cart
  localStorage.setItem('userCart', JSON.stringify(cart));
  
  // Update cart count badge
  updateCartCount();
  
  // Show notification
  showAddedToCartNotification(name);
}

/**
 * Remove an item from the cart
 */
function removeFromCart(productId) {
  // Get current cart
  let cart = JSON.parse(localStorage.getItem('userCart') || '[]');
  
  // Remove item
  cart = cart.filter(item => item.id !== productId);
  
  // Save cart
  localStorage.setItem('userCart', JSON.stringify(cart));
  
  // Update cart page if on cart page
  if (window.location.pathname.includes('cart.html')) {
    renderCartItems();
  }
  
  // Update cart count badge
  updateCartCount();
}

/**
 * Update item quantity in cart
 */
function updateCartItemQuantity(productId, quantity) {
  // Make sure quantity is valid
  quantity = parseInt(quantity);
  if (isNaN(quantity) || quantity < 1) {
    quantity = 1;
  }
  
  // Get current cart
  let cart = JSON.parse(localStorage.getItem('userCart') || '[]');
  
  // Find item
  const itemIndex = cart.findIndex(item => item.id === productId);
  
  if (itemIndex >= 0) {
    // Update quantity
    cart[itemIndex].quantity = quantity;
    
    // Save cart
    localStorage.setItem('userCart', JSON.stringify(cart));
    
    // Update cart page if on cart page
    if (window.location.pathname.includes('cart.html')) {
      renderCartItems();
    }
  }
}

/**
 * Clear the cart
 */
function clearCart() {
  if (confirm('Are you sure you want to clear your cart?')) {
    // Clear cart
    localStorage.setItem('userCart', JSON.stringify([]));
    
    // Update cart page if on cart page
    if (window.location.pathname.includes('cart.html')) {
      renderCartItems();
    }
    
    // Update cart count badge
    updateCartCount();
  }
}

/**
 * Update the cart count badge
 */
function updateCartCount() {
  const cartCountBadge = document.getElementById('cart-count');
  if (cartCountBadge) {
    const cart = JSON.parse(localStorage.getItem('userCart') || '[]');
    
    // Count total items (including quantities)
    const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    
    cartCountBadge.textContent = totalItems.toString();
    
    // Update visibility
    if (totalItems > 0) {
      cartCountBadge.classList.remove('hidden');
    } else {
      cartCountBadge.classList.add('hidden');
    }
  }
}

/**
 * Render cart items on the cart page
 */
function renderCartItems() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartSummaryContainer = document.getElementById('cart-summary');
  const emptyCartMessage = document.getElementById('empty-cart-message');
  
  if (!cartItemsContainer || !cartSummaryContainer || !emptyCartMessage) {
    return;
  }
  
  // Get cart items
  const cart = JSON.parse(localStorage.getItem('userCart') || '[]');
  
  if (cart.length === 0) {
    // Show empty cart message
    cartItemsContainer.classList.add('hidden');
    cartSummaryContainer.classList.add('hidden');
    emptyCartMessage.classList.remove('hidden');
    return;
  }
  
  // Hide empty cart message and show cart items
  cartItemsContainer.classList.remove('hidden');
  cartSummaryContainer.classList.remove('hidden');
  emptyCartMessage.classList.add('hidden');
  
  // Clear existing items
  cartItemsContainer.innerHTML = '';
  
  // Add cart items
  cart.forEach(item => {
    const cartItem = document.createElement('div');
    cartItem.className = 'flex flex-col md:flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700 py-4';
    
    const itemSubtotal = parseInt(item.price) * (item.quantity || 1);
    
    cartItem.innerHTML = `
      <div class="flex flex-col md:flex-row items-center mb-4 md:mb-0">
        <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-contain mr-4">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">${item.name}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">${item.description}</p>
          <p class="text-lg font-bold text-gray-900 dark:text-white mt-2">${parseInt(item.price).toLocaleString()} DZD</p>
        </div>
      </div>
      <div class="flex items-center">
        <div class="flex items-center mr-6">
          <button class="quantity-btn decrease w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-l-md flex items-center justify-center" data-id="${item.id}">
            <i class="ri-subtract-line"></i>
          </button>
          <input type="number" value="${item.quantity || 1}" min="1" class="quantity-input w-12 h-8 border-t border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-center outline-none" data-id="${item.id}">
          <button class="quantity-btn increase w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-r-md flex items-center justify-center" data-id="${item.id}">
            <i class="ri-add-line"></i>
          </button>
        </div>
        <div class="text-right">
          <p class="text-lg font-bold text-gray-900 dark:text-white">${itemSubtotal.toLocaleString()} DZD</p>
          <button class="remove-item-btn text-red-600 hover:text-red-800 text-sm flex items-center mt-1" data-id="${item.id}">
            <i class="ri-delete-bin-line mr-1"></i> Remove
          </button>
        </div>
      </div>
    `;
    
    cartItemsContainer.appendChild(cartItem);
  });
  
  // Initialize quantity buttons
  initQuantityButtons();
  
  // Initialize remove buttons
  initRemoveButtons();
  
  // Update cart summary
  updateCartSummary();
}

/**
 * Initialize quantity buttons
 */
function initQuantityButtons() {
  // Decrease buttons
  document.querySelectorAll('.quantity-btn.decrease').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      const input = document.querySelector(`.quantity-input[data-id="${productId}"]`);
      
      if (input) {
        let quantity = parseInt(input.value) - 1;
        if (quantity < 1) quantity = 1;
        
        input.value = quantity;
        updateCartItemQuantity(productId, quantity);
      }
    });
  });
  
  // Increase buttons
  document.querySelectorAll('.quantity-btn.increase').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      const input = document.querySelector(`.quantity-input[data-id="${productId}"]`);
      
      if (input) {
        let quantity = parseInt(input.value) + 1;
        
        input.value = quantity;
        updateCartItemQuantity(productId, quantity);
      }
    });
  });
  
  // Quantity inputs
  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', function() {
      const productId = this.getAttribute('data-id');
      let quantity = parseInt(this.value);
      
      if (isNaN(quantity) || quantity < 1) {
        quantity = 1;
        this.value = quantity;
      }
      
      updateCartItemQuantity(productId, quantity);
    });
  });
}

/**
 * Initialize remove buttons
 */
function initRemoveButtons() {
  document.querySelectorAll('.remove-item-btn').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      
      if (confirm('Are you sure you want to remove this item from your cart?')) {
        removeFromCart(productId);
      }
    });
  });
}

/**
 * Update the cart summary
 */
function updateCartSummary() {
  const subtotalElement = document.getElementById('cart-subtotal');
  const totalElement = document.getElementById('cart-total');
  
  if (!subtotalElement || !totalElement) {
    return;
  }
  
  // Get cart items
  const cart = JSON.parse(localStorage.getItem('userCart') || '[]');
  
  // Calculate subtotal
  const subtotal = cart.reduce((total, item) => {
    return total + parseInt(item.price) * (item.quantity || 1);
  }, 0);
  
  // Calculate shipping (free shipping over 10000)
  const shipping = subtotal > 10000 ? 0 : 1000;
  
  // Calculate total
  const total = subtotal + shipping;
  
  // Update elements
  subtotalElement.textContent = subtotal.toLocaleString() + ' DZD';
  
  const shippingElement = document.getElementById('cart-shipping');
  if (shippingElement) {
    shippingElement.textContent = shipping === 0 ? 'Free' : shipping.toLocaleString() + ' DZD';
  }
  
  totalElement.textContent = total.toLocaleString() + ' DZD';
}

/**
 * Process checkout
 */
function processCheckout() {
  // Get cart items
  const cart = JSON.parse(localStorage.getItem('userCart') || '[]');
  
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  
  // Generate order ID
  const orderId = '#ORD-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
  
  // Get current date
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Calculate total
  const total = cart.reduce((total, item) => {
    return total + parseInt(item.price) * (item.quantity || 1);
  }, 0);
  
  // Create order
  const order = {
    id: orderId,
    date: date,
    items: cart,
    total: total.toLocaleString() + ' DZD',
    status: 'Processing'
  };
  
  // Save order
  let orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
  orders.push(order);
  localStorage.setItem('userOrders', JSON.stringify(orders));
  
  // Clear cart
  localStorage.setItem('userCart', JSON.stringify([]));
  
  // Show success message
  alert('Order placed successfully! Your order ID is ' + orderId);
  
  // Redirect to orders page
  window.location.href = 'account.html?tab=orders';
}

/**
 * Show notification when an item is added to cart
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
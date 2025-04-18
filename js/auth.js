/**
 * Authentication Module for TontonPhone
 * Provides login, registration, and authentication utilities
 */

// Simple hashing function for demonstration purposes
// In a real application, use a robust library and server-side authentication
function hashPassword(password) {
  // Simple hash implementation - DO NOT use in production
  // This is just for demonstration
  let hash = 0;
  if (password.length === 0) return hash;
  
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return hash.toString(16); // Convert to hex string
}

// User registration
function registerUser(email, password, name) {
  // Get existing users
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  // Check if user already exists
  if (users.some(user => user.email === email)) {
    return {
      success: false,
      message: 'A user with this email already exists'
    };
  }
  
  // Create new user with hashed password
  const newUser = {
    id: Date.now().toString(),
    name: name,
    email: email,
    password: hashPassword(password),
    createdAt: new Date().toISOString()
  };
  
  // Add to users array
  users.push(newUser);
  
  // Save to localStorage
  localStorage.setItem('users', JSON.stringify(users));
  
  // Auto login
  setCurrentUser({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email
  });
  
  return {
    success: true,
    message: 'Registration successful'
  };
}

// User login
function loginUser(email, password) {
  // Get users
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  // Find user
  const user = users.find(u => u.email === email);
  
  // Verify user and password
  if (!user || user.password !== hashPassword(password)) {
    return {
      success: false,
      message: 'Invalid email or password'
    };
  }
  
  // Set current user (without password)
  setCurrentUser({
    id: user.id,
    name: user.name,
    email: user.email
  });
  
  return {
    success: true,
    message: 'Login successful'
  };
}

// Set current user
function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
  
  // Update UI
  updateAuthUI();
}

// Get current user
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

// Logout
function logoutUser() {
  localStorage.removeItem('currentUser');
  
  // Update UI
  updateAuthUI();
  
  return {
    success: true,
    message: 'Logout successful'
  };
}

// Update authentication UI
function updateAuthUI() {
  const currentUser = getCurrentUser();
  const authButtons = document.querySelectorAll('.auth-buttons');
  const userMenus = document.querySelectorAll('.user-menu');
  const userNameElements = document.querySelectorAll('.user-name');
  
  if (currentUser) {
    // User is logged in
    authButtons.forEach(el => el.classList.add('hidden'));
    userMenus.forEach(el => el.classList.remove('hidden'));
    userNameElements.forEach(el => el.textContent = currentUser.name);
  } else {
    // User is logged out
    authButtons.forEach(el => el.classList.remove('hidden'));
    userMenus.forEach(el => el.classList.add('hidden'));
  }
}

// Initialize authentication
document.addEventListener('DOMContentLoaded', function() {
  // Update UI based on authentication status
  updateAuthUI();
  
  // Login form handler
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = this.querySelector('input[type="email"]').value;
      const password = this.querySelector('input[type="password"]').value;
      
      const result = loginUser(email, password);
      
      if (result.success) {
        // Close modal or redirect
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
          loginModal.classList.remove('show');
        }
        
        // Show success message
        showNotification(result.message, 'bg-green-600');
      } else {
        // Show error
        showNotification(result.message, 'bg-red-600');
      }
    });
  }
  
  // Register form handler
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name = this.querySelector('input[name="name"]').value;
      const email = this.querySelector('input[type="email"]').value;
      const password = this.querySelector('input[type="password"]').value;
      
      const result = registerUser(email, password, name);
      
      if (result.success) {
        // Close modal or redirect
        const registerModal = document.getElementById('registerModal');
        if (registerModal) {
          registerModal.classList.remove('show');
        }
        
        // Show success message
        showNotification(result.message, 'bg-green-600');
      } else {
        // Show error
        showNotification(result.message, 'bg-red-600');
      }
    });
  }
  
  // Logout button handler
  const logoutButtons = document.querySelectorAll('.logout-btn');
  logoutButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      const result = logoutUser();
      
      if (result.success) {
        showNotification(result.message, 'bg-green-600');
      }
    });
  });
});

// Show notification
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

/**
 * Checks the user's login status and updates the UI accordingly
 */
function checkLoginStatus() {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const authButtons = document.getElementById('auth-buttons');
  const cartButton = document.getElementById('cart-button');
  const userDisplayName = document.getElementById('userDisplayName');
  const userProfileName = document.getElementById('userProfileName');
  const userProfileEmail = document.getElementById('userProfileEmail');
  
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
    
    // If on account page, redirect to home
    if (window.location.href.includes('account.html')) {
      window.location.href = 'index.html';
    }
  }
  
  // Update cart count badge
  updateCartCount();
}

/**
 * Updates the cart count badge
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
 * Logs the user out
 */
function logout() {
  if (confirm('Are you sure you want to log out?')) {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    userData.isLoggedIn = false;
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Show notification
    showAuthSuccess('Logged out successfully!');
    
    // Redirect to home page
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check login status on page load
  checkLoginStatus();
  
  // Initialize login form
  initLoginForm();
  
  // Initialize register form
  initRegisterForm();
  
  // Initialize logout buttons
  initLogoutButtons();
});

/**
 * Initialize login form
 */
function initLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      // In a real app, you would validate against server data
      // For demo purposes, retrieve existing user data if available
      const existingUserData = JSON.parse(localStorage.getItem('userData')) || {};
      
      // Simple validation
      if (!email || !password) {
        showAuthError('Please enter both email and password.');
        return;
      }
      
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
      
      // Show success message
      showAuthSuccess('Login successful! Redirecting...');
      
      // Close modal and redirect to account page
      const loginModal = document.getElementById('loginModal');
      if (loginModal) {
        loginModal.querySelector('.modal-content').style.transform = 'translateY(-20px)';
        loginModal.querySelector('.modal-content').style.opacity = '0';
        
        setTimeout(() => {
          loginModal.classList.remove('show');
          window.location.href = 'account.html';
        }, 1500);
      } else {
        // If not in modal, just redirect
        setTimeout(() => {
          window.location.href = 'account.html';
        }, 1500);
      }
    });
  }
}

/**
 * Initialize register form
 */
function initRegisterForm() {
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const username = document.getElementById('registerUsername').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      
      // Simple validation
      if (!username || !email || !password) {
        showAuthError('Please fill out all fields.');
        return;
      }
      
      // Store user data in localStorage
      const userData = {
        username: username,
        email: email,
        password: password, // In a real app, never store passwords in localStorage
        isLoggedIn: true,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Initialize empty user data collections
      if (!localStorage.getItem('userOrders')) {
        localStorage.setItem('userOrders', JSON.stringify([]));
      }
      
      if (!localStorage.getItem('userWishlist')) {
        localStorage.setItem('userWishlist', JSON.stringify([]));
      }
      
      if (!localStorage.getItem('userCart')) {
        localStorage.setItem('userCart', JSON.stringify([]));
      }
      
      // Show success message
      showAuthSuccess('Account created successfully! Redirecting...');
      
      // Close modal and redirect to account page
      const registerModal = document.getElementById('registerModal');
      if (registerModal) {
        registerModal.querySelector('.modal-content').style.transform = 'translateY(-20px)';
        registerModal.querySelector('.modal-content').style.opacity = '0';
        
        setTimeout(() => {
          registerModal.classList.remove('show');
          window.location.href = 'account.html';
        }, 1500);
      } else {
        // If not in modal, just redirect
        setTimeout(() => {
          window.location.href = 'account.html';
        }, 1500);
      }
    });
  }
}

/**
 * Initialize logout buttons
 */
function initLogoutButtons() {
  const logoutBtns = document.querySelectorAll('#logoutBtn, #sidebarLogoutBtn');
  if (logoutBtns.length > 0) {
    logoutBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
      });
    });
  }
}

/**
 * Show an authentication error message
 */
function showAuthError(message) {
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-red-600 text-white py-2 px-4 rounded-lg shadow-lg z-50';
  notification.innerHTML = `<i class="ri-error-warning-line mr-2"></i> ${message}`;
  notification.style.transition = 'opacity 0.3s, transform 0.3s';
  notification.style.opacity = '0';
  notification.style.transform = 'translateY(-10px)';

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-10px)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Show an authentication success message
 */
function showAuthSuccess(message) {
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg z-50';
  notification.innerHTML = `<i class="ri-check-line mr-2"></i> ${message}`;
  notification.style.transition = 'opacity 0.3s, transform 0.3s';
  notification.style.opacity = '0';
  notification.style.transform = 'translateY(-10px)';

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-10px)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Authentication functionality for TontonPhone
document.addEventListener('DOMContentLoaded', function() {
  initializeAuth();
  checkUserLogin();
});

function initializeAuth() {
  // Login form handling
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      handleLogin();
    });
  }

  // Register form handling
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      handleRegistration();
    });
  }

  // Logout button handling
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Also handle sidebar logout if it exists (account page)
  const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
  if (sidebarLogoutBtn) {
    sidebarLogoutBtn.addEventListener('click', handleLogout);
  }
}

function handleLogin() {
  // Reset error messages
  clearErrorMessages();
  
  // Get form values
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const rememberMe = document.getElementById('rememberMe')?.checked || false;
  
  // Basic validation
  let isValid = true;
  
  if (!email) {
    showError('loginEmailError', 'Email is required');
    isValid = false;
  } else if (!isValidEmail(email)) {
    showError('loginEmailError', 'Please enter a valid email address');
    isValid = false;
  }
  
  if (!password) {
    showError('loginPasswordError', 'Password is required');
    isValid = false;
  }
  
  if (isValid) {
    // For demo purposes, we'll simulate login success
    // In a real app, you would validate against a server
    
    // Create user data object
    const userData = {
      username: email.split('@')[0], // Use part of email as username for demo
      email: email,
      isLoggedIn: true,
      rememberMe: rememberMe
    };
    
    // Save to localStorage for persistence
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Close modal if open
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
      closeModal(loginModal);
    }
    
    // Update UI to reflect logged-in state
    updateUIForLoggedInUser(userData);
    
    // Redirect to account page or reload current page
    // window.location.href = 'account.html';
    window.location.reload();
  }
}

function handleRegistration() {
  // Reset error messages
  clearErrorMessages();
  
  // Get form values
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const phone = document.getElementById('phoneNumber').value.trim();
  const password = document.getElementById('registerPassword').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();
  const termsAgree = document.getElementById('termsAgree')?.checked || false;
  
  // Basic validation
  let isValid = true;
  
  if (!firstName) {
    showError('firstNameError', 'First name is required');
    isValid = false;
  }
  
  if (!lastName) {
    showError('lastNameError', 'Last name is required');
    isValid = false;
  }
  
  if (!username) {
    showError('usernameError', 'Username is required');
    isValid = false;
  }
  
  if (!email) {
    showError('registerEmailError', 'Email is required');
    isValid = false;
  } else if (!isValidEmail(email)) {
    showError('registerEmailError', 'Please enter a valid email address');
    isValid = false;
  }
  
  if (!phone) {
    showError('phoneNumberError', 'Phone number is required');
    isValid = false;
  }
  
  if (!password) {
    showError('registerPasswordError', 'Password is required');
    isValid = false;
  } else if (password.length < 8) {
    showError('registerPasswordError', 'Password must be at least 8 characters');
    isValid = false;
  }
  
  if (password !== confirmPassword) {
    showError('confirmPasswordError', 'Passwords do not match');
    isValid = false;
  }
  
  if (!termsAgree) {
    alert('You must agree to the Terms of Service and Privacy Policy');
    isValid = false;
  }
  
  if (isValid) {
    // For demo purposes, we'll simulate registration success
    // In a real app, you would send this to a server
    
    // Create user data object
    const userData = {
      firstName: firstName,
      lastName: lastName,
      username: username,
      email: email,
      phone: phone,
      isLoggedIn: true
    };
    
    // Save to localStorage for persistence
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Close modal if open
    const registerModal = document.getElementById('registerModal');
    if (registerModal) {
      closeModal(registerModal);
    }
    
    // Update UI to reflect logged-in state
    updateUIForLoggedInUser(userData);
    
    // Redirect to account page or reload current page
    // window.location.href = 'account.html';
    window.location.reload();
  }
}

function handleLogout() {
  // Remove user data from localStorage
  localStorage.removeItem('userData');
  
  // Redirect to home page
  window.location.href = 'index.html';
}

function checkUserLogin() {
  // Check if user is logged in (called on every page load)
  const userData = JSON.parse(localStorage.getItem('userData'));
  
  if (userData && userData.isLoggedIn) {
    // User is logged in, update UI
    updateUIForLoggedInUser(userData);
    
    // Check if we're on account page
    if (window.location.pathname.includes('account.html')) {
      populateAccountPage(userData);
    }
  } else {
    // User is not logged in
    updateUIForLoggedOutUser();
    
    // If on account page, redirect to home
    if (window.location.pathname.includes('account.html')) {
      window.location.href = 'index.html';
    }
  }
}

function updateUIForLoggedInUser(userData) {
  // Update login/register buttons
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  
  if (loginBtn) loginBtn.style.display = 'none';
  if (registerBtn) registerBtn.style.display = 'none';
  
  // Show user info / account link
  const navbarRight = document.querySelector('.flex.items-center.space-x-4');
  
  if (navbarRight && !document.getElementById('userDropdown')) {
    // Create user dropdown if it doesn't exist
    const userDropdown = document.createElement('div');
    userDropdown.className = 'relative dropdown';
    userDropdown.id = 'userDropdown';
    
    userDropdown.innerHTML = `
      <a href="#" class="flex items-center space-x-1 text-gray-800 dark:text-gray-200 hover:text-primary font-medium transition-colors">
        <span id="userDisplayName">${userData.username}</span>
        <i class="ri-arrow-down-s-line"></i>
      </a>
      <div class="dropdown-content">
        <a href="account.html" class="dropdown-item">My Account</a>
        <a href="#" class="dropdown-item" id="logoutBtn">Logout</a>
      </div>
    `;
    
    // Insert before cart icon
    const cartLink = document.querySelector('a[href="cart.html"]');
    if (cartLink) {
      navbarRight.insertBefore(userDropdown, cartLink);
    } else {
      navbarRight.appendChild(userDropdown);
    }
    
    // Add event listener to logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  } else if (document.getElementById('userDisplayName')) {
    // Just update the username if the dropdown already exists
    document.getElementById('userDisplayName').textContent = userData.username;
  }
}

function updateUIForLoggedOutUser() {
  // Show login/register buttons
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  
  if (loginBtn) loginBtn.style.display = '';
  if (registerBtn) registerBtn.style.display = '';
  
  // Remove user dropdown if it exists
  const userDropdown = document.getElementById('userDropdown');
  if (userDropdown) {
    userDropdown.remove();
  }
}

function populateAccountPage(userData) {
  // Update account page with user data
  const accountName = document.getElementById('accountName');
  const accountEmail = document.getElementById('accountEmail');
  
  if (accountName) {
    accountName.textContent = userData.firstName ? 
      `${userData.firstName} ${userData.lastName}` : 
      userData.username;
  }
  
  if (accountEmail) {
    accountEmail.textContent = userData.email;
  }
  
  // You can populate other fields as needed
}

// Helper functions
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
    
    // Also add error class to the input
    const inputField = errorElement.closest('div').querySelector('input');
    if (inputField) {
      inputField.classList.add('border-red-500');
    }
  }
}

function clearErrorMessages() {
  // Clear all error messages
  document.querySelectorAll('.error-message').forEach(el => {
    el.textContent = '';
  });
  
  // Remove error styling from inputs
  document.querySelectorAll('input').forEach(input => {
    input.classList.remove('border-red-500');
  });
}

function closeModal(modal) {
  // Hide modal with animation
  modal.querySelector('.modal-content').style.transform = 'translateY(-20px)';
  modal.querySelector('.modal-content').style.opacity = '0';
  
  setTimeout(() => {
    modal.classList.remove('show');
  }, 300);
} 
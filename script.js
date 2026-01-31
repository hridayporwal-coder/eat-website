// script.js - EAT Website JavaScript
console.log('EAT Website Script Loaded');

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Loaded');
    
    // Initialize based on current page
    const path = window.location.pathname;
    
    if (path.includes('order.html')) {
        initializeOrderPage();
    } else if (path.includes('login.html')) {
        initializeLoginPage();
    }
    
    // Setup common elements
    setupCommonElements();
});

// Setup common elements
function setupCommonElements() {
    // Header Shop Now buttons
    const shopButtons = document.querySelectorAll('.btn[onclick*="order.html"]');
    shopButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'order.html';
        });
    });
    
    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function() {
            showNotification('Message sent successfully!', 'success');
        });
    }
}

// Cart functionality
let cart = JSON.parse(localStorage.getItem('eat-cart')) || [];
let quantities = JSON.parse(localStorage.getItem('eat-quantities')) || {
    plate: 0,
    fork: 0,
    spoon: 0,
    'green-salad': 0,
    'happy-salad': 0,
    'protein-salad': 0
};

// Products data
const products = {
    plate: { name: "Eco-Friendly Plates", price: 19 },
    fork: { name: "Biodegradable Forks", price: 6 },
    spoon: { name: "Compostable Spoons", price: 6 },
    'green-salad': { name: "Green Salad (250g)", price: 350 },
    'happy-salad': { name: "Happy Salad (250g)", price: 350 },
    'protein-salad': { name: "Protein Pro Salad (250g)", price: 550 }
};

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('eat-cart', JSON.stringify(cart));
    localStorage.setItem('eat-quantities', JSON.stringify(quantities));
}

// Initialize order page
function initializeOrderPage() {
    console.log('Initializing order page');
    
    // Restore quantities
    restoreQuantities();
    
    // Setup quantity buttons
    document.querySelectorAll('.qty-btn.plus').forEach(button => {
        button.addEventListener('click', function() {
            const product = this.getAttribute('data-product');
            quantities[product]++;
            updateQuantityDisplay(product);
            saveCart();
        });
    });
    
    document.querySelectorAll('.qty-btn.minus').forEach(button => {
        button.addEventListener('click', function() {
            const product = this.getAttribute('data-product');
            if (quantities[product] > 0) {
                quantities[product]--;
                updateQuantityDisplay(product);
                saveCart();
            }
        });
    });
    
    // Setup add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const product = this.getAttribute('data-product');
            const quantity = quantities[product];
            
            if (quantity > 0) {
                addToCart(product, quantity);
                quantities[product] = 0;
                updateQuantityDisplay(product);
                showNotification(`${quantity} ${products[product].name} added to cart!`, 'success');
                saveCart();
            } else {
                showNotification('Please select at least 1 item', 'warning');
            }
        });
    });
    
    // Setup order form
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (cart.length === 0) {
                showNotification('Your cart is empty!', 'warning');
                return;
            }
            
            // Prepare order summary
            let orderDetails = "ORDER DETAILS:\n\n";
            let total = 0;
            
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                orderDetails += `${item.quantity} × ${item.name} - ₹${itemTotal}\n`;
            });
            
            orderDetails += `\nTOTAL: ₹${total}`;
            
            // Set hidden fields
            document.getElementById('order-details').value = orderDetails;
            document.getElementById('order-total').value = total.toFixed(2);
            
            // Show confirmation
            showOrderConfirmation();
            
            // Clear cart
            clearCart();
            
            // Submit form (Formspree will handle it)
            setTimeout(() => {
                this.submit();
            }, 1000);
        });
    }
    
    // Update cart display
    updateCartDisplay();
    
    // Setup close confirmation button
    const closeBtn = document.querySelector('#order-confirmation .btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeOrderConfirmation);
    }
}

// Restore quantities
function restoreQuantities() {
    Object.keys(quantities).forEach(product => {
        const qtyElement = document.querySelector(`.quantity[data-product="${product}"]`);
        if (qtyElement) {
            qtyElement.textContent = quantities[product];
        }
    });
}

// Update quantity display
function updateQuantityDisplay(product) {
    const qtyElement = document.querySelector(`.quantity[data-product="${product}"]`);
    if (qtyElement) {
        qtyElement.textContent = quantities[product];
    }
}

// Add to cart
function addToCart(product, quantity) {
    const existingItem = cart.find(item => item.product === product);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            product: product,
            name: products[product].name,
            price: products[product].price,
            quantity: quantity
        });
    }
    
    updateCartDisplay();
}

// Update cart display
function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartItems) return;
    
    cartItems.innerHTML = '';
    
    let total = 0;
    let itemCount = 0;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    } else {
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            itemCount += item.quantity;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>₹${item.price} × ${item.quantity}</p>
                </div>
                <div class="item-total">
                    ₹${itemTotal.toFixed(2)}
                </div>
            `;
            cartItems.appendChild(cartItem);
        });
    }
    
    if (cartCount) cartCount.textContent = `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`;
    if (cartTotal) cartTotal.textContent = total.toFixed(2);
}

// Clear cart
function clearCart() {
    cart = [];
    quantities = { 
        plate: 0, 
        fork: 0, 
        spoon: 0,
        'green-salad': 0,
        'happy-salad': 0,
        'protein-salad': 0
    };
    updateCartDisplay();
    restoreQuantities();
    saveCart();
}

// Show order confirmation
function showOrderConfirmation() {
    const confirmation = document.getElementById('order-confirmation');
    if (confirmation) {
        confirmation.classList.remove('hidden');
        window.scrollTo({ top: confirmation.offsetTop - 50, behavior: 'smooth' });
    }
}

// Close order confirmation
function closeOrderConfirmation() {
    const confirmation = document.getElementById('order-confirmation');
    if (confirmation) {
        confirmation.classList.add('hidden');
    }
}

// Initialize login page
function initializeLoginPage() {
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const loginForm = document.getElementById('login-form-section');
    const registerForm = document.getElementById('register-form-section');
    
    if (showRegister && showLogin) {
        showRegister.addEventListener('click', function(e) {
            e.preventDefault();
            if (loginForm) loginForm.classList.add('hidden');
            if (registerForm) registerForm.classList.remove('hidden');
        });
        
        showLogin.addEventListener('click', function(e) {
            e.preventDefault();
            if (registerForm) registerForm.classList.add('hidden');
            if (loginForm) loginForm.classList.remove('hidden');
        });
    }
    
    // Login form
    const loginFormElement = document.getElementById('login-form');
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Login successful!', 'success');
        });
    }
    
    // Register form
    const registerFormElement = document.getElementById('register-form');
    if (registerFormElement) {
        registerFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (password !== confirmPassword) {
                showNotification('Passwords do not match!', 'error');
                return;
            }
            
            showNotification('Account created successfully!', 'success');
            registerFormElement.reset();
            if (registerForm) registerForm.classList.add('hidden');
            if (loginForm) loginForm.classList.remove('hidden');
        });
    }
}

// Notification system
function showNotification(message, type = 'success') {
    // Remove existing
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create new
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
    `;
    
    // Set color
    if (type === 'success') notification.style.backgroundColor = '#4CAF50';
    else if (type === 'warning') notification.style.backgroundColor = '#ff9800';
    else if (type === 'error') notification.style.backgroundColor = '#f44336';
    
    document.body.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Add CSS animations if not present
if (!document.querySelector('#notification-animations')) {
    const style = document.createElement('style');
    style.id = 'notification-animations';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Make functions globally available
window.closeOrderConfirmation = closeOrderConfirmation;
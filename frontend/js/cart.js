// Cart Module - Handles shopping cart functionality
class CartManager {
    constructor() {
        this.storageKey = 'captains-signature-cart';
        this.cart = this.loadCart();
    }

    // Load cart from localStorage
    loadCart() {
        try {
            const cartData = localStorage.getItem(this.storageKey);
            return cartData ? JSON.parse(cartData) : {
                items: [],
                updatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            return {
                items: [],
                updatedAt: new Date().toISOString()
            };
        }
    }

    // Save cart to localStorage
    saveCart() {
        try {
            this.cart.updatedAt = new Date().toISOString();
            localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    }

    // Get current cart
    getCart() {
        return this.cart;
    }

    // Add item to cart
    addItem(item) {
        // Check if item already exists in cart
        const existingItemIndex = this.cart.items.findIndex(
            cartItem => cartItem.id === item.id && 
                       cartItem.size === item.size && 
                       cartItem.color === item.color
        );

        if (existingItemIndex > -1) {
            // Update quantity if item exists
            this.cart.items[existingItemIndex].quantity += item.quantity || 1;
        } else {
            // Add new item to cart
            this.cart.items.push({
                ...item,
                quantity: item.quantity || 1,
                addedAt: new Date().toISOString()
            });
        }

        this.saveCart();
        return this.cart;
    }

    // Remove item from cart
    removeItem(itemId) {
        this.cart.items = this.cart.items.filter(item => item.id !== itemId);
        this.saveCart();
        return this.cart;
    }

    // Update item quantity
    updateQuantity(itemId, change) {
        const itemIndex = this.cart.items.findIndex(item => item.id === itemId);
        
        if (itemIndex > -1) {
            const newQuantity = this.cart.items[itemIndex].quantity + change;
            
            if (newQuantity < 1) {
                // Remove item if quantity becomes 0
                this.cart.items.splice(itemIndex, 1);
            } else if (newQuantity <= 10) { // Limit max quantity to 10
                this.cart.items[itemIndex].quantity = newQuantity;
            }
            
            this.saveCart();
        }
        
        return this.cart;
    }

    // Clear entire cart
    clearCart() {
        this.cart.items = [];
        this.saveCart();
        return this.cart;
    }

    // Get cart total
    getTotal() {
        return this.cart.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    // Get item count
    getItemCount() {
        return this.cart.items.reduce((count, item) => {
            return count + item.quantity;
        }, 0);
    }

    // Check if cart is empty
    isEmpty() {
        return this.cart.items.length === 0;
    }

    // Calculate shipping cost
    calculateShipping(subtotal) {
        return subtotal > 150 ? 0 : 15;
    }

    // Calculate tax
    calculateTax(subtotal) {
        return subtotal * 0.08; // 8% tax rate
    }

    // Calculate total with tax and shipping
    calculateTotal(subtotal) {
        const shipping = this.calculateShipping(subtotal);
        const tax = this.calculateTax(subtotal);
        return subtotal + shipping + tax;
    }

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    // Show notification
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Create singleton instance
const cartManager = new CartManager();

// Global cart functions for use in HTML
function addToCart(item) {
    return cartManager.addItem(item);
}

function removeFromCart(itemId) {
    return cartManager.removeItem(itemId);
}

function updateQuantity(itemId, change) {
    return cartManager.updateQuantity(itemId, change);
}

function clearCart() {
    return cartManager.clearCart();
}

function getCart() {
    return cartManager.getCart();
}

function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const itemCount = cartManager.getItemCount();
    
    cartCountElements.forEach(element => {
        element.textContent = itemCount;
        element.style.display = itemCount > 0 ? 'flex' : 'none';
    });
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', updateCartCount);

// Export for use in other modules
window.cartManager = cartManager;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.clearCart = clearCart;
window.getCart = getCart;
window.updateCartCount = updateCartCount;
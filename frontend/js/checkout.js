// Checkout Module - Handles checkout form validation and submission
class CheckoutManager {
    constructor() {
        this.form = document.getElementById('checkout-form');
        this.loadingModal = document.getElementById('loading-modal');
        this.apiService = apiService;
        this.cartManager = cartManager;
        
        this.validationRules = {
            'full-name': {
                required: true,
                pattern: /^[A-Za-z\s]{2,50}$/,
                message: 'Please enter a valid full name (2-50 characters)'
            },
            'email': {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
            },
            'phone': {
                required: true,
                pattern: /^[\+]?[1-9][\d]{0,15}$/,
                message: 'Please enter a valid phone number'
            },
            'address': {
                required: true,
                pattern: /^[A-Za-z0-9\s,.-]{5,100}$/,
                message: 'Please enter a valid address'
            },
            'city': {
                required: true,
                pattern: /^[A-Za-z\s]{2,50}$/,
                message: 'Please enter a valid city name'
            },
            'state': {
                required: true,
                message: 'Please select a state'
            },
            'zip': {
                required: true,
                pattern: /^\d{5}(-\d{4})?$/,
                message: 'Please enter a valid ZIP code'
            }
        };
    }

    // Initialize checkout functionality
    init() {
        if (this.form) {
            this.setupValidation();
            this.setupFormSubmission();
        }
    }

    // Setup real-time validation
    setupValidation() {
        Object.keys(this.validationRules).forEach(fieldId => {
            const input = document.getElementById(fieldId);
            const errorElement = document.getElementById(`${fieldId}-error`);
            
            if (input && errorElement) {
                // Validate on blur
                input.addEventListener('blur', () => {
                    this.validateField(input, errorElement);
                });
                
                // Clear error on input
                input.addEventListener('input', () => {
                    if (this.validateField(input, errorElement)) {
                        errorElement.textContent = '';
                    }
                });
            }
        });
    }

    // Validate a single field
    validateField(input, errorElement) {
        const rules = this.validationRules[input.id];
        const value = input.value.trim();
        
        if (rules.required && !value) {
            errorElement.textContent = 'This field is required';
            input.classList.add('error');
            return false;
        }
        
        if (rules.pattern && value && !rules.pattern.test(value)) {
            errorElement.textContent = rules.message;
            input.classList.add('error');
            return false;
        }
        
        if (input.id === 'state' && value === '') {
            errorElement.textContent = rules.message;
            input.classList.add('error');
            return false;
        }
        
        input.classList.remove('error');
        errorElement.textContent = '';
        return true;
    }

    // Validate entire form
    validateForm() {
        let isValid = true;
        
        Object.keys(this.validationRules).forEach(fieldId => {
            const input = document.getElementById(fieldId);
            const errorElement = document.getElementById(`${fieldId}-error`);
            
            if (input && errorElement) {
                if (!this.validateField(input, errorElement)) {
                    isValid = false;
                }
            }
        });
        
        return isValid;
    }

    // Setup form submission
    setupFormSubmission() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleCheckout();
        });
    }

    // Handle checkout process
    async handleCheckout() {
        // Validate form
        if (!this.validateForm()) {
            this.showNotification('Please fix the errors in the form', 'error');
            return;
        }
        
        // Check if cart is empty
        if (this.cartManager.isEmpty()) {
            this.showNotification('Your cart is empty', 'error');
            return;
        }
        
        // Show loading modal
        this.showLoading(true);
        
        try {
            // Prepare order data
            const orderData = this.prepareOrderData();
            
            // Submit order
            const result = await this.apiService.submitOrder(orderData);
            
            // Handle success
            if (result.success) {
                // Store shipping address for success page
                this.storeShippingAddress();
                
                // Clear cart
                this.cartManager.clearCart();
                
                // Redirect to success page
                setTimeout(() => {
                    window.location.href = 'success.html';
                }, 1500);
                
            } else {
                throw new Error(result.message || 'Order submission failed');
            }
            
        } catch (error) {
            console.error('Checkout error:', error);
            this.showNotification(
                error.message || 'Failed to process order. Please try again.',
                'error'
            );
            
        } finally {
            // Hide loading modal
            this.showLoading(false);
        }
    }

    // Prepare order data from form and cart
    prepareOrderData() {
        const cart = this.cartManager.getCart();
        const formData = this.getFormData();
        
        return {
            orderId: `CS-${Date.now().toString().slice(-8)}`,
            customer: {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone
            },
            shipping: {
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zip
            },
            items: cart.items.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size,
                color: item.color
            })),
            subtotal: this.cartManager.getTotal(),
            shippingCost: this.cartManager.calculateShipping(this.cartManager.getTotal()),
            tax: this.cartManager.calculateTax(this.cartManager.getTotal()),
            total: this.cartManager.calculateTotal(this.cartManager.getTotal()),
            paymentMethod: this.getSelectedPaymentMethod(),
            orderDate: new Date().toISOString(),
            status: 'processing'
        };
    }

    // Get form data
    getFormData() {
        return {
            fullName: document.getElementById('full-name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            address: document.getElementById('address').value.trim(),
            city: document.getElementById('city').value.trim(),
            state: document.getElementById('state').value,
            zip: document.getElementById('zip').value.trim()
        };
    }

    // Get selected payment method
    getSelectedPaymentMethod() {
        const activeMethod = document.querySelector('.payment-method.active');
        return activeMethod ? activeMethod.querySelector('span').textContent : 'Stripe';
    }

    // Store shipping address in session storage for success page
    storeShippingAddress() {
        const formData = this.getFormData();
        const address = `${formData.fullName}, ${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`;
        sessionStorage.setItem('shippingAddress', address);
    }

    // Show/hide loading modal
    showLoading(show) {
        if (this.loadingModal) {
            if (show) {
                this.loadingModal.classList.add('active');
            } else {
                setTimeout(() => {
                    this.loadingModal.classList.remove('active');
                }, 500);
            }
        }
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

// Initialize checkout manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const checkoutManager = new CheckoutManager();
    
    // Only initialize on checkout page
    if (document.getElementById('checkout-form')) {
        checkoutManager.init();
    }
});

// Global function for form submission from HTML
async function handleCheckout(e) {
    e.preventDefault();
    
    const checkoutManager = new CheckoutManager();
    await checkoutManager.handleCheckout();
}

// Initialize validation from HTML
function initValidation() {
    const checkoutManager = new CheckoutManager();
    checkoutManager.setupValidation();
}

// Export for use in HTML
window.handleCheckout = handleCheckout;
window.initValidation = initValidation;
window.CheckoutManager = CheckoutManager;
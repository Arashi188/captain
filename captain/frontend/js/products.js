// Products Module - Handles product listing and display
class ProductManager {
    constructor() {
        this.apiService = apiService;
        this.currentProducts = [];
    }

    // Initialize product loading
    async init() {
        await this.loadAllProducts();
    }

    // Load all products and display by category
    async loadAllProducts() {
        try {
            const products = await this.apiService.getProducts();
            this.currentProducts = products;
            
            this.displayProductsByCategory('clothing', 'clothing-products');
            this.displayProductsByCategory('shoes', 'shoes-products');
            this.displayProductsByCategory('accessories', 'accessories-products');
            
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Failed to load products. Please try again later.');
        }
    }

    // Display products filtered by category
    displayProductsByCategory(category, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const filteredProducts = this.currentProducts.filter(
            product => product.category === category
        );
        
        if (filteredProducts.length === 0) {
            container.innerHTML = '<p class="no-products">No products found in this category.</p>';
            return;
        }
        
        container.innerHTML = filteredProducts.map(product => 
            this.createProductCard(product)
        ).join('');
        
        // Add event listeners to "Add to Cart" buttons
        this.addCartEventListeners();
    }

    // Create HTML for a product card
    createProductCard(product) {
        return `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    ${product.rating >= 4.5 ? '<span class="product-badge">Premium</span>' : ''}
                    <div class="product-actions">
                        <button class="action-btn quick-view" title="Quick View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn add-to-cart" title="Add to Cart">
                            <i class="fas fa-shopping-bag"></i>
                        </button>
                        <button class="action-btn add-wishlist" title="Add to Wishlist">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <p class="product-category">${this.formatCategory(product.category)}</p>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-rating">
                        ${this.generateStarRating(product.rating)}
                        <span class="rating-count">(${product.reviews})</span>
                    </div>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                </div>
            </div>
        `;
    }

    // Format category name
    formatCategory(category) {
        const categories = {
            'clothing': 'Men\'s Clothing',
            'shoes': 'Footwear',
            'accessories': 'Accessories'
        };
        return categories[category] || category;
    }

    // Generate star rating HTML
    generateStarRating(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        
        return `<span class="stars">${stars}</span>`;
    }

    // Add event listeners to product cards
    addCartEventListeners() {
        document.querySelectorAll('.product-card .add-to-cart').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation();
                const productCard = e.target.closest('.product-card');
                const productId = productCard.getAttribute('data-id');
                
                await this.addProductToCart(productId);
            });
        });
        
        document.querySelectorAll('.product-card .quick-view').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation();
                const productCard = e.target.closest('.product-card');
                const productId = productCard.getAttribute('data-id');
                
                this.showQuickView(productId);
            });
        });
        
        document.querySelectorAll('.product-card .add-wishlist').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showNotification('Added to wishlist!', 'info');
            });
        });
        
        // Make entire product card clickable (navigates to product page)
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't navigate if clicking on action buttons
                if (e.target.closest('.product-actions')) {
                    return;
                }
                
                const productId = card.getAttribute('data-id');
                window.location.href = `product.html?id=${productId}`;
            });
        });
    }

    // Add product to cart
    async addProductToCart(productId) {
        try {
            const product = await this.apiService.getProduct(productId);
            if (!product) {
                throw new Error('Product not found');
            }
            
            const cartItem = {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            };
            
            addToCart(cartItem);
            updateCartCount();
            
            this.showNotification(`${product.name} added to cart!`, 'success');
            
        } catch (error) {
            console.error('Error adding product to cart:', error);
            this.showNotification('Failed to add product to cart', 'error');
        }
    }

    // Show quick view modal
    async showQuickView(productId) {
        try {
            const product = await this.apiService.getProduct(productId);
            if (!product) return;
            
            // Create and show quick view modal
            const modalHTML = `
                <div class="modal quick-view-modal active">
                    <div class="modal-content">
                        <button class="modal-close">&times;</button>
                        <div class="quick-view-content">
                            <div class="quick-view-image">
                                <img src="${product.image}" alt="${product.name}">
                            </div>
                            <div class="quick-view-info">
                                <h2>${product.name}</h2>
                                <p class="price">$${product.price.toFixed(2)}</p>
                                <p class="description">${product.description}</p>
                                <div class="quick-view-actions">
                                    <button class="btn btn-primary add-to-cart-quick" data-id="${product.id}">
                                        <i class="fas fa-shopping-bag"></i> Add to Cart
                                    </button>
                                    <a href="product.html?id=${product.id}" class="btn btn-secondary">
                                        View Details
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Add modal to body
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            // Add event listeners
            const modal = document.querySelector('.quick-view-modal');
            const closeBtn = modal.querySelector('.modal-close');
            const addToCartBtn = modal.querySelector('.add-to-cart-quick');
            
            closeBtn.addEventListener('click', () => {
                modal.remove();
            });
            
            addToCartBtn.addEventListener('click', async () => {
                await this.addProductToCart(product.id);
                modal.remove();
            });
            
            // Close on outside click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
            
        } catch (error) {
            console.error('Error showing quick view:', error);
            this.showNotification('Failed to load product details', 'error');
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

    // Show error message
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message global';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        
        // Insert at the beginning of the body
        document.body.insertBefore(errorDiv, document.body.firstChild);
        
        // Remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Initialize product manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const productManager = new ProductManager();
    
    // Only initialize on pages that need products
    if (document.querySelector('.products-grid')) {
        productManager.init();
    }
});

// Export for use in other modules
window.ProductManager = ProductManager;
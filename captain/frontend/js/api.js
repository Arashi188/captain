// API Service - Handles all API requests
class APIService {
    constructor() {
        this.baseURL = 'https://api.captains-signature.com';
        // For development, use mock data
        this.mockMode = true;
    }

    // Simulate API delay
    async delay(ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Generate mock products
    generateMockProducts() {
        return [
            {
                id: '1',
                name: 'Premium Wool Blend Suit',
                category: 'clothing',
                price: 299.99,
                description: 'Crafted from premium wool blend, this suit offers exceptional comfort and style.',
                image: 'assets/images/product1.jpg',
                images: [
                    'assets/images/product1.jpg',
                    'assets/images/product2.jpg',
                    'assets/images/product3.jpg',
                    'assets/images/product4.jpg'
                ],
                sizes: ['S', 'M', 'L', 'XL'],
                colors: ['Navy Blue', 'Charcoal', 'Black'],
                inStock: true,
                rating: 4.8,
                reviews: 42
            },
            {
                id: '2',
                name: 'Classic Leather Oxford Shoes',
                category: 'shoes',
                price: 189.99,
                description: 'Handcrafted leather oxford shoes with premium detailing.',
                image: 'assets/images/product2.jpg',
                images: [
                    'assets/images/product2.jpg',
                    'assets/images/product3.jpg'
                ],
                sizes: ['8', '9', '10', '11', '12'],
                colors: ['Brown', 'Black'],
                inStock: true,
                rating: 4.7,
                reviews: 31
            },
            {
                id: '3',
                name: 'Cashmere Wool Scarf',
                category: 'accessories',
                price: 89.99,
                description: 'Luxurious cashmere wool scarf for ultimate comfort.',
                image: 'assets/images/product3.jpg',
                images: [
                    'assets/images/product3.jpg',
                    'assets/images/product4.jpg'
                ],
                colors: ['Navy', 'Gray', 'Beige'],
                inStock: true,
                rating: 4.9,
                reviews: 28
            },
            {
                id: '4',
                name: 'Designer Wool Coat',
                category: 'clothing',
                price: 349.99,
                description: 'Winter wool coat with premium insulation.',
                image: 'assets/images/product4.jpg',
                images: [
                    'assets/images/product4.jpg',
                    'assets/images/product1.jpg'
                ],
                sizes: ['S', 'M', 'L', 'XL'],
                colors: ['Black', 'Camel'],
                inStock: true,
                rating: 4.6,
                reviews: 19
            },
            {
                id: '5',
                name: 'Leather Loafers',
                category: 'shoes',
                price: 159.99,
                description: 'Comfortable leather loafers for casual occasions.',
                image: 'assets/images/product5.jpg',
                images: [
                    'assets/images/product5.jpg'
                ],
                sizes: ['8', '9', '10', '11'],
                colors: ['Brown', 'Black'],
                inStock: true,
                rating: 4.5,
                reviews: 24
            },
            {
                id: '6',
                name: 'Leather Belt',
                category: 'accessories',
                price: 59.99,
                description: 'Genuine leather belt with polished buckle.',
                image: 'assets/images/product6.jpg',
                images: [
                    'assets/images/product6.jpg'
                ],
                sizes: ['S', 'M', 'L'],
                colors: ['Black', 'Brown'],
                inStock: true,
                rating: 4.4,
                reviews: 16
            }
        ];
    }

    // Get all products
    async getProducts() {
        try {
            await this.delay(300);
            
            if (this.mockMode) {
                return this.generateMockProducts();
            }
            
            const response = await fetch(`${this.baseURL}/api/products`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            // Fallback to mock data
            return this.generateMockProducts();
        }
    }

    // Get single product by ID
    async getProduct(id) {
        try {
            await this.delay(300);
            
            if (this.mockMode) {
                const products = this.generateMockProducts();
                return products.find(product => product.id === id) || null;
            }
            
            const response = await fetch(`${this.baseURL}/api/products/${id}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error fetching product ${id}:`, error);
            // Fallback to mock data
            const products = this.generateMockProducts();
            return products.find(product => product.id === id) || null;
        }
    }

    // Submit checkout order
    async submitOrder(orderData) {
        try {
            await this.delay(1000); // Simulate processing time
            
            if (this.mockMode) {
                // Simulate successful order
                return {
                    success: true,
                    orderId: `CS-${Date.now().toString().slice(-8)}`,
                    message: 'Order placed successfully',
                    timestamp: new Date().toISOString()
                };
            }
            
            const response = await fetch(`${this.baseURL}/api/cart/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error submitting order:', error);
            throw error;
        }
    }

    // Filter products by category
    async getProductsByCategory(category) {
        const products = await this.getProducts();
        return products.filter(product => product.category === category);
    }

    // Search products
    async searchProducts(query) {
        const products = await this.getProducts();
        const lowerQuery = query.toLowerCase();
        
        return products.filter(product => 
            product.name.toLowerCase().includes(lowerQuery) ||
            product.description.toLowerCase().includes(lowerQuery) ||
            product.category.toLowerCase().includes(lowerQuery)
        );
    }
}

// Create singleton instance
const apiService = new APIService();
const { Firestore } = require('@google-cloud/firestore');
const config = require('./config');

class Database {
    constructor() {
        this.db = new Firestore({
            projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        });
        
        // Collection references
        this.productsCollection = this.db.collection('products');
        this.cartCollection = this.db.collection('cart');
        this.shopsCollection = this.db.collection('shops');
    }

    async init() {
        try {
            // Test connection
            await this.db.settings({});
            console.log('✅ Connected to Firestore database');
            
            // No need to create tables in Firestore - they're created automatically
            console.log('✅ Database ready for use');
        } catch (error) {
            console.error('❌ Error connecting to Firestore:', error);
            throw error;
        }
    }

    // Get platform statistics
    async getPlatformStats() {
        try {
            const snapshot = await this.productsCollection.get();
            const stats = {};
            
            snapshot.docs.forEach(doc => {
                const product = doc.data();
                const platform = product.platform || 'Unknown';
                
                if (!stats[platform]) {
                    stats[platform] = { total: 0, in_stock: 0 };
                }
                stats[platform].total++;
                if (product.stock > 0) {
                    stats[platform].in_stock++;
                }
            });
            
            return Object.entries(stats).map(([platform, counts]) => ({
                platform,
                total: counts.total,
                in_stock: counts.in_stock
            }));
        } catch (error) {
            console.error('Error getting platform stats:', error);
            return [];
        }
    }

    // Get category statistics for a specific platform
    async getCategoryStats(platform) {
        try {
            const snapshot = await this.productsCollection
                .where('platform', '==', platform)
                .get();
            
            const stats = {};
            
            snapshot.docs.forEach(doc => {
                const product = doc.data();
                const category = product.platform_category || 'Uncategorized';
                
                if (!stats[category]) {
                    stats[category] = { total: 0, in_stock: 0 };
                }
                stats[category].total++;
                if (product.stock > 0) {
                    stats[category].in_stock++;
                }
            });
            
            return Object.entries(stats).map(([platform_category, counts]) => ({
                platform_category,
                total: counts.total,
                in_stock: counts.in_stock
            }));
        } catch (error) {
            console.error('Error getting category stats:', error);
            return [];
        }
    }

    // Get price range statistics
    async getPriceRangeStats() {
        try {
            const snapshot = await this.productsCollection.get();
            const priceRanges = config.PRICE_RANGES.map(range => ({
                ...range,
                total: 0,
                in_stock: 0
            }));
            
            snapshot.docs.forEach(doc => {
                const product = doc.data();
                const price = product.price || 0;
                
                // Find which price range this product belongs to
                for (const range of priceRanges) {
                    if (price >= range.min && price <= range.max) {
                        range.total++;
                        if (product.stock > 0) {
                            range.in_stock++;
                        }
                        break;
                    }
                }
            });
            
            // Only return ranges that have products
            return priceRanges
                .filter(range => range.total > 0)
                .map(range => ({
                    price_range: range.label,
                    total: range.total,
                    in_stock: range.in_stock,
                    min: range.min,
                    max: range.max
                }));
        } catch (error) {
            console.error('Error getting price range stats:', error);
            return [];
        }
    }

    // Get products with filters and pagination
    async getProducts(filters = {}, page = 1) {
        try {
            const limit = config.PRODUCTS_PER_PAGE;
            const offset = (page - 1) * limit;
            
            let query = this.productsCollection;
            
            // Apply filters
            if (filters.platform) {
                query = query.where('platform', '==', filters.platform);
            }
            
            if (filters.category) {
                query = query.where('platform_category', '==', filters.category);
            }
            
            if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
                if (filters.priceMin !== undefined) {
                    query = query.where('price', '>=', filters.priceMin);
                }
                if (filters.priceMax !== undefined) {
                    query = query.where('price', '<=', filters.priceMax);
                }
            }
            
            if (filters.inStock) {
                query = query.where('stock', '>', 0);
            }
            
            // Get total count for pagination
            const totalSnapshot = await query.get();
            const total = totalSnapshot.size;
            
            // Apply pagination
            query = query.limit(limit).offset(offset);
            
            // Execute query
            const snapshot = await query.get();
            const products = [];
            
            snapshot.docs.forEach(doc => {
                products.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Handle search filter (Firestore doesn't support full-text search natively)
            let filteredProducts = products;
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                filteredProducts = products.filter(product => 
                    (product.name && product.name.toLowerCase().includes(searchTerm)) ||
                    (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                    (product.platform_category && product.platform_category.toLowerCase().includes(searchTerm))
                );
            }
            
            const totalPages = Math.ceil(total / limit);
            
            return {
                products: filteredProducts,
                pagination: {
                    page,
                    totalPages,
                    total: filteredProducts.length,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            console.error('Error getting products:', error);
            return { products: [], pagination: { page: 1, totalPages: 0, total: 0, hasNext: false, hasPrev: false } };
        }
    }

    // Get single product by ID
    async getProduct(id) {
        try {
            const doc = await this.productsCollection.doc(id.toString()).get();
            
            if (!doc.exists) {
                return null;
            }
            
            return {
                id: doc.id,
                ...doc.data()
            };
        } catch (error) {
            console.error('Error getting product:', error);
            return null;
        }
    }

    // Cart operations
    async addToCart(userId, productId, quantity = 1) {
        try {
            // Check if item already exists in cart
            const existingSnapshot = await this.cartCollection
                .where('user_id', '==', userId.toString())
                .where('product_id', '==', productId.toString())
                .get();
            
            if (!existingSnapshot.empty) {
                // Update existing item
                const doc = existingSnapshot.docs[0];
                const currentQuantity = doc.data().quantity || 0;
                
                await doc.ref.update({
                    quantity: currentQuantity + quantity,
                    updated_at: new Date()
                });
                
                return doc.id;
            } else {
                // Add new item
                const docRef = await this.cartCollection.add({
                    user_id: userId.toString(),
                    product_id: productId.toString(),
                    quantity: quantity,
                    created_at: new Date(),
                    updated_at: new Date()
                });
                
                return docRef.id;
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    }

    async getCart(userId) {
        try {
            const snapshot = await this.cartCollection
                .where('user_id', '==', userId.toString())
                .get();
            
            const cartItems = [];
            
            for (const doc of snapshot.docs) {
                const cartData = doc.data();
                const product = await this.getProduct(cartData.product_id);
                
                if (product) {
                    cartItems.push({
                        cart_id: doc.id,
                        product_id: cartData.product_id,
                        quantity: cartData.quantity,
                        name: product.name,
                        price: product.price,
                        stock: product.stock
                    });
                }
            }
            
            return cartItems;
        } catch (error) {
            console.error('Error getting cart:', error);
            return [];
        }
    }

    async updateCartQuantity(cartId, quantity) {
        try {
            await this.cartCollection.doc(cartId).update({
                quantity: quantity,
                updated_at: new Date()
            });
            return true;
        } catch (error) {
            console.error('Error updating cart quantity:', error);
            return false;
        }
    }

    async removeFromCart(cartId) {
        try {
            await this.cartCollection.doc(cartId).delete();
            return true;
        } catch (error) {
            console.error('Error removing from cart:', error);
            return false;
        }
    }

    async clearCart(userId) {
        try {
            const snapshot = await this.cartCollection
                .where('user_id', '==', userId.toString())
                .get();
            
            const batch = this.db.batch();
            
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
            return true;
        } catch (error) {
            console.error('Error clearing cart:', error);
            return false;
        }
    }

    async getCartItemCount(userId) {
        try {
            const snapshot = await this.cartCollection
                .where('user_id', '==', userId.toString())
                .get();
            
            let totalItems = 0;
            snapshot.docs.forEach(doc => {
                totalItems += doc.data().quantity || 0;
            });
            
            return totalItems;
        } catch (error) {
            console.error('Error getting cart item count:', error);
            return 0;
        }
    }

    // Admin functions
    async getStats() {
        try {
            const [productsSnapshot, cartSnapshot] = await Promise.all([
                this.productsCollection.get(),
                this.cartCollection.get()
            ]);
            
            const totalProducts = productsSnapshot.size;
            const totalCartItems = cartSnapshot.size;
            
            // Get products in stock
            const inStockSnapshot = await this.productsCollection
                .where('stock', '>', 0)
                .get();
            const inStock = inStockSnapshot.size;
            
            return {
                totalProducts,
                inStock,
                outOfStock: totalProducts - inStock,
                totalCartItems
            };
        } catch (error) {
            console.error('Error getting stats:', error);
            return {
                totalProducts: 0,
                inStock: 0,
                outOfStock: 0,
                totalCartItems: 0
            };
        }
    }
}

module.exports = Database;
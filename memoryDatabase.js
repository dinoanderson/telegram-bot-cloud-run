const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const config = require('./config');

class MemoryDatabase {
    constructor() {
        this.products = [];
        this.cart = new Map(); // userId -> array of cart items
        this.platformStats = [];
        this.categoryStats = new Map(); // platform -> categories
        this.priceStats = [];
        
        // Path to the main SQLite database
        this.dbPath = path.join(__dirname, 'products.db');
    }

    async init() {
        try {
            console.log('🔄 Loading products from SQLite database...');
            await this.loadProductsFromSQLite();
            this.calculateStats();
            console.log(`✅ Loaded ${this.products.length} products into memory`);
            console.log('✅ Memory database ready for use');
        } catch (error) {
            console.error('❌ Error initializing memory database:', error);
            throw error;
        }
    }

    async loadProductsFromSQLite() {
        return new Promise((resolve, reject) => {
            console.log(`🔍 Looking for database at: ${this.dbPath}`);
            
            // Check if file exists first
            const fs = require('fs');
            if (!fs.existsSync(this.dbPath)) {
                reject(new Error(`Database file not found at: ${this.dbPath}`));
                return;
            }
            
            const db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READONLY, (err) => {
                if (err) {
                    console.error(`❌ SQLite connection error: ${err.message}`);
                    reject(err);
                    return;
                }
                console.log('✅ Connected to SQLite database');
            });

            const query = `
                SELECT 
                    id,
                    name,
                    price,
                    description,
                    platform_category,
                    stock,
                    url,
                    shop_domain,
                    platform,
                    currency,
                    description_zh,
                    category_zh as platform_category_zh
                FROM products 
                WHERE shop_domain = 'npprteam.shop' 
                AND stock > 0
                ORDER BY id
            `;

            db.all(query, [], (err, rows) => {
                if (err) {
                    db.close();
                    reject(err);
                    return;
                }

                // Transform SQLite rows to match expected format
                this.products = rows.map(row => ({
                    id: row.id,
                    name: row.name || 'Untitled Product',
                    price: parseFloat(row.price) || 0,
                    description: row.description || '',
                    platform_category: row.platform_category || 'Uncategorized',
                    stock: parseInt(row.stock) || 0,
                    url: row.url || '',
                    platform: row.platform || 'facebook',
                    currency: row.currency || 'USD',
                    description_zh: row.description_zh || row.description || '',
                    platform_category_zh: row.platform_category_zh || row.platform_category || 'Uncategorized'
                }));

                db.close();
                resolve();
            });
        });
    }

    calculateStats() {
        // Calculate platform statistics
        const platformMap = new Map();
        const categoryMap = new Map();
        const priceRanges = config.PRICE_RANGES.map(range => ({
            ...range,
            total: 0,
            in_stock: 0
        }));

        this.products.forEach(product => {
            const platform = product.platform || 'Unknown';
            const category = product.platform_category || 'Uncategorized';
            const price = product.price || 0;

            // Platform stats
            if (!platformMap.has(platform)) {
                platformMap.set(platform, { total: 0, in_stock: 0 });
            }
            const platformStat = platformMap.get(platform);
            platformStat.total++;
            if (product.stock > 0) {
                platformStat.in_stock++;
            }

            // Category stats by platform
            const categoryKey = `${platform}`;
            if (!categoryMap.has(categoryKey)) {
                categoryMap.set(categoryKey, new Map());
            }
            const platformCategories = categoryMap.get(categoryKey);
            if (!platformCategories.has(category)) {
                platformCategories.set(category, { total: 0, in_stock: 0 });
            }
            const categoryStat = platformCategories.get(category);
            categoryStat.total++;
            if (product.stock > 0) {
                categoryStat.in_stock++;
            }

            // Price range stats
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

        // Convert to expected format
        this.platformStats = Array.from(platformMap.entries()).map(([platform, counts]) => ({
            platform,
            total: counts.total,
            in_stock: counts.in_stock
        }));

        // Store category stats
        this.categoryStats = categoryMap;

        // Store price stats (only ranges with products)
        this.priceStats = priceRanges
            .filter(range => range.total > 0)
            .map(range => ({
                price_range: range.label,
                total: range.total,
                in_stock: range.in_stock,
                min: range.min,
                max: range.max
            }));
    }

    // Get platform statistics
    async getPlatformStats() {
        return [...this.platformStats];
    }

    // Get category statistics for a specific platform
    async getCategoryStats(platform) {
        const platformCategories = this.categoryStats.get(platform);
        if (!platformCategories) {
            return [];
        }

        return Array.from(platformCategories.entries()).map(([platform_category, counts]) => ({
            platform_category,
            total: counts.total,
            in_stock: counts.in_stock
        }));
    }

    // Get price range statistics
    async getPriceRangeStats() {
        return [...this.priceStats];
    }

    // Get products with filters and pagination
    async getProducts(filters = {}, page = 1) {
        try {
            const limit = config.PRODUCTS_PER_PAGE;
            const offset = (page - 1) * limit;
            
            let filteredProducts = [...this.products];
            
            // Apply filters
            if (filters.platform) {
                filteredProducts = filteredProducts.filter(product => 
                    product.platform === filters.platform
                );
            }
            
            if (filters.category) {
                filteredProducts = filteredProducts.filter(product => 
                    product.platform_category === filters.category
                );
            }
            
            if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
                filteredProducts = filteredProducts.filter(product => {
                    const price = product.price || 0;
                    if (filters.priceMin !== undefined && price < filters.priceMin) return false;
                    if (filters.priceMax !== undefined && price > filters.priceMax) return false;
                    return true;
                });
            }
            
            if (filters.inStock) {
                filteredProducts = filteredProducts.filter(product => product.stock > 0);
            }
            
            // Handle search filter
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                filteredProducts = filteredProducts.filter(product => 
                    (product.name && product.name.toLowerCase().includes(searchTerm)) ||
                    (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                    (product.platform_category && product.platform_category.toLowerCase().includes(searchTerm))
                );
            }
            
            const total = filteredProducts.length;
            const totalPages = Math.ceil(total / limit);
            
            // Apply pagination
            const products = filteredProducts.slice(offset, offset + limit);
            
            return {
                products,
                pagination: {
                    page,
                    totalPages,
                    total,
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
            const product = this.products.find(p => p.id == id);
            return product || null;
        } catch (error) {
            console.error('Error getting product:', error);
            return null;
        }
    }

    // Cart operations
    async addToCart(userId, productId, quantity = 1) {
        try {
            const userIdStr = userId.toString();
            const productIdStr = productId.toString();
            
            if (!this.cart.has(userIdStr)) {
                this.cart.set(userIdStr, []);
            }
            
            const userCart = this.cart.get(userIdStr);
            const existingItem = userCart.find(item => item.product_id === productIdStr);
            
            if (existingItem) {
                existingItem.quantity += quantity;
                return existingItem.cart_id;
            } else {
                const cartId = `${userIdStr}_${productIdStr}_${Date.now()}`;
                userCart.push({
                    cart_id: cartId,
                    user_id: userIdStr,
                    product_id: productIdStr,
                    quantity: quantity,
                    created_at: new Date(),
                    updated_at: new Date()
                });
                return cartId;
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    }

    async getCart(userId) {
        try {
            const userIdStr = userId.toString();
            const userCart = this.cart.get(userIdStr) || [];
            
            const cartItems = [];
            
            for (const cartData of userCart) {
                const product = await this.getProduct(cartData.product_id);
                
                if (product) {
                    cartItems.push({
                        cart_id: cartData.cart_id,
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
            for (const [userId, userCart] of this.cart.entries()) {
                const item = userCart.find(item => item.cart_id === cartId);
                if (item) {
                    item.quantity = quantity;
                    item.updated_at = new Date();
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error updating cart quantity:', error);
            return false;
        }
    }

    async removeFromCart(cartId) {
        try {
            for (const [userId, userCart] of this.cart.entries()) {
                const index = userCart.findIndex(item => item.cart_id === cartId);
                if (index !== -1) {
                    userCart.splice(index, 1);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error removing from cart:', error);
            return false;
        }
    }

    async clearCart(userId) {
        try {
            const userIdStr = userId.toString();
            this.cart.set(userIdStr, []);
            return true;
        } catch (error) {
            console.error('Error clearing cart:', error);
            return false;
        }
    }

    async getCartItemCount(userId) {
        try {
            const userIdStr = userId.toString();
            const userCart = this.cart.get(userIdStr) || [];
            
            let totalItems = 0;
            userCart.forEach(item => {
                totalItems += item.quantity || 0;
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
            const totalProducts = this.products.length;
            const inStock = this.products.filter(p => p.stock > 0).length;
            const totalCartItems = Array.from(this.cart.values()).reduce((total, userCart) => total + userCart.length, 0);
            
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

    // Refresh products from SQLite (can be called periodically)
    async refreshProducts() {
        console.log('🔄 Refreshing products from database...');
        await this.loadProductsFromSQLite();
        this.calculateStats();
        console.log(`✅ Refreshed ${this.products.length} products`);
    }
}

module.exports = MemoryDatabase;
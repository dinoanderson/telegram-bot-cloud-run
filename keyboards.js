const config = require('./config');
const { LanguageManager } = require('./languages');

class Keyboards {
    static langManager = new LanguageManager();
    // Language selection keyboard
    static languageSelection() {
        return this.langManager.getLanguageSelectionKeyboard();
    }

    // Main menu keyboard
    static mainMenu(userId) {
        return {
            inline_keyboard: [
                [{ text: this.langManager.getButton(userId, 'BROWSE_PLATFORM'), callback_data: 'browse_platform' }],
                [{ text: this.langManager.getButton(userId, 'BROWSE_PRICE'), callback_data: 'browse_price' }],
                [
                    { text: this.langManager.getButton(userId, 'IN_STOCK'), callback_data: 'in_stock' },
                    { text: this.langManager.getButton(userId, 'SEARCH'), callback_data: 'search' }
                ],
                [
                    { text: this.langManager.getButton(userId, 'CART'), callback_data: 'view_cart' },
                    { text: this.langManager.getButton(userId, 'SETTINGS'), callback_data: 'settings' }
                ]
            ]
        };
    }

    // Platform selection keyboard
    static async platformMenu(platformStats) {
        const keyboard = [];
        
        for (const platform of platformStats) {
            const emoji = config.PLATFORM_EMOJIS[platform.platform] || '📦';
            const text = `${emoji} ${platform.platform.toUpperCase()} (${platform.in_stock}/${platform.total})`;
            keyboard.push([{ 
                text: text, 
                callback_data: `platform_${platform.platform}` 
            }]);
        }

        keyboard.push([{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]);
        
        return { inline_keyboard: keyboard };
    }

    // Category selection keyboard for a platform
    static async categoryMenu(platform, categoryStats) {
        const keyboard = [];
        
        for (const category of categoryStats) {
            const emoji = config.CATEGORY_EMOJIS[category.platform_category] || '📂';
            const text = `${emoji} ${category.platform_category} (${category.in_stock}/${category.total})`;
            keyboard.push([{ 
                text: text, 
                callback_data: `category_${platform}_${encodeURIComponent(category.platform_category)}` 
            }]);
        }

        keyboard.push([
            { text: '🔙 Back to Platforms', callback_data: 'browse_platform' },
            { text: '🏠 Main Menu', callback_data: 'main_menu' }
        ]);
        
        return { inline_keyboard: keyboard };
    }

    // Price range menu
    static async priceMenu(priceStats) {
        const keyboard = [];
        
        for (const range of priceStats) {
            const text = `💰 ${range.price_range} (${range.in_stock}/${range.total})`;
            const rangeData = config.PRICE_RANGES.find(r => r.label === range.price_range);
            if (rangeData) {
                keyboard.push([{ 
                    text: text, 
                    callback_data: `price_${rangeData.min}_${rangeData.max}` 
                }]);
            }
        }

        keyboard.push([{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]);
        
        return { inline_keyboard: keyboard };
    }

    // Product list keyboard with pagination
    static productList(products, pagination, context = {}, userId) {
        const keyboard = [];
        
        // Add product buttons (max 5 per page)
        for (const product of products) {
            const localizedProduct = this.langManager.getLocalizedProduct(userId, product);
            const stockIcon = localizedProduct.stock > 0 ? '✅' : '❌';
            const price = localizedProduct.price ? localizedProduct.formattedPrice : 'Price on request';
            const text = `${stockIcon} ${this.truncateText(localizedProduct.name, 35)} - ${price}`;
            keyboard.push([{ 
                text: text, 
                callback_data: `view_${product.id}` 
            }]);
        }

        // Pagination row
        if (pagination.totalPages > 1) {
            const paginationRow = [];
            
            if (pagination.hasPrev) {
                paginationRow.push({ 
                    text: '◀️ Prev', 
                    callback_data: this.buildPaginationCallback(context, pagination.page - 1) 
                });
            }
            
            paginationRow.push({ 
                text: `📄 ${pagination.page}/${pagination.totalPages}`, 
                callback_data: 'page_info' 
            });
            
            if (pagination.hasNext) {
                paginationRow.push({ 
                    text: 'Next ▶️', 
                    callback_data: this.buildPaginationCallback(context, pagination.page + 1) 
                });
            }
            
            keyboard.push(paginationRow);
        }

        // Navigation row
        const navRow = [];
        if (context.category) {
            navRow.push({ 
                text: this.langManager.getButton(userId, 'BACK_TO_CATEGORIES'), 
                callback_data: `platform_${context.platform}` 
            });
        } else if (context.platform) {
            navRow.push({ 
                text: this.langManager.getButton(userId, 'BACK_TO_PLATFORMS'), 
                callback_data: 'browse_platform' 
            });
        } else if (context.priceRange) {
            navRow.push({ 
                text: this.langManager.getButton(userId, 'BACK_TO_MENU'), 
                callback_data: 'browse_price' 
            });
        } else {
            navRow.push({ 
                text: this.langManager.getButton(userId, 'BACK_TO_MENU'), 
                callback_data: 'main_menu' 
            });
        }
        
        navRow.push({ text: this.langManager.getButton(userId, 'MAIN_MENU'), callback_data: 'main_menu' });
        keyboard.push(navRow);
        
        return { inline_keyboard: keyboard };
    }

    // Product detail keyboard
    static productDetail(product, context = {}, userId = null) {
        const keyboard = [];
        
        // Add to cart button (if in stock)
        if (product.stock > 0) {
            keyboard.push([
                { text: this.langManager.getButton(userId, 'ADD_TO_CART'), callback_data: `add_cart_${product.id}` },
                { text: this.langManager.getButton(userId, 'VIEW_CART'), callback_data: 'view_cart' }
            ]);
        } else {
            keyboard.push([{ text: `❌ ${this.langManager.getButton(userId, 'OUT_OF_STOCK')}`, callback_data: 'out_of_stock' }]);
        }

        // Navigation row
        const navRow = [];
        if (context.fromList) {
            navRow.push({ 
                text: this.langManager.getButton(userId, 'BACK_TO_LIST'), 
                callback_data: context.backCallback || 'main_menu' 
            });
        }
        navRow.push({ text: this.langManager.getButton(userId, 'MAIN_MENU'), callback_data: 'main_menu' });
        keyboard.push(navRow);
        
        return { inline_keyboard: keyboard };
    }

    // Cart keyboard
    static cart(cartItems) {
        const keyboard = [];
        
        if (cartItems.length === 0) {
            keyboard.push([{ text: '🛍️ Start Shopping', callback_data: 'main_menu' }]);
        } else {
            // Cart items with quantity controls
            for (const item of cartItems) {
                const text = `${this.truncateText(item.name, 25)} - $${item.price} x${item.quantity}`;
                keyboard.push([{ text: text, callback_data: `cart_item_${item.cart_id}` }]);
                
                // Quantity controls
                keyboard.push([
                    { text: '➖', callback_data: `cart_dec_${item.cart_id}` },
                    { text: `Qty: ${item.quantity}`, callback_data: `cart_qty_${item.cart_id}` },
                    { text: '➕', callback_data: `cart_inc_${item.cart_id}` },
                    { text: '🗑️', callback_data: `cart_remove_${item.cart_id}` }
                ]);
            }

            // Cart actions
            keyboard.push([
                { text: '💳 Checkout', callback_data: 'checkout' },
                { text: '🗑️ Clear Cart', callback_data: 'clear_cart' }
            ]);
        }

        keyboard.push([{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]);
        
        return { inline_keyboard: keyboard };
    }

    // Settings keyboard
    static settings() {
        return {
            inline_keyboard: [
                [{ text: '🔄 Refresh Products', callback_data: 'refresh_products' }],
                [{ text: '📊 Statistics', callback_data: 'statistics' }],
                [{ text: '❓ Help', callback_data: 'help' }],
                [{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]
            ]
        };
    }

    // Admin keyboard (for admin users)
    static admin() {
        return {
            inline_keyboard: [
                [
                    { text: '📊 Bot Stats', callback_data: 'admin_stats' },
                    { text: '👥 Users', callback_data: 'admin_users' }
                ],
                [
                    { text: '📢 Broadcast', callback_data: 'admin_broadcast' },
                    { text: '🔄 Update DB', callback_data: 'admin_update_db' }
                ],
                [{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]
            ]
        };
    }

    // Confirmation keyboard
    static confirmation(confirmCallback, cancelCallback = 'main_menu') {
        return {
            inline_keyboard: [
                [
                    { text: '✅ Confirm', callback_data: confirmCallback },
                    { text: '❌ Cancel', callback_data: cancelCallback }
                ]
            ]
        };
    }

    // Helper methods
    static truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }

    static buildPaginationCallback(context, page) {
        if (context.category && context.platform) {
            return `category_${context.platform}_${encodeURIComponent(context.category)}_${page}`;
        } else if (context.platform) {
            return `platform_${context.platform}_${page}`;
        } else if (context.priceRange) {
            return `price_${context.priceMin}_${context.priceMax}_${page}`;
        } else if (context.inStock) {
            return `in_stock_${page}`;
        } else if (context.search) {
            return `search_${encodeURIComponent(context.search)}_${page}`;
        }
        return 'main_menu';
    }

    // Format product message
    static formatProduct(product, userId) {
        const localizedProduct = this.langManager.getLocalizedProduct(userId, product);
        const stockStatus = localizedProduct.stock > 0 ? `✅ ${this.langManager.getMessage(userId, 'IN_STOCK')} (${localizedProduct.stock})` : `❌ ${this.langManager.getMessage(userId, 'OUT_OF_STOCK')}`;
        const price = localizedProduct.price ? `💰 ${localizedProduct.formattedPrice}` : '💰 Price on request';
        
        let message = `📦 **${localizedProduct.name}**\n\n`;
        message += `${price}\n`;
        message += `${stockStatus}\n`;
        
        if (localizedProduct.platform_category) {
            const emoji = config.CATEGORY_EMOJIS[localizedProduct.platform_category] || '📂';
            const translatedCategory = this.langManager.translateDescription(userId, localizedProduct.platform_category);
            message += `${emoji} ${translatedCategory}\n`;
        }
        
        if (localizedProduct.description && localizedProduct.description.trim()) {
            const descLabel = this.langManager.getUserLanguage(userId) === 'zh' ? '📋 **描述:**' : '📋 **Description:**';
            message += `\n${descLabel}\n${localizedProduct.description.substring(0, 500)}${localizedProduct.description.length > 500 ? '...' : ''}\n`;
        }
        
        return message;
    }

    // Format cart summary
    static formatCart(cartData) {
        if (cartData.items.length === 0) {
            return config.MESSAGES.CART_EMPTY;
        }

        let message = '🛒 **Your Cart**\n\n';
        
        for (const item of cartData.items) {
            const itemTotal = item.price * item.quantity;
            message += `📦 ${this.truncateText(item.name, 30)}\n`;
            message += `   💰 $${item.price} × ${item.quantity} = $${itemTotal.toFixed(2)}\n\n`;
        }
        
        message += `💳 **Total: $${cartData.total.toFixed(2)}**\n`;
        message += `📊 ${cartData.items.length} item(s) in cart`;
        
        return message;
    }
}

module.exports = Keyboards;
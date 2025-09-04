const Keyboards = require('../keyboards');
const config = require('../config');

class ProductHandler {
    constructor(bot, database) {
        this.bot = bot;
        this.db = database;
    }

    async showPlatformCategories(chatId, platform, messageId = null) {
        try {
            const categoryStats = await this.db.getCategoryStats(platform);
            
            if (categoryStats.length === 0) {
                await this.bot.sendMessage(chatId, `❌ No categories found for ${platform.toUpperCase()}`);
                return;
            }

            const emoji = config.PLATFORM_EMOJIS[platform] || '📦';
            const message = `${emoji} **${platform.toUpperCase()} Categories**\n\nSelect a category to view products:`;
            const keyboard = await Keyboards.categoryMenu(platform, categoryStats);

            if (messageId) {
                await this.bot.editMessageText(message, {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                });
            } else {
                await this.bot.sendMessage(chatId, message, {
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                });
            }
        } catch (error) {
            console.error('Error showing platform categories:', error);
            await this.bot.sendMessage(chatId, config.MESSAGES.ERROR);
        }
    }

    async showCategoryProducts(chatId, platform, category, page = 1, messageId = null) {
        try {
            const filters = { platform, category };
            const result = await this.db.getProducts(filters, page);
            
            if (result.products.length === 0) {
                const message = page === 1 ? config.MESSAGES.NO_PRODUCTS : '❌ No more products in this category.';
                await this.bot.sendMessage(chatId, message);
                return;
            }

            const context = { platform, category };
            const message = this.formatProductListMessage(platform, category, result.pagination);
            const keyboard = Keyboards.productList(result.products, result.pagination, context);

            if (messageId) {
                await this.bot.editMessageText(message, {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                });
            } else {
                await this.bot.sendMessage(chatId, message, {
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                });
            }
        } catch (error) {
            console.error('Error showing category products:', error);
            await this.bot.sendMessage(chatId, config.MESSAGES.ERROR);
        }
    }

    async showProductsByPrice(chatId, priceMin, priceMax, page = 1, messageId = null) {
        try {
            const filters = { priceMin, priceMax };
            const result = await this.db.getProducts(filters, page);
            
            if (result.products.length === 0) {
                const message = page === 1 ? config.MESSAGES.NO_PRODUCTS : '❌ No more products in this price range.';
                await this.bot.sendMessage(chatId, message);
                return;
            }

            const context = { priceRange: true, priceMin, priceMax };
            const priceLabel = priceMax >= 999999 ? `$${priceMin}+` : `$${priceMin}-$${priceMax}`;
            const message = `💰 **Products ${priceLabel}**\n\nPage ${result.pagination.page}/${result.pagination.totalPages} • ${result.pagination.total} products found`;
            const keyboard = Keyboards.productList(result.products, result.pagination, context);

            if (messageId) {
                await this.bot.editMessageText(message, {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                });
            } else {
                await this.bot.sendMessage(chatId, message, {
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                });
            }
        } catch (error) {
            console.error('Error showing products by price:', error);
            await this.bot.sendMessage(chatId, config.MESSAGES.ERROR);
        }
    }

    async showInStockProducts(chatId, page = 1, messageId = null) {
        try {
            const filters = { inStock: true };
            const result = await this.db.getProducts(filters, page);
            
            if (result.products.length === 0) {
                const message = page === 1 ? '❌ No products currently in stock.' : '❌ No more products in stock.';
                await this.bot.sendMessage(chatId, message);
                return;
            }

            const context = { inStock: true };
            const message = `🔥 **Products In Stock**\n\nPage ${result.pagination.page}/${result.pagination.totalPages} • ${result.pagination.total} products available`;
            const keyboard = Keyboards.productList(result.products, result.pagination, context);

            if (messageId) {
                await this.bot.editMessageText(message, {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                });
            } else {
                await this.bot.sendMessage(chatId, message, {
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                });
            }
        } catch (error) {
            console.error('Error showing in-stock products:', error);
            await this.bot.sendMessage(chatId, config.MESSAGES.ERROR);
        }
    }

    async searchProducts(chatId, searchTerm, page = 1, messageId = null) {
        try {
            const filters = { search: searchTerm };
            const result = await this.db.getProducts(filters, page);
            
            if (result.products.length === 0) {
                const message = page === 1 
                    ? `🔍 No products found for "${searchTerm}"\n\nTry different keywords or browse by category.`
                    : '❌ No more search results.';
                
                await this.bot.sendMessage(chatId, message, {
                    reply_markup: Keyboards.mainMenu()
                });
                return;
            }

            const context = { search: searchTerm };
            const message = `🔍 **Search Results for "${searchTerm}"**\n\nPage ${result.pagination.page}/${result.pagination.totalPages} • ${result.pagination.total} products found`;
            const keyboard = Keyboards.productList(result.products, result.pagination, context);

            if (messageId) {
                await this.bot.editMessageText(message, {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                });
            } else {
                await this.bot.sendMessage(chatId, message, {
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                });
            }
        } catch (error) {
            console.error('Error searching products:', error);
            await this.bot.sendMessage(chatId, config.MESSAGES.ERROR);
        }
    }

    async showProductDetail(chatId, productId, originalMessage = null, userId = null) {
        try {
            const product = await this.db.getProduct(productId);
            
            if (!product) {
                await this.bot.sendMessage(chatId, '❌ Product not found.');
                return;
            }

            const message = Keyboards.formatProduct(product, userId);
            
            // Determine context for back navigation
            let context = { fromList: true };
            if (originalMessage && originalMessage.text) {
                if (originalMessage.text.includes('Search Results')) {
                    context.backCallback = 'search';
                } else if (originalMessage.text.includes('In Stock')) {
                    context.backCallback = 'in_stock';
                } else if (originalMessage.text.includes('Products $')) {
                    context.backCallback = 'browse_price';
                }
            }

            const keyboard = Keyboards.productDetail(product, context, userId);

            // If we can edit the message, do so. Otherwise send new message
            if (originalMessage && originalMessage.message_id) {
                try {
                    await this.bot.editMessageText(message, {
                        chat_id: chatId,
                        message_id: originalMessage.message_id,
                        parse_mode: 'Markdown',
                        reply_markup: keyboard
                    });
                } catch (editError) {
                    // If editing fails, send new message
                    await this.bot.sendMessage(chatId, message, {
                        parse_mode: 'Markdown',
                        reply_markup: keyboard
                    });
                }
            } else {
                await this.bot.sendMessage(chatId, message, {
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                });
            }
        } catch (error) {
            console.error('Error showing product detail:', error);
            await this.bot.sendMessage(chatId, config.MESSAGES.ERROR);
        }
    }

    formatProductListMessage(platform, category, pagination) {
        const platformEmoji = config.PLATFORM_EMOJIS[platform] || '📦';
        const categoryEmoji = config.CATEGORY_EMOJIS[category] || '📂';
        
        let message = `${platformEmoji} **${platform.toUpperCase()}**\n`;
        message += `${categoryEmoji} **${category}**\n\n`;
        message += `Page ${pagination.page}/${pagination.totalPages} • ${pagination.total} products`;
        
        return message;
    }

    async handlePagination(chatId, context, page, messageId) {
        if (context.category && context.platform) {
            await this.showCategoryProducts(chatId, context.platform, context.category, page, messageId);
        } else if (context.priceRange) {
            await this.showProductsByPrice(chatId, context.priceMin, context.priceMax, page, messageId);
        } else if (context.inStock) {
            await this.showInStockProducts(chatId, page, messageId);
        } else if (context.search) {
            await this.searchProducts(chatId, context.search, page, messageId);
        }
    }
}

module.exports = ProductHandler;
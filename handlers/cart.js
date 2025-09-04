const Keyboards = require('../keyboards');
const config = require('../config');

class CartHandler {
    constructor(bot, database) {
        this.bot = bot;
        this.db = database;
    }

    async addToCart(chatId, userId, productId, quantity = 1) {
        try {
            // Check if product exists and is in stock
            const product = await this.db.getProduct(productId);
            
            if (!product) {
                await this.bot.sendMessage(chatId, '❌ Product not found.');
                return;
            }

            if (product.stock <= 0) {
                await this.bot.sendMessage(chatId, config.MESSAGES.OUT_OF_STOCK);
                return;
            }

            // Add to cart
            const result = await this.db.addToCart(userId, productId, quantity);
            
            if (result.inserted || result.updated) {
                const message = `${config.MESSAGES.ADDED_TO_CART}\n\n📦 **${product.name}**\n💰 $${product.price}`;
                
                await this.bot.sendMessage(chatId, message, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '🛒 View Cart', callback_data: 'view_cart' },
                                { text: '🛍️ Continue Shopping', callback_data: 'main_menu' }
                            ]
                        ]
                    }
                });
            } else {
                await this.bot.sendMessage(chatId, '❌ Failed to add product to cart.');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            await this.bot.sendMessage(chatId, config.MESSAGES.ERROR);
        }
    }

    async viewCart(chatId, userId, messageId = null) {
        try {
            const cartData = await this.db.getCart(userId);
            const message = Keyboards.formatCart(cartData);
            const keyboard = Keyboards.cart(cartData.items);

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
            console.error('Error viewing cart:', error);
            await this.bot.sendMessage(chatId, config.MESSAGES.ERROR);
        }
    }

    async handleCartAction(chatId, userId, params, query) {
        try {
            const action = params[0]; // dec, inc, remove, qty, item
            const cartId = parseInt(params[1]);

            switch (action) {
                case 'inc':
                    await this.updateCartQuantity(chatId, userId, cartId, 1, query.message.message_id);
                    break;
                
                case 'dec':
                    await this.updateCartQuantity(chatId, userId, cartId, -1, query.message.message_id);
                    break;
                
                case 'remove':
                    await this.removeFromCart(chatId, userId, cartId, query.message.message_id);
                    break;
                
                case 'qty':
                    await this.bot.answerCallbackQuery(query.id, {
                        text: 'Use + and - buttons to adjust quantity',
                        show_alert: false
                    });
                    break;
                
                case 'item':
                    // Show item details or options
                    await this.showCartItemDetails(chatId, userId, cartId, query);
                    break;
                
                default:
                    await this.bot.answerCallbackQuery(query.id, {
                        text: 'Unknown cart action',
                        show_alert: true
                    });
                    break;
            }
        } catch (error) {
            console.error('Error handling cart action:', error);
            await this.bot.answerCallbackQuery(query.id, {
                text: config.MESSAGES.ERROR,
                show_alert: true
            });
        }
    }

    async updateCartQuantity(chatId, userId, cartId, change, messageId) {
        try {
            // Get current cart to find current quantity
            const cartData = await this.db.getCart(userId);
            const cartItem = cartData.items.find(item => item.cart_id === cartId);
            
            if (!cartItem) {
                await this.bot.answerCallbackQuery(query.id, {
                    text: 'Cart item not found',
                    show_alert: true
                });
                return;
            }

            const newQuantity = cartItem.quantity + change;
            
            if (newQuantity <= 0) {
                await this.db.removeFromCart(userId, cartId);
            } else {
                await this.db.updateCartQuantity(userId, cartId, newQuantity);
            }

            // Refresh cart view
            await this.viewCart(chatId, userId, messageId);
        } catch (error) {
            console.error('Error updating cart quantity:', error);
            await this.bot.sendMessage(chatId, config.MESSAGES.ERROR);
        }
    }

    async removeFromCart(chatId, userId, cartId, messageId) {
        try {
            await this.db.removeFromCart(userId, cartId);
            await this.viewCart(chatId, userId, messageId);
        } catch (error) {
            console.error('Error removing from cart:', error);
            await this.bot.sendMessage(chatId, config.MESSAGES.ERROR);
        }
    }

    async showCartItemDetails(chatId, userId, cartId, query) {
        try {
            const cartData = await this.db.getCart(userId);
            const cartItem = cartData.items.find(item => item.cart_id === cartId);
            
            if (!cartItem) {
                await this.bot.answerCallbackQuery(query.id, {
                    text: 'Cart item not found',
                    show_alert: true
                });
                return;
            }

            const itemTotal = cartItem.price * cartItem.quantity;
            const message = `📦 **${cartItem.name}**\n\n💰 Price: $${cartItem.price}\n📊 Quantity: ${cartItem.quantity}\n💳 Total: $${itemTotal.toFixed(2)}`;
            
            await this.bot.answerCallbackQuery(query.id, {
                text: `${cartItem.name}\nQty: ${cartItem.quantity} × $${cartItem.price} = $${itemTotal.toFixed(2)}`,
                show_alert: true
            });
        } catch (error) {
            console.error('Error showing cart item details:', error);
            await this.bot.answerCallbackQuery(query.id, {
                text: config.MESSAGES.ERROR,
                show_alert: true
            });
        }
    }

    async clearCart(chatId, userId, messageId = null) {
        try {
            // Show confirmation first
            const message = '🗑️ **Clear Cart**\n\nAre you sure you want to remove all items from your cart?';
            const keyboard = Keyboards.confirmation('confirm_clear_cart', 'view_cart');

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
            console.error('Error showing clear cart confirmation:', error);
            await this.bot.sendMessage(chatId, config.MESSAGES.ERROR);
        }
    }

    async confirmClearCart(chatId, userId, messageId = null) {
        try {
            await this.db.clearCart(userId);
            
            const message = '✅ **Cart Cleared**\n\nAll items have been removed from your cart.';
            const keyboard = {
                inline_keyboard: [
                    [{ text: '🛍️ Start Shopping', callback_data: 'main_menu' }]
                ]
            };

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
            console.error('Error clearing cart:', error);
            await this.bot.sendMessage(chatId, config.MESSAGES.ERROR);
        }
    }

    async checkout(chatId, userId) {
        try {
            const cartData = await this.db.getCart(userId);
            
            if (cartData.items.length === 0) {
                await this.bot.sendMessage(chatId, config.MESSAGES.CART_EMPTY);
                return;
            }

            let checkoutMessage = '💳 **Checkout**\n\n';
            checkoutMessage += '📋 **Order Summary:**\n';
            
            for (const item of cartData.items) {
                const itemTotal = item.price * item.quantity;
                checkoutMessage += `• ${item.name}\n`;
                checkoutMessage += `  $${item.price} × ${item.quantity} = $${itemTotal.toFixed(2)}\n\n`;
            }
            
            checkoutMessage += `💰 **Total: $${cartData.total.toFixed(2)}**\n\n`;
            checkoutMessage += '📞 **Next Steps:**\n';
            checkoutMessage += '1. Contact our support team\n';
            checkoutMessage += '2. Send this order summary\n';
            checkoutMessage += '3. Choose payment method\n';
            checkoutMessage += '4. Receive your accounts\n\n';
            checkoutMessage += '💬 **Contact:** @support_username\n';
            checkoutMessage += '📧 **Email:** support@example.com';

            const keyboard = {
                inline_keyboard: [
                    [
                        { text: '💬 Contact Support', url: 'https://t.me/support_username' },
                        { text: '📧 Email Support', url: 'mailto:support@example.com' }
                    ],
                    [
                        { text: '🔙 Back to Cart', callback_data: 'view_cart' },
                        { text: '🏠 Main Menu', callback_data: 'main_menu' }
                    ]
                ]
            };

            await this.bot.sendMessage(chatId, checkoutMessage, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        } catch (error) {
            console.error('Error processing checkout:', error);
            await this.bot.sendMessage(chatId, config.MESSAGES.ERROR);
        }
    }

    async getCartItemCount(userId) {
        try {
            const cartData = await this.db.getCart(userId);
            return cartData.items.reduce((total, item) => total + item.quantity, 0);
        } catch (error) {
            console.error('Error getting cart item count:', error);
            return 0;
        }
    }
}

module.exports = CartHandler;
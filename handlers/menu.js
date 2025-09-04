const Keyboards = require('../keyboards');
const config = require('../config');

class MenuHandler {
    constructor(bot, database) {
        this.bot = bot;
        this.db = database;
    }

    async showMainMenu(chatId, messageId = null) {
        try {
            const message = '🏠 **Main Menu**\n\nChoose an option below to browse our products:';
            const keyboard = Keyboards.mainMenu();

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
            console.error('Error showing main menu:', error);
            await this.bot.sendMessage(chatId, config.MESSAGES.ERROR);
        }
    }

    async showPlatforms(chatId, messageId = null) {
        try {
            const platformStats = await this.db.getPlatformStats();
            
            if (platformStats.length === 0) {
                await this.bot.sendMessage(chatId, config.MESSAGES.NO_PRODUCTS);
                return;
            }

            const message = '📱 **Browse by Platform**\n\nSelect a platform to view available products:';
            const keyboard = await Keyboards.platformMenu(platformStats);

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
            console.error('Error showing platforms:', error);
            await this.bot.sendMessage(chatId, config.MESSAGES.ERROR);
        }
    }

    async showPriceRanges(chatId, messageId = null) {
        try {
            const priceStats = await this.db.getPriceRangeStats();
            
            if (priceStats.length === 0) {
                await this.bot.sendMessage(chatId, config.MESSAGES.NO_PRODUCTS);
                return;
            }

            const message = '💰 **Browse by Price**\n\nSelect a price range to view products:';
            const keyboard = await Keyboards.priceMenu(priceStats);

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
            console.error('Error showing price ranges:', error);
            await this.bot.sendMessage(chatId, config.MESSAGES.ERROR);
        }
    }

    async showSettings(chatId, messageId = null) {
        try {
            const message = '⚙️ **Settings**\n\nBot settings and information:';
            const keyboard = Keyboards.settings();

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
            console.error('Error showing settings:', error);
            await this.bot.sendMessage(chatId, config.MESSAGES.ERROR);
        }
    }

    async showHelp(chatId) {
        try {
            const helpMessage = `
❓ **Help & Support**

**How to use this bot:**
1️⃣ Browse products by platform or price
2️⃣ View product details and availability
3️⃣ Add items to your cart
4️⃣ Checkout when ready

**Product Categories:**
${config.PLATFORM_EMOJIS.facebook} **Facebook** - Personal accounts, Business Manager, Fan Pages
${config.PLATFORM_EMOJIS.gmail} **Gmail** - Google accounts
${config.PLATFORM_EMOJIS.accounts} **Mixed** - Various account types

**Need Help?**
Contact our support team for assistance with:
• Product questions
• Payment methods
• Account delivery
• Technical issues

**Commands:**
/start - Start the bot
/help - Show this help
/cart - View your cart
/menu - Main menu
            `;

            await this.bot.sendMessage(chatId, helpMessage, {
                parse_mode: 'Markdown',
                reply_markup: Keyboards.mainMenu()
            });
        } catch (error) {
            console.error('Error showing help:', error);
            await this.bot.sendMessage(chatId, config.MESSAGES.ERROR);
        }
    }

    async showStatistics(chatId) {
        try {
            const platformStats = await this.db.getPlatformStats();
            const priceStats = await this.db.getPriceRangeStats();

            let message = '📊 **Store Statistics**\n\n';
            
            message += '**📱 By Platform:**\n';
            let totalProducts = 0;
            let totalInStock = 0;
            
            for (const platform of platformStats) {
                const emoji = config.PLATFORM_EMOJIS[platform.platform] || '📦';
                message += `${emoji} ${platform.platform.toUpperCase()}: ${platform.in_stock}/${platform.total}\n`;
                totalProducts += platform.total;
                totalInStock += platform.in_stock;
            }
            
            message += `\n**💰 By Price Range:**\n`;
            for (const range of priceStats) {
                message += `${range.price_range}: ${range.in_stock}/${range.total}\n`;
            }
            
            message += `\n**📈 Summary:**\n`;
            message += `• Total Products: ${totalProducts}\n`;
            message += `• In Stock: ${totalInStock}\n`;
            message += `• Availability: ${((totalInStock/totalProducts) * 100).toFixed(1)}%`;

            await this.bot.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔙 Back to Settings', callback_data: 'settings' }],
                        [{ text: '🏠 Main Menu', callback_data: 'main_menu' }]
                    ]
                }
            });
        } catch (error) {
            console.error('Error showing statistics:', error);
            await this.bot.sendMessage(chatId, config.MESSAGES.ERROR);
        }
    }
}

module.exports = MenuHandler;
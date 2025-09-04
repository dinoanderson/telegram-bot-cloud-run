const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const MemoryDatabase = require('./memoryDatabase');
const config = require('./config');
const { LanguageManager } = require('./languages');

// Import handlers
const MenuHandler = require('./handlers/menu');
const ProductHandler = require('./handlers/products');
const CartHandler = require('./handlers/cart');

class TelegramBotServer {
    constructor() {
        this.app = express();
        this.app.use(express.json());
        
        if (!config.BOT_TOKEN) {
            throw new Error('❌ TELEGRAM_BOT_TOKEN is required in environment variables');
        }

        // Initialize bot in webhook mode (no polling)
        this.bot = new TelegramBot(config.BOT_TOKEN, { webHook: true });
        this.db = new MemoryDatabase();
        this.langManager = new LanguageManager();
        
        // Initialize handlers
        this.menuHandler = new MenuHandler(this.bot, this.db, this.langManager);
        this.productHandler = new ProductHandler(this.bot, this.db, this.langManager);
        this.cartHandler = new CartHandler(this.bot, this.db, this.langManager);

        this.userSessions = new Map(); // Store user session data
        
        this.setupRoutes();
        this.setupBotHandlers();
    }

    setupRoutes() {
        // Health check endpoint for Cloud Run
        this.app.get('/', (req, res) => {
            res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                service: 'telegram-bot-cloud-run'
            });
        });

        // Webhook endpoint for Telegram
        this.app.post('/webhook', (req, res) => {
            console.log('📨 Received webhook:', JSON.stringify(req.body, null, 2));
            this.bot.processUpdate(req.body);
            res.sendStatus(200);
        });

        // Debug endpoint to check bot info
        this.app.get('/bot-info', async (req, res) => {
            try {
                const me = await this.bot.getMe();
                res.json(me);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }

    setupBotHandlers() {
        // Handle /start command
        this.bot.onText(/\/start/, async (msg) => {
            const chatId = msg.chat.id;
            const userId = msg.from.id;
            
            console.log(`🚀 User ${userId} started the bot`);
            await this.menuHandler.showWelcome(chatId, userId);
        });

        // Handle text messages (search functionality)
        this.bot.on('message', async (msg) => {
            if (msg.text && !msg.text.startsWith('/')) {
                const chatId = msg.chat.id;
                const userId = msg.from.id;
                
                // Check if user is in search mode
                if (this.userSessions.has(userId)) {
                    const session = this.userSessions.get(userId);
                    if (session.mode === 'search') {
                        this.userSessions.delete(userId);
                        await this.productHandler.searchProducts(chatId, msg.text);
                        return;
                    }
                }
            }
        });

        // Handle callback queries (button presses)
        this.bot.on('callback_query', async (query) => {
            const chatId = query.message.chat.id;
            const userId = query.from.id;
            const data = query.data;
            
            console.log(`🔘 Callback: ${data} from user ${userId}`);
            
            try {
                // Answer the callback query to remove loading state
                await this.bot.answerCallbackQuery(query.id);
                
                const parts = data.split('_');
                const action = parts[0];
                const params = parts.slice(1);
                
                switch (action) {
                    case 'lang':
                        await this.menuHandler.handleLanguageSelection(chatId, userId, params[0], query.message.message_id);
                        break;
                        
                    case 'main':
                        if (params[0] === 'menu') {
                            await this.menuHandler.showMainMenu(chatId, userId, query.message.message_id);
                        }
                        break;
                        
                    case 'browse':
                        if (params[0] === 'platform') {
                            await this.menuHandler.showPlatforms(chatId, query.message.message_id);
                        } else if (params[0] === 'price') {
                            await this.menuHandler.showPriceRanges(chatId, query.message.message_id);
                        }
                        break;
                        
                    case 'platform':
                        const platform = params[0];
                        await this.productHandler.showPlatformCategories(chatId, platform, query.message.message_id);
                        break;
                        
                    case 'category':
                        const [categoryPlatform, ...categoryParts] = params;
                        const categoryName = categoryParts.join('_');
                        await this.productHandler.showCategoryProducts(chatId, categoryPlatform, categoryName, 1, query.message.message_id);
                        break;
                        
                    case 'price':
                        const [priceMin, priceMax] = params.map(Number);
                        await this.productHandler.showProductsByPrice(chatId, priceMin, priceMax, 1, query.message.message_id);
                        break;
                        
                    case 'search':
                        if (params[0] === 'products') {
                            await this.handleSearch(chatId, userId);
                        }
                        break;
                        
                    case 'stock':
                        if (params[0] === 'only') {
                            await this.productHandler.showInStockProducts(chatId, 1, query.message.message_id);
                        }
                        break;
                        
                    case 'page':
                        const page = parseInt(params[0]);
                        const context = JSON.parse(decodeURIComponent(params[1]));
                        await this.productHandler.handlePagination(chatId, context, page, query.message.message_id);
                        break;
                        
                    case 'view':
                        if (params[0] === 'cart') {
                            await this.cartHandler.viewCart(chatId, userId, query.message.message_id);
                        } else {
                            const productId = parseInt(params[0]);
                            await this.productHandler.showProductDetail(chatId, productId, query.message, userId);
                        }
                        break;
                        
                    case 'add':
                        if (params[0] === 'cart') {
                            const productId = parseInt(params[1]);
                            await this.cartHandler.addToCart(chatId, userId, productId);
                        }
                        break;
                        
                    case 'cart':
                        await this.cartHandler.handleCartAction(chatId, userId, params, query.message.message_id);
                        break;
                        
                    case 'settings':
                        await this.menuHandler.showSettings(chatId, query.message.message_id);
                        break;
                        
                    case 'in':
                        if (params[0] === 'stock') {
                            await this.productHandler.showInStockProducts(chatId, 1, query.message.message_id);
                        }
                        break;
                        
                    case 'search':
                        if (params.length === 0) {
                            await this.handleSearch(chatId, userId);
                        }
                        break;
                        
                    case 'statistics':
                        await this.menuHandler.showStatistics(chatId);
                        break;
                        
                    case 'help':
                        await this.menuHandler.showHelp(chatId);
                        break;
                        
                    default:
                        console.log(`⚠️ Unknown callback action: ${action}`);
                        await this.bot.answerCallbackQuery(query.id, {
                            text: 'Unknown action',
                            show_alert: true
                        });
                        break;
                }
            } catch (error) {
                console.error('❌ Error handling callback query:', error);
                await this.bot.answerCallbackQuery(query.id, {
                    text: 'An error occurred. Please try again.',
                    show_alert: true
                });
            }
        });

        // Error handling
        this.bot.on('polling_error', (error) => {
            console.error('❌ Polling error:', error);
        });

        this.bot.on('webhook_error', (error) => {
            console.error('❌ Webhook error:', error);
        });
    }

    async handleSearch(chatId, userId) {
        const msg = await this.bot.sendMessage(chatId, '🔍 **Search Products**\n\nEnter your search term:', {
            parse_mode: 'Markdown'
        });
        
        // Set user in search mode
        this.userSessions.set(userId, { mode: 'search', messageId: msg.message_id });
        
        // Auto-cleanup after 60 seconds
        setTimeout(() => {
            if (this.userSessions.has(userId)) {
                this.userSessions.delete(userId);
            }
        }, 60000);
    }

    async start() {
        try {
            // Initialize database
            await this.db.init();
            
            // Keyboards already has its own language manager instance
            
            console.log('🤖 Bot initialized successfully!');
            
            // Verify bot token
            const me = await this.bot.getMe();
            console.log(`✅ Bot verified: @${me.username} (${me.first_name})`);
            
            // Start the Express server
            const PORT = process.env.PORT || 8080;
            this.app.listen(PORT, () => {
                console.log(`🌐 Server running on port ${PORT}`);
                console.log(`🔗 Webhook ready at: https://YOUR_CLOUD_RUN_URL/webhook`);
            });
            
        } catch (error) {
            console.error('❌ Failed to start bot:', error);
            process.exit(1);
        }
    }
}

// Start the bot server
const botServer = new TelegramBotServer();
botServer.start();

module.exports = TelegramBotServer;
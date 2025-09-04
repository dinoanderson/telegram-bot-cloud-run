require('dotenv').config();

module.exports = {
    // Bot configuration
    BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    WEBHOOK_URL: process.env.WEBHOOK_URL,
    
    // Google Cloud configuration (optional - not needed for memory database)
    GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
    
    // OpenRouter API for translations
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    
    // Server configuration
    PORT: process.env.PORT || 8080,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Pagination
    PRODUCTS_PER_PAGE: 5,
    
    // Price ranges
    PRICE_RANGES: [
        { label: 'Under $50', min: 0, max: 49.99 },
        { label: '$50-$100', min: 50, max: 100 },
        { label: '$100-$200', min: 100, max: 200 },
        { label: '$200+', min: 200, max: 999999 }
    ],
    
    // Platform emojis
    PLATFORM_EMOJIS: {
        'facebook': '📘',
        'gmail': '📧',
        'accounts': '🔗',
        'tiktok': '🎵',
        'instagram': '📷',
        'reddit': '🤖',
        'snapchat': '👻'
    },
    
    // Category emojis
    CATEGORY_EMOJIS: {
        'Personal Accounts': '👤',
        'Business Manager': '💼',
        'Fan Pages Reinstated': '📄',
        'Advertising Accounts': '📊',
        'Google General': '🌐',
        'Mixed Accounts': '🔄',
        'TikTok Accounts': '🎵',
        'Instagram Accounts': '📷',
        'Reddit Accounts': '🤖',
        'Telegram Accounts': '💬'
    },
    
    // Admin user IDs (add your Telegram user ID here)
    ADMIN_IDS: [
        // Add admin user IDs here
    ],
    
    // Messages
    MESSAGES: {
        WELCOME: `🛍️ Welcome to the Advertising Accounts Store!

Browse our collection of premium social media accounts:
• Facebook Personal & Business Manager accounts
• Gmail accounts
• Professional advertising accounts
• TikTok, Instagram, Reddit accounts

All accounts are verified and ready to use. Choose from the menu below to get started!`,
        
        NO_PRODUCTS: '❌ No products found in this category.',
        OUT_OF_STOCK: '⚠️ This product is currently out of stock.',
        ADDED_TO_CART: '✅ Product added to cart!',
        CART_EMPTY: '🛒 Your cart is empty.',
        
        ERROR: '❌ Something went wrong. Please try again.',
        MAINTENANCE: '🔧 Bot is under maintenance. Please try again later.',
        
        // Webhook specific messages
        WEBHOOK_SETUP: '🔗 Setting up webhook...',
        WEBHOOK_SUCCESS: '✅ Webhook configured successfully!',
        WEBHOOK_ERROR: '❌ Failed to configure webhook.'
    },
    
    // Webhook configuration
    WEBHOOK: {
        MAX_CONNECTIONS: 40,
        ALLOWED_UPDATES: ['message', 'callback_query']
    }
};
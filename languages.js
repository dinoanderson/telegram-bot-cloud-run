// Multilingual support for the bot
const languages = {
    'en': {
        code: 'en',
        name: 'English',
        flag: '🇺🇸',
        messages: {
            // Language selection
            CHOOSE_LANGUAGE: '🌐 **Choose Your Language / 选择语言**\n\nSelect your preferred language:',
            LANGUAGE_CHANGED: '✅ Language changed to English',
            
            // Welcome and main messages
            WELCOME: `🛍️ **Welcome to the Advertising Accounts Store!**

Browse our premium collection of social media accounts:
• Facebook Personal & Business Manager accounts
• Gmail accounts  
• Professional advertising accounts

All accounts are verified and ready to use. Choose from the menu below to get started!`,

            MAIN_MENU: '🏠 **Main Menu**\n\nChoose an option below to browse our products:',
            
            // Navigation
            BROWSE_BY_PLATFORM: '📱 **Browse by Platform**\n\nSelect a platform to view available products:',
            BROWSE_BY_PRICE: '💰 **Browse by Price**\n\nSelect a price range to view products:',
            PRODUCTS_IN_STOCK: '🔥 **Products In Stock**\n\nPage {page}/{totalPages} • {total} products available',
            SEARCH_RESULTS: '🔍 **Search Results for "{query}"**\n\nPage {page}/{totalPages} • {total} products found',
            
            // Product related
            NO_PRODUCTS: '❌ No products found in this category.',
            OUT_OF_STOCK: '⚠️ This product is currently out of stock.',
            ADDED_TO_CART: '✅ Product added to cart!',
            
            // Cart
            CART_EMPTY: '🛒 Your cart is empty.',
            CART_TITLE: '🛒 **Your Cart**',
            CART_TOTAL: '💳 **Total: ${total}**',
            CART_ITEMS_COUNT: '{count} item(s) in cart',
            CLEAR_CART_CONFIRM: '🗑️ **Clear Cart**\n\nAre you sure you want to remove all items from your cart?',
            CART_CLEARED: '✅ **Cart Cleared**\n\nAll items have been removed from your cart.',
            
            // Checkout
            CHECKOUT_TITLE: '💳 **Checkout**',
            CHECKOUT_ORDER_SUMMARY: '📋 **Order Summary:**',
            CHECKOUT_NEXT_STEPS: '📞 **Next Steps:**\n1. Contact our support team\n2. Send this order summary\n3. Choose payment method\n4. Receive your accounts',
            CHECKOUT_CONTACT: '💬 **Contact:** @support_username\n📧 **Email:** support@example.com',
            
            // Search
            SEARCH_PROMPT: '🔍 **Search Products**\n\nEnter your search term:',
            SEARCH_NO_RESULTS: '🔍 No products found for "{query}"\n\nTry different keywords or browse by category.',
            
            // Settings and help
            SETTINGS_TITLE: '⚙️ **Settings**\n\nBot settings and information:',
            HELP_TITLE: '❓ **Help & Support**',
            HELP_CONTENT: `**How to use this bot:**
1️⃣ Browse products by platform or price
2️⃣ View product details and availability  
3️⃣ Add items to your cart
4️⃣ Checkout when ready

**Product Categories:**
📘 **Facebook** - Personal accounts, Business Manager, Fan Pages
📧 **Gmail** - Google accounts
🔗 **Mixed** - Various account types

**Need Help?**
Contact our support team for assistance with:
• Product questions • Payment methods
• Account delivery • Technical issues

**Commands:**
/start - Start the bot
/help - Show this help
/cart - View your cart
/menu - Main menu
/lang - Change language`,

            // Statistics
            STATS_TITLE: '📊 **Store Statistics**',
            STATS_BY_PLATFORM: '**📱 By Platform:**',
            STATS_BY_PRICE: '**💰 By Price Range:**',
            STATS_SUMMARY: '**📈 Summary:**',
            STATS_TOTAL_PRODUCTS: '• Total Products: {total}',
            STATS_IN_STOCK: '• In Stock: {inStock}',
            STATS_AVAILABILITY: '• Availability: {percent}%',
            
            // Product status
            IN_STOCK: 'In Stock',
            OUT_OF_STOCK: 'Out of Stock',
            
            // Generic messages
            ERROR: '❌ Something went wrong. Please try again.',
            MAINTENANCE: '🔧 Bot is under maintenance. Please try again later.',
            ACCESS_DENIED: '❌ Access denied.',
            LOADING: '⏳ Loading...',
            
            // Admin
            ADMIN_PANEL: '⚙️ Admin Panel:',
            ADMIN_STATS: '📊 **Bot Statistics**',
        },
        
        buttons: {
            // Main navigation
            BROWSE_PLATFORM: '📱 Browse by Platform',
            BROWSE_PRICE: '💰 Browse by Price', 
            IN_STOCK: '🔥 In Stock Now',
            SEARCH: '🔍 Search',
            CART: '🛒 Cart',
            SETTINGS: '⚙️ Settings',
            
            // Navigation
            BACK_TO_MENU: '🔙 Back to Menu',
            BACK_TO_PLATFORMS: '🔙 Back to Platforms',
            BACK_TO_CATEGORIES: '🔙 Back to Categories',
            BACK_TO_LIST: '🔙 Back to List',
            MAIN_MENU: '🏠 Main Menu',
            
            // Pagination
            PREV: '◀️ Prev',
            NEXT: 'Next ▶️',
            PAGE_INFO: '📄 {page}/{total}',
            
            // Cart actions
            ADD_TO_CART: '➕ Add to Cart',
            VIEW_CART: '🛒 View Cart',
            CONTINUE_SHOPPING: '🛍️ Continue Shopping',
            START_SHOPPING: '🛍️ Start Shopping',
            CHECKOUT: '💳 Checkout',
            CLEAR_CART: '🗑️ Clear Cart',
            REMOVE_ITEM: '🗑️',
            
            // Confirmation
            CONFIRM: '✅ Confirm',
            CANCEL: '❌ Cancel',
            
            // Contact
            CONTACT_SUPPORT: '💬 Contact Support',
            EMAIL_SUPPORT: '📧 Email Support',
            
            // Settings
            REFRESH_PRODUCTS: '🔄 Refresh Products',
            STATISTICS: '📊 Statistics',
            HELP: '❓ Help',
            CHANGE_LANGUAGE: '🌐 Language',
            
            // Language selection
            SELECT_LANGUAGE: 'Select Language',
        }
    },
    
    'zh': {
        code: 'zh',
        name: '中文',
        flag: '🇨🇳',
        messages: {
            // Language selection
            CHOOSE_LANGUAGE: '🌐 **选择您的语言 / Choose Your Language**\n\n选择您偏好的语言：',
            LANGUAGE_CHANGED: '✅ 语言已更改为中文',
            
            // Welcome and main messages
            WELCOME: `🛍️ **欢迎来到广告账户商店！**

浏览我们的优质社交媒体账户：
• Facebook 个人及商业管理账户
• Gmail 账户
• 专业广告账户

所有账户均已验证，随时可用。从下方菜单开始选购！`,

            MAIN_MENU: '🏠 **主菜单**\n\n选择下面的选项浏览我们的产品：',
            
            // Navigation  
            BROWSE_BY_PLATFORM: '📱 **按平台浏览**\n\n选择平台查看可用产品：',
            BROWSE_BY_PRICE: '💰 **按价格浏览**\n\n选择价格范围查看产品：',
            PRODUCTS_IN_STOCK: '🔥 **现货产品**\n\n第 {page}/{totalPages} 页 • {total} 个产品可用',
            SEARCH_RESULTS: '🔍 **"{query}" 的搜索结果**\n\n第 {page}/{totalPages} 页 • 找到 {total} 个产品',
            
            // Product related
            NO_PRODUCTS: '❌ 该分类中未找到产品。',
            OUT_OF_STOCK: '⚠️ 该产品目前缺货。',
            ADDED_TO_CART: '✅ 产品已添加到购物车！',
            
            // Cart
            CART_EMPTY: '🛒 您的购物车为空。',
            CART_TITLE: '🛒 **您的购物车**',
            CART_TOTAL: '💳 **总计：${total}**',
            CART_ITEMS_COUNT: '购物车中有 {count} 件商品',
            CLEAR_CART_CONFIRM: '🗑️ **清空购物车**\n\n您确定要移除购物车中的所有商品吗？',
            CART_CLEARED: '✅ **购物车已清空**\n\n所有商品已从购物车中移除。',
            
            // Checkout
            CHECKOUT_TITLE: '💳 **结账**',
            CHECKOUT_ORDER_SUMMARY: '📋 **订单摘要：**',
            CHECKOUT_NEXT_STEPS: '📞 **下一步：**\n1. 联系我们的客服团队\n2. 发送此订单摘要\n3. 选择付款方式\n4. 接收您的账户',
            CHECKOUT_CONTACT: '💬 **联系：** @support_username\n📧 **邮箱：** support@example.com',
            
            // Search
            SEARCH_PROMPT: '🔍 **搜索产品**\n\n输入您的搜索词：',
            SEARCH_NO_RESULTS: '🔍 未找到 "{query}" 的相关产品\n\n尝试不同的关键词或按分类浏览。',
            
            // Settings and help
            SETTINGS_TITLE: '⚙️ **设置**\n\n机器人设置和信息：',
            HELP_TITLE: '❓ **帮助与支持**',
            HELP_CONTENT: `**如何使用此机器人：**
1️⃣ 按平台或价格浏览产品
2️⃣ 查看产品详情和可用性
3️⃣ 将商品添加到购物车
4️⃣ 准备好后结账

**产品分类：**
📘 **Facebook** - 个人账户、商业管理、粉丝页面
📧 **Gmail** - Google 账户
🔗 **混合** - 各种账户类型

**需要帮助？**
联系我们的客服团队获取以下帮助：
• 产品问题 • 付款方式
• 账户交付 • 技术问题

**命令：**
/start - 启动机器人
/help - 显示此帮助
/cart - 查看购物车
/menu - 主菜单
/lang - 更改语言`,

            // Statistics
            STATS_TITLE: '📊 **商店统计**',
            STATS_BY_PLATFORM: '**📱 按平台：**',
            STATS_BY_PRICE: '**💰 按价格范围：**',
            STATS_SUMMARY: '**📈 总结：**',
            STATS_TOTAL_PRODUCTS: '• 总产品数：{total}',
            STATS_IN_STOCK: '• 现货：{inStock}',
            STATS_AVAILABILITY: '• 可用性：{percent}%',
            
            // Product status
            IN_STOCK: '现货',
            OUT_OF_STOCK: '缺货',
            
            // Generic messages
            ERROR: '❌ 出现问题，请重试。',
            MAINTENANCE: '🔧 机器人维护中，请稍后再试。',
            ACCESS_DENIED: '❌ 访问被拒绝。',
            LOADING: '⏳ 加载中...',
            
            // Admin
            ADMIN_PANEL: '⚙️ 管理面板：',
            ADMIN_STATS: '📊 **机器人统计**',
        },
        
        buttons: {
            // Main navigation
            BROWSE_PLATFORM: '📱 按平台浏览',
            BROWSE_PRICE: '💰 按价格浏览',
            IN_STOCK: '🔥 现货',
            SEARCH: '🔍 搜索',
            CART: '🛒 购物车',
            SETTINGS: '⚙️ 设置',
            
            // Navigation
            BACK_TO_MENU: '🔙 返回菜单',
            BACK_TO_PLATFORMS: '🔙 返回平台',
            BACK_TO_CATEGORIES: '🔙 返回分类',
            BACK_TO_LIST: '🔙 返回列表',
            MAIN_MENU: '🏠 主菜单',
            
            // Pagination
            PREV: '◀️ 上一页',
            NEXT: '下一页 ▶️',
            PAGE_INFO: '📄 {page}/{total}',
            
            // Cart actions
            ADD_TO_CART: '➕ 加入购物车',
            VIEW_CART: '🛒 查看购物车',
            CONTINUE_SHOPPING: '🛍️ 继续购物',
            START_SHOPPING: '🛍️ 开始购物',
            CHECKOUT: '💳 结账',
            CLEAR_CART: '🗑️ 清空购物车',
            REMOVE_ITEM: '🗑️',
            
            // Confirmation
            CONFIRM: '✅ 确认',
            CANCEL: '❌ 取消',
            
            // Contact
            CONTACT_SUPPORT: '💬 联系客服',
            EMAIL_SUPPORT: '📧 邮件客服',
            
            // Settings
            REFRESH_PRODUCTS: '🔄 刷新产品',
            STATISTICS: '📊 统计',
            HELP: '❓ 帮助',
            CHANGE_LANGUAGE: '🌐 语言',
            
            // Language selection
            SELECT_LANGUAGE: '选择语言',
        }
    }
};

class LanguageManager {
    constructor() {
        this.userLanguages = new Map(); // userId -> language code
        this.defaultLanguage = 'en';
        this.priceMarkup = {
            'zh': 1.5, // 50% markup for Chinese users
            'en': 1.0  // No markup for English users
        };
        
        // Comprehensive product description translations
        this.descriptionTranslations = {
            // Basic terms
            'Facebook': 'Facebook',
            'Gmail': 'Gmail',
            'Google': '谷歌',
            'Business Manager': '商业管理器',
            'Personal Account': '个人账户',
            'Fan Page': '粉丝页面',
            'Advertising Account': '广告账户',
            'Mixed Accounts': '混合账户',
            
            // Status and limits
            'UNLIMITED': '无限制',
            'NO LIMIT': '无限制',
            'Reinstated': '已恢复',
            'verified': '已验证',
            'ready to use': '即用型',
            'high quality': '高品质',
            'premium': '高级',
            'professional': '专业',
            
            // Account types and features
            'Ad accounts': '广告账户',
            'Ads manager': '广告管理器',
            'spending limit': '消费限额',
            'ban risk': '封号风险',
            'no ban risk': '无封号风险',
            'already created': '已创建',
            'can create': '可创建',
            'can spend': '可消费',
            'since first day': '从第一天起',
            'first day': '第一天',
            'currency can be changed': '可更改货币',
            
            // Actions and capabilities
            'create': '创建',
            'spend': '消费',
            'change': '更改',
            'manage': '管理',
            'access': '访问',
            'control': '控制',
            
            // Numbers and quantities
            'unlimited': '无限',
            'accounts': '个账户',
            'account': '账户'
        };
    }
    
    // Get user's language or default
    getUserLanguage(userId) {
        return this.userLanguages.get(userId) || this.defaultLanguage;
    }
    
    // Set user's language
    setUserLanguage(userId, langCode) {
        if (languages[langCode]) {
            this.userLanguages.set(userId, langCode);
            return true;
        }
        return false;
    }
    
    // Get translated message
    getMessage(userId, key, replacements = {}) {
        const langCode = this.getUserLanguage(userId);
        const lang = languages[langCode];
        
        let message = lang.messages[key] || languages[this.defaultLanguage].messages[key] || key;
        
        // Replace placeholders
        Object.keys(replacements).forEach(placeholder => {
            message = message.replace(new RegExp(`{${placeholder}}`, 'g'), replacements[placeholder]);
        });
        
        return message;
    }
    
    // Get translated button text
    getButton(userId, key, replacements = {}) {
        const langCode = this.getUserLanguage(userId);
        const lang = languages[langCode];
        
        let text = lang.buttons[key] || languages[this.defaultLanguage].buttons[key] || key;
        
        // Replace placeholders
        Object.keys(replacements).forEach(placeholder => {
            text = text.replace(new RegExp(`{${placeholder}}`, 'g'), replacements[placeholder]);
        });
        
        return text;
    }
    
    // Get language selection keyboard
    getLanguageSelectionKeyboard() {
        const keyboard = [];
        
        Object.values(languages).forEach(lang => {
            keyboard.push([{
                text: `${lang.flag} ${lang.name}`,
                callback_data: `lang_${lang.code}`
            }]);
        });
        
        return { inline_keyboard: keyboard };
    }
    
    // Get all available languages
    getAvailableLanguages() {
        return Object.keys(languages);
    }
    
    // Check if language code exists
    isValidLanguage(langCode) {
        return languages.hasOwnProperty(langCode);
    }
    
    // Apply price markup based on user language
    getLocalizedPrice(userId, originalPrice) {
        const langCode = this.getUserLanguage(userId);
        const markup = this.priceMarkup[langCode] || 1.0;
        return originalPrice * markup;
    }
    
    // Format price with currency symbol
    formatPrice(userId, price) {
        const localizedPrice = this.getLocalizedPrice(userId, price);
        
        // Always use USD currency symbol, even for Chinese users
        return `$${localizedPrice.toFixed(2)}`;
    }
    
    // Advanced product translation function
    translateDescription(userId, description) {
        const langCode = this.getUserLanguage(userId);
        
        if (langCode === 'en' || !description) {
            return description;
        }
        
        // For Chinese, perform comprehensive translation
        let translatedText = description;
        
        if (langCode === 'zh') {
            // Step 1: Replace specific patterns first (more specific to less specific)
            translatedText = translatedText
                // Handle price patterns
                .replace(/\$(\d+)/g, '¥$1')
                .replace(/\[(\$?\d+)\]/g, '【$1】')
                .replace(/\[NO LIMIT\]/gi, '【无限制】')
                .replace(/\[UNLIMITED\]/gi, '【无限制】')
                
                // Handle BM patterns
                .replace(/BM(\d+)/g, '商管$1')
                .replace(/Facebook BM(\d+)/gi, 'Facebook商管$1')
                
                // Handle complex sentences
                .replace(/Can create (\d+) unlimited Ad accounts/gi, '可创建$1个无限制广告账户')
                .replace(/Can create (\d+)/gi, '可创建$1个')
                .replace(/(\d+) unlimited Ad accounts already created/gi, '已创建$1个无限制广告账户')
                .replace(/(\d+) Ad accounts already created/gi, '已创建$1个广告账户')
                .replace(/have (\$?\d+) limit/gi, '限额$1')
                .replace(/have NO limit/gi, '无限额')
                .replace(/Can spend NO LIMIT/gi, '可无限消费')
                .replace(/No ban risk when ad accounts creation/gi, '创建广告账户无封号风险')
                .replace(/Currency can be changed/gi, '可更改货币')
                .replace(/since first day/gi, '从第一天起')
                
                // Handle dots pattern (decorative)
                .replace(/· · · · · · · · · · · · · · · · · · · · · ·/g, '········');
            
            // Step 2: Replace individual terms
            Object.keys(this.descriptionTranslations).forEach(englishTerm => {
                const chineseTerm = this.descriptionTranslations[englishTerm];
                const regex = new RegExp(`\\b${englishTerm}\\b`, 'gi');
                translatedText = translatedText.replace(regex, chineseTerm);
            });
            
            // Step 3: Handle remaining patterns
            translatedText = translatedText
                .replace(/(\d+)\s*accounts/gi, '$1个账户')
                .replace(/unlimited/gi, '无限制')
                .replace(/UNLIMITED/g, '无限制')
                .replace(/NO LIMIT/g, '无限制')
                .replace(/Reinstated/gi, '已恢复')
                
                // Clean up any double spaces or formatting issues
                .replace(/\s+/g, ' ')
                .trim();
        }
        
        return translatedText;
    }
    
    // Get localized product object with translated descriptions and adjusted prices
    getLocalizedProduct(userId, product) {
        if (!product) return product;
        
        const localizedProduct = { ...product };
        const langCode = this.getUserLanguage(userId);
        
        // Use database translations if available, otherwise fall back to rule-based translation
        if (langCode === 'zh') {
            localizedProduct.name = product.name_zh || this.translateDescription(userId, product.name);
            localizedProduct.description = product.description_zh || this.translateDescription(userId, product.description);
            
            // Use translated category if available
            if (product.category_zh) {
                localizedProduct.platform_category = product.category_zh;
            } else if (product.platform_category) {
                localizedProduct.platform_category = this.translateDescription(userId, product.platform_category);
            }
        } else {
            // For English, use original content
            localizedProduct.name = product.name;
            localizedProduct.description = product.description;
        }
        
        // Apply price markup but keep original price for calculations
        localizedProduct.displayPrice = this.getLocalizedPrice(userId, product.price);
        localizedProduct.formattedPrice = this.formatPrice(userId, product.price);
        
        return localizedProduct;
    }
}

module.exports = { LanguageManager, languages };
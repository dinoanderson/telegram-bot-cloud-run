const axios = require('axios');

class ChineseTranslator {
    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY;
        this.model = "meta-llama/llama-4-maverick:free";
        this.cache = new Map();
        this.batchSize = 15; // Products per batch to maximize context
        this.rateLimit = 2000; // 2 seconds between requests
        this.lastRequest = 0;
    }

    async translateProductsBatch(products) {
        if (!this.apiKey) {
            throw new Error('OPENROUTER_API_KEY not found');
        }

        // Rate limiting
        const now = Date.now();
        if (now - this.lastRequest < this.rateLimit) {
            await new Promise(resolve => setTimeout(resolve, this.rateLimit - (now - this.lastRequest)));
        }
        this.lastRequest = Date.now();

        try {
            console.log(`🇨🇳 AI translating batch of ${products.length} products to Chinese...`);
            
            const prompt = this.buildChineseTranslationPrompt(products);
            
            const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                model: this.model,
                messages: [{
                    role: "user",
                    content: prompt
                }],
                temperature: 0.1,
                max_tokens: 4000
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://github.com/ads-account-bot',
                    'X-Title': 'Ads Account Bot Chinese Translation'
                },
                timeout: 30000
            });

            const responseText = response.data.choices[0].message.content;
            
            // Extract JSON from response
            let jsonText = responseText;
            const jsonStart = responseText.indexOf('{');
            const jsonEnd = responseText.lastIndexOf('}');
            
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                jsonText = responseText.substring(jsonStart, jsonEnd + 1);
            }
            
            const aiResponse = JSON.parse(jsonText);
            
            if (aiResponse.products && Array.isArray(aiResponse.products)) {
                console.log(`✅ AI translated ${aiResponse.products.length} products to Chinese successfully`);
                return this.mergeTranslations(products, aiResponse.products);
            } else {
                throw new Error('Invalid AI response format - missing products array');
            }

        } catch (error) {
            console.log(`❌ Chinese AI translation failed: ${error.message}`);
            throw error;
        }
    }

    buildChineseTranslationPrompt(products) {
        const productsData = products.map((product, index) => ({
            id: index,
            name: product.name || '',
            description: product.description || '',
            category: product.category || product.platform_category || 'General'
        }));

        return `Translate the following English advertising account products to Chinese (Simplified). These are digital social media accounts and advertising services for Chinese customers.

PRODUCTS TO TRANSLATE:
${JSON.stringify(productsData, null, 2)}

TRANSLATION RULES:
1. Translate product names and descriptions from English to Chinese (Simplified)
2. Keep brand names like "Facebook", "Instagram", "Gmail", "Google" in English
3. Translate technical terms appropriately for Chinese users:
   - "Business Manager" → "商业管理器"
   - "Personal Accounts" → "个人账户"
   - "Advertising Accounts" → "广告账户"
   - "Fan Pages" → "粉丝页面"
   - "Reinstated" → "已恢复"
   - "UNLIMITED" → "无限制"
   - "NO LIMIT" → "无限制"
4. Convert currency symbols: $ → ¥ (but keep the numbers as they will be adjusted by pricing system)
5. Translate account capabilities and features clearly for Chinese market
6. Make descriptions professional and appealing to Chinese customers
7. Keep technical specifications and numbers intact
8. Translate common phrases:
   - "Can create" → "可创建"
   - "Can spend" → "可消费"
   - "No ban risk" → "无封号风险"
   - "Already created" → "已创建"
   - "Currency can be changed" → "可更改货币"
   - "Since first day" → "从第一天起"

REQUIRED RESPONSE FORMAT (valid JSON only):
{
  "products": [
    {
      "id": 0,
      "name": "Chinese translated name",
      "description": "Chinese translated description", 
      "category": "Chinese translated category"
    }
  ]
}

Return only the JSON response, no additional text.`;
    }

    mergeTranslations(originalProducts, translatedProducts) {
        return originalProducts.map((original, index) => {
            const translated = translatedProducts.find(t => t.id === index);
            
            if (translated) {
                return {
                    ...original,
                    name_zh: translated.name || original.name,
                    description_zh: translated.description || original.description,
                    category_zh: translated.category || original.category
                };
            }
            
            return original;
        });
    }

    async translateProducts(products) {
        if (!products || products.length === 0) {
            return products;
        }

        const translatedProducts = [];
        
        // Process in batches
        for (let i = 0; i < products.length; i += this.batchSize) {
            const batch = products.slice(i, i + this.batchSize);
            console.log(`📦 Processing Chinese translation batch ${Math.floor(i/this.batchSize) + 1}/${Math.ceil(products.length/this.batchSize)}`);
            
            try {
                const translatedBatch = await this.translateProductsBatch(batch);
                translatedProducts.push(...translatedBatch);
            } catch (error) {
                console.log(`❌ Failed to translate batch, using original text`);
                // Add original products if translation fails
                translatedProducts.push(...batch);
            }
            
            // Small delay between batches
            if (i + this.batchSize < products.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return translatedProducts;
    }

    // Quick text translation for simple strings
    async translateText(text, context = '') {
        if (!this.apiKey || !text || typeof text !== 'string') {
            return text;
        }

        const cacheKey = `zh_${text}_${context}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const prompt = `Translate this English text to Chinese (Simplified)${context ? ` (context: ${context})` : ''}: "${text}"
            
Return only the Chinese translation, no additional text.`;

            const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                model: this.model,
                messages: [{
                    role: "user",
                    content: prompt
                }],
                temperature: 0.1,
                max_tokens: 200
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://github.com/ads-account-bot',
                    'X-Title': 'Ads Account Bot Chinese Translation'
                },
                timeout: 15000
            });

            const translatedText = response.data.choices[0].message.content.trim();
            this.cache.set(cacheKey, translatedText);
            return translatedText;

        } catch (error) {
            console.log(`Chinese text AI translation failed: ${error.message}`);
            return text;
        }
    }

    clearCache() {
        this.cache.clear();
    }
}

module.exports = ChineseTranslator;
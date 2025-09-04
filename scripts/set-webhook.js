require('dotenv').config();
const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL; // Your Cloud Run URL

if (!BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN is required');
    process.exit(1);
}

if (!WEBHOOK_URL) {
    console.error('❌ WEBHOOK_URL is required (your Cloud Run URL)');
    console.error('Example: https://your-bot-abc123-uc.a.run.app/webhook');
    process.exit(1);
}

async function setWebhook() {
    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`;
        const webhookEndpoint = `${WEBHOOK_URL.replace(/\/$/, '')}/webhook`;
        
        console.log(`🔗 Setting webhook to: ${webhookEndpoint}`);
        
        const response = await axios.post(url, {
            url: webhookEndpoint,
            max_connections: 40,
            allowed_updates: ['message', 'callback_query']
        });
        
        if (response.data.ok) {
            console.log('✅ Webhook set successfully!');
            console.log('📋 Response:', response.data);
        } else {
            console.error('❌ Failed to set webhook:', response.data);
        }
    } catch (error) {
        console.error('❌ Error setting webhook:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

// Also get current webhook info
async function getWebhookInfo() {
    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`;
        const response = await axios.get(url);
        
        console.log('📊 Current webhook info:');
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ Error getting webhook info:', error.message);
    }
}

async function main() {
    console.log('🚀 Setting up Telegram webhook...\n');
    
    await setWebhook();
    console.log('\n📊 Getting webhook info...\n');
    await getWebhookInfo();
}

main();
require('dotenv').config();
const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN is required');
    process.exit(1);
}

async function deleteWebhook() {
    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`;
        
        console.log('🗑️  Deleting webhook...');
        
        const response = await axios.post(url, {
            drop_pending_updates: true
        });
        
        if (response.data.ok) {
            console.log('✅ Webhook deleted successfully!');
            console.log('📋 Response:', response.data);
        } else {
            console.error('❌ Failed to delete webhook:', response.data);
        }
    } catch (error) {
        console.error('❌ Error deleting webhook:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

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
    console.log('🗑️  Deleting Telegram webhook...\n');
    
    await deleteWebhook();
    console.log('\n📊 Getting webhook info after deletion...\n');
    await getWebhookInfo();
}

main();
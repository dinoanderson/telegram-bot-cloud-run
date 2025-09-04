require('dotenv').config();
const { Firestore } = require('@google-cloud/firestore');

const GOOGLE_CLOUD_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || 'dino-ziyuan-bot';

console.log(`🔍 Testing Firestore connection to project: ${GOOGLE_CLOUD_PROJECT_ID}`);

async function testFirestore() {
    try {
        // Initialize Firestore
        const firestore = new Firestore({
            projectId: GOOGLE_CLOUD_PROJECT_ID,
        });

        console.log('✅ Firestore client initialized');

        // Test collection access
        const testCollection = firestore.collection('test');
        
        // Try to add a test document
        const testDoc = await testCollection.add({
            message: 'Hello from Telegram Bot!',
            timestamp: new Date(),
            test: true
        });

        console.log('✅ Test document created:', testDoc.id);

        // Try to read it back
        const doc = await testDoc.get();
        const data = doc.data();
        console.log('✅ Test document data:', data);

        // Clean up - delete test document
        await testDoc.delete();
        console.log('✅ Test document deleted');

        console.log('\n🎉 Firestore is working correctly!');
        console.log('✅ Database connection: SUCCESS');
        console.log('✅ Write operations: SUCCESS');
        console.log('✅ Read operations: SUCCESS');
        console.log('✅ Delete operations: SUCCESS');

    } catch (error) {
        console.error('❌ Firestore test failed:', error.message);
        
        if (error.code === 7) {
            console.error('\n🔧 Possible solutions:');
            console.error('1. Make sure Firestore is enabled in Google Cloud Console');
            console.error('2. Check that your project ID is correct: dino-ziyuan-bot');
            console.error('3. Verify you have proper permissions');
        }
        
        process.exit(1);
    }
}

testFirestore();
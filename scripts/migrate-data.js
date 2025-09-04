require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const { Firestore } = require('@google-cloud/firestore');
const path = require('path');

// Configuration
const SQLITE_DB_PATH = path.join(__dirname, '../../products.db');
const GOOGLE_CLOUD_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;

if (!GOOGLE_CLOUD_PROJECT_ID) {
    console.error('❌ GOOGLE_CLOUD_PROJECT_ID is required');
    process.exit(1);
}

class DataMigrator {
    constructor() {
        // Initialize SQLite
        this.sqliteDb = new sqlite3.Database(SQLITE_DB_PATH);
        
        // Initialize Firestore
        this.firestore = new Firestore({
            projectId: GOOGLE_CLOUD_PROJECT_ID,
        });
        
        this.productsCollection = this.firestore.collection('products');
        this.shopsCollection = this.firestore.collection('shops');
    }

    async migrateProducts() {
        return new Promise((resolve, reject) => {
            console.log('📦 Starting product migration...');
            
            const query = 'SELECT * FROM products';
            
            this.sqliteDb.all(query, async (err, rows) => {
                if (err) {
                    console.error('❌ Error reading products from SQLite:', err);
                    reject(err);
                    return;
                }
                
                console.log(`🔍 Found ${rows.length} products to migrate`);
                
                try {
                    let migratedCount = 0;
                    const batchSize = 500; // Firestore batch limit
                    
                    for (let i = 0; i < rows.length; i += batchSize) {
                        const batch = this.firestore.batch();
                        const batchProducts = rows.slice(i, i + batchSize);
                        
                        for (const product of batchProducts) {
                            // Create document ID from original ID
                            const docRef = this.productsCollection.doc(product.id.toString());
                            
                            // Convert SQLite row to Firestore document
                            const firestoreDoc = {
                                name: product.name || '',
                                description: product.description || '',
                                price: parseFloat(product.price) || 0,
                                stock: parseInt(product.stock) || 0,
                                platform: product.platform || 'Unknown',
                                platform_category: product.platform_category || 'Uncategorized',
                                shop_domain: product.shop_domain || '',
                                product_url: product.product_url || '',
                                created_at: new Date(product.created_at || Date.now()),
                                updated_at: new Date(product.updated_at || Date.now())
                            };
                            
                            // Add Chinese translations if they exist
                            if (product.name_zh) {
                                firestoreDoc.name_zh = product.name_zh;
                            }
                            if (product.description_zh) {
                                firestoreDoc.description_zh = product.description_zh;
                            }
                            if (product.category_zh) {
                                firestoreDoc.category_zh = product.category_zh;
                            }
                            
                            batch.set(docRef, firestoreDoc);
                        }
                        
                        await batch.commit();
                        migratedCount += batchProducts.length;
                        
                        console.log(`✅ Migrated ${migratedCount}/${rows.length} products`);
                    }
                    
                    console.log(`🎉 Successfully migrated ${migratedCount} products!`);
                    resolve(migratedCount);
                    
                } catch (error) {
                    console.error('❌ Error writing to Firestore:', error);
                    reject(error);
                }
            });
        });
    }

    async migrateShops() {
        return new Promise((resolve, reject) => {
            console.log('🏪 Starting shops migration...');
            
            const query = 'SELECT * FROM shops WHERE active = 1';
            
            this.sqliteDb.all(query, async (err, rows) => {
                if (err) {
                    console.error('❌ Error reading shops from SQLite:', err);
                    reject(err);
                    return;
                }
                
                if (!rows || rows.length === 0) {
                    console.log('ℹ️  No active shops found to migrate');
                    resolve(0);
                    return;
                }
                
                console.log(`🔍 Found ${rows.length} shops to migrate`);
                
                try {
                    let migratedCount = 0;
                    const batch = this.firestore.batch();
                    
                    for (const shop of rows) {
                        const docRef = this.shopsCollection.doc(shop.id.toString());
                        
                        const firestoreDoc = {
                            domain: shop.domain || '',
                            name: shop.name || '',
                            base_url: shop.base_url || '',
                            active: Boolean(shop.active),
                            created_at: new Date(shop.created_at || Date.now())
                        };
                        
                        batch.set(docRef, firestoreDoc);
                        migratedCount++;
                    }
                    
                    await batch.commit();
                    
                    console.log(`🎉 Successfully migrated ${migratedCount} shops!`);
                    resolve(migratedCount);
                    
                } catch (error) {
                    console.error('❌ Error writing shops to Firestore:', error);
                    reject(error);
                }
            });
        });
    }

    async verifyMigration() {
        try {
            console.log('🔍 Verifying migration...');
            
            // Count products in Firestore
            const productsSnapshot = await this.productsCollection.get();
            console.log(`📦 Products in Firestore: ${productsSnapshot.size}`);
            
            // Count shops in Firestore
            const shopsSnapshot = await this.shopsCollection.get();
            console.log(`🏪 Shops in Firestore: ${shopsSnapshot.size}`);
            
            // Sample a few products to verify data integrity
            const sampleDocs = productsSnapshot.docs.slice(0, 3);
            console.log('\n📋 Sample products:');
            sampleDocs.forEach(doc => {
                const data = doc.data();
                console.log(`  • ${data.name} - $${data.price} (${data.platform})`);
            });
            
            console.log('\n✅ Migration verification complete!');
            
        } catch (error) {
            console.error('❌ Error verifying migration:', error);
        }
    }

    async close() {
        this.sqliteDb.close();
    }
}

// Run migration
async function main() {
    const migrator = new DataMigrator();
    
    try {
        console.log('🚀 Starting data migration from SQLite to Firestore...\n');
        
        // Migrate products
        const productCount = await migrator.migrateProducts();
        
        // Migrate shops
        const shopCount = await migrator.migrateShops();
        
        // Verify migration
        await migrator.verifyMigration();
        
        console.log(`\n🎉 Migration completed successfully!`);
        console.log(`📦 Products migrated: ${productCount}`);
        console.log(`🏪 Shops migrated: ${shopCount}`);
        console.log('\n🔗 Your bot is now ready for Cloud Run deployment!');
        
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await migrator.close();
    }
}

// Check if SQLite database exists before running
const fs = require('fs');
if (!fs.existsSync(SQLITE_DB_PATH)) {
    console.error(`❌ SQLite database not found at: ${SQLITE_DB_PATH}`);
    console.error('Please make sure the database file exists before running migration.');
    process.exit(1);
}

main();
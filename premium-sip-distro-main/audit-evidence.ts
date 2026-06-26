
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ebeems';
    console.log('1. EXACT MongoDB connection string currently being used at runtime:', uri);
    
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db();
        
        console.log('\n2. After connecting:');
        console.log('Database name:', db.databaseName);
        
        const collections = await db.listCollections().toArray();
        console.log('\nCollections found:', collections.map(c => c.name));
        
        console.log('\n3. Document counts:');
        console.log('db.users.countDocuments():', await db.collection('users').countDocuments());
        console.log('db.products.countDocuments():', await db.collection('products').countDocuments());
        console.log('db.customerusers.countDocuments():', await db.collection('customerusers').countDocuments());
        console.log('db.customerorders.countDocuments():', await db.collection('customerorders').countDocuments());
        console.log('db.customers.countDocuments():', await db.collection('customers').countDocuments());
        
        console.log('\n4. EXACT collection names from MongoDB:', collections.map(c => c.name));
        
        console.log('\n5. Login emails found in users collection:');
        const users = await db.collection('users').find({}, { projection: { email: 1, _id: 0 } }).toArray();
        users.forEach(u => console.log(u.email));
        
    } finally {
        await client.close();
    }
}

main().catch(console.error);

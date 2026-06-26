
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/server/models/User.js';
import { Product } from './src/server/models/Product.js';
import { Order, Customer, CustomerUser } from './src/server/models/Order.js';

dotenv.config();

async function verifyConnection() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ebeems';
    console.log(`Connecting to MongoDB at: ${uri}`);
    await mongoose.connect(uri);
    console.log('✅ Connected successfully!');

    console.log('\n📊 Database Statistics:');

    // Count users
    const userCount = await User.countDocuments();
    const users = await User.find().select('-password');
    console.log(`- Users: ${userCount}`);
    users.forEach(u => console.log(`  • ${u.name} (${u.email}) - Role: ${u.role}`));

    // Count products
    const productCount = await Product.countDocuments();
    const products = await Product.find();
    console.log(`\n- Products: ${productCount}`);
    products.forEach(p => console.log(`  • ${p.name} - Price: ${p.price} - Qty: ${p.quantity || 0}`));

    // Count orders
    const orderCount = await Order.countDocuments();
    const orders = await Order.find();
    console.log(`\n- Orders: ${orderCount}`);
    orders.forEach(o => console.log(`  • ${o._id} - Total: ${o.totalAmount} - Status: ${o.status}`));

    // Count customers
    const customerCount = await Customer.countDocuments();
    console.log(`\n- Customers: ${customerCount}`);

    // Count customer users
    const customerUserCount = await CustomerUser.countDocuments();
    console.log(`- Customer Users: ${customerUserCount}`);

    console.log('\n✅ All collections verified!');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Connection or verification failed:', error);
    process.exit(1);
  }
}

verifyConnection();

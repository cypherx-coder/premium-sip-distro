
import fetch from 'node-fetch';
const baseUrl = 'http://localhost:5002/api';

async function testAPI() {
    console.log('7. Frontend API requests:');
    console.log('--------------------------');

    // Test 1: /api/products (GET)
    console.log('\n• /api/products:');
    try {
        const res = await fetch(`${baseUrl}/products`);
        const body = await res.text();
        console.log(`  Status: ${res.status}`);
        console.log('  Response:', body);
    } catch (err) {
        console.error('  Error:', err);
    }

    // Test 2: /api/orders/admin (GET)
    console.log('\n• /api/orders/admin:');
    try {
        const res = await fetch(`${baseUrl}/orders/admin`);
        const body = await res.text();
        console.log(`  Status: ${res.status}`);
        console.log('  Response:', body);
    } catch (err) {
        console.error('  Error:', err);
    }

    // Test 3: /api/auth/login (POST with dummy credentials first)
    console.log('\n• /api/auth/login:');
    try {
        const res = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'john@example.com', password: 'wrongpassword' })
        });
        const body = await res.text();
        console.log(`  Status (wrong password): ${res.status}`);
        console.log('  Response (wrong password):', body);
    } catch (err) {
        console.error('  Error:', err);
    }
}

testAPI().catch(console.error);

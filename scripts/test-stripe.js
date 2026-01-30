/**
 * Stripe Connection Test Script
 * 
 * Tests the Stripe API connection and displays account information.
 * Run with: node scripts/test-stripe.js
 */

require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

async function testStripeConnection() {
    console.log('🔍 Testing Stripe connection...\n');

    // Check if API key is configured
    const apiKey = process.env.STRIPE_SECRET_KEY;

    if (!apiKey || apiKey.startsWith('REPLACE')) {
        console.error('❌ STRIPE_SECRET_KEY not configured in .env.local');
        console.log('\n📋 Next steps:');
        console.log('1. Go to https://dashboard.stripe.com/test/apikeys');
        console.log('2. Copy your Secret key (starts with sk_test_)');
        console.log('3. Add it to .env.local: STRIPE_SECRET_KEY=sk_test_...');
        console.log('4. Run this test again\n');
        process.exit(1);
    }

    // Check if using live keys in development
    if (apiKey.startsWith('sk_live_')) {
        console.warn('⚠️  WARNING: You are using LIVE Stripe keys!');
        console.warn('   For development, use TEST keys (sk_test_...)');
        console.warn('   Get test keys from: https://dashboard.stripe.com/test/apikeys\n');
    }

    try {
        // Initialize Stripe
        const stripe = new Stripe(apiKey, {
            apiVersion: '2024-12-18.acacia',
        });

        console.log('✅ Stripe SDK initialized\n');

        // Test 1: Get account information
        console.log('📊 Test 1: Fetching account information...');
        const account = await stripe.accounts.retrieve();
        console.log(`   ✅ Account ID: ${account.id}`);
        console.log(`   ✅ Account Email: ${account.email || 'N/A'}`);
        console.log(`   ✅ Country: ${account.country}`);
        console.log(`   ✅ Charges Enabled: ${account.charges_enabled}`);
        console.log(`   ✅ Payouts Enabled: ${account.payouts_enabled}\n`);

        // Test 2: List products
        console.log('📦 Test 2: Listing products...');
        const products = await stripe.products.list({ limit: 5 });
        console.log(`   ✅ Found ${products.data.length} product(s)`);

        if (products.data.length > 0) {
            products.data.forEach((product, index) => {
                console.log(`   ${index + 1}. ${product.name} (${product.id})`);
            });
        } else {
            console.log('   ℹ️  No products found (this is normal for a new account)');
        }
        console.log('');

        // Test 3: List prices
        console.log('💰 Test 3: Listing prices...');
        const prices = await stripe.prices.list({ limit: 5 });
        console.log(`   ✅ Found ${prices.data.length} price(s)`);

        if (prices.data.length > 0) {
            prices.data.forEach((price, index) => {
                const amount = price.unit_amount ? `${price.unit_amount / 100} ${price.currency.toUpperCase()}` : 'Free';
                console.log(`   ${index + 1}. ${amount} / ${price.recurring?.interval || 'one-time'}`);
            });
        } else {
            console.log('   ℹ️  No prices found (this is normal for a new account)');
        }
        console.log('');

        // Test 4: Check webhook endpoints
        console.log('🔔 Test 4: Listing webhook endpoints...');
        const webhooks = await stripe.webhookEndpoints.list({ limit: 5 });
        console.log(`   ✅ Found ${webhooks.data.length} webhook endpoint(s)`);

        if (webhooks.data.length > 0) {
            webhooks.data.forEach((webhook, index) => {
                console.log(`   ${index + 1}. ${webhook.url}`);
            });
        } else {
            console.log('   ℹ️  No webhook endpoints configured yet');
        }
        console.log('');

        // Success summary
        console.log('═══════════════════════════════════════════════════');
        console.log('✅ Stripe connection test PASSED!');
        console.log('═══════════════════════════════════════════════════');
        console.log('\n🚀 Ready to start Epic 6 - Payments & Subscriptions!\n');

    } catch (error) {
        console.error('\n❌ Stripe connection test FAILED!\n');
        console.error('Error:', error.message);

        if (error.type === 'StripeAuthenticationError') {
            console.log('\n📋 Authentication error - check your API key:');
            console.log('1. Make sure you copied the correct Secret key');
            console.log('2. Verify you\'re using the Test mode key (sk_test_...)');
            console.log('3. Check for extra spaces or quotes in .env.local\n');
        } else if (error.type === 'StripeAPIError') {
            console.log('\n📋 API error - Stripe service issue:');
            console.log('1. Check Stripe status: https://status.stripe.com');
            console.log('2. Try again in a few moments\n');
        } else {
            console.log('\n📋 Unexpected error:');
            console.log('Full error:', error);
        }

        process.exit(1);
    }
}

// Run the test
testStripeConnection();

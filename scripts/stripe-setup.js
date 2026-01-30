/**
 * Stripe Product Setup Script
 * 
 * Lists existing products and prices, and helps configure STRIPE_PRICE_ID.
 * Run with: node scripts/stripe-setup.js
 */

require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

async function setupStripeProducts() {
    console.log('🔧 Stripe Product Setup\n');

    // Check if API key is configured
    const apiKey = process.env.STRIPE_SECRET_KEY;

    if (!apiKey || apiKey.startsWith('REPLACE')) {
        console.error('❌ STRIPE_SECRET_KEY not configured in .env.local');
        process.exit(1);
    }

    try {
        const stripe = new Stripe(apiKey, {
            apiVersion: '2024-12-18.acacia',
        });

        console.log('✅ Stripe SDK initialized\n');

        // List products
        console.log('📦 Fetching products...');
        const products = await stripe.products.list({ limit: 10 });

        if (products.data.length === 0) {
            console.log('   ℹ️  No products found. Creating default product...\n');
            await createDefaultProduct(stripe);
            return;
        }

        console.log(`   ✅ Found ${products.data.length} product(s):\n`);

        // List prices for each product
        for (const product of products.data) {
            console.log(`   📦 ${product.name} (${product.id})`);

            const prices = await stripe.prices.list({
                product: product.id,
                limit: 10,
            });

            if (prices.data.length > 0) {
                prices.data.forEach((price) => {
                    const amount = price.unit_amount
                        ? `${price.unit_amount / 100} ${price.currency.toUpperCase()}`
                        : 'Free';
                    const interval = price.recurring?.interval || 'one-time';
                    console.log(`      💰 ${amount} / ${interval}`);
                    console.log(`         Price ID: ${price.id}`);
                });
            }
            console.log('');
        }

        // Recommendations
        console.log('═══════════════════════════════════════════════════');
        console.log('📋 Next Steps:');
        console.log('═══════════════════════════════════════════════════\n');

        if (products.data.length === 1 && products.data[0].name === 'Aurum+') {
            const prices = await stripe.prices.list({
                product: products.data[0].id,
                limit: 1,
            });

            if (prices.data.length > 0) {
                console.log('✅ You can use the existing "Aurum+" product:\n');
                console.log(`   Add to .env.local:`);
                console.log(`   STRIPE_PRICE_ID=${prices.data[0].id}\n`);
            }
        } else {
            console.log('ℹ️  Multiple products found. Choose one and add its Price ID to .env.local:\n');
            console.log('   STRIPE_PRICE_ID=price_xxxxx\n');
        }

        console.log('Or create a new product:');
        console.log('   1. Go to https://dashboard.stripe.com/test/products');
        console.log('   2. Create "Aurum Sanctuary Premium"');
        console.log('   3. Set price (e.g., €9.99/month)');
        console.log('   4. Copy the Price ID');
        console.log('   5. Add to .env.local: STRIPE_PRICE_ID=price_xxxxx\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

async function createDefaultProduct(stripe) {
    console.log('🆕 Creating default product: "Aurum Sanctuary Premium"\n');

    try {
        // Create product
        const product = await stripe.products.create({
            name: 'Aurum Sanctuary Premium',
            description: 'Full access to weekly insights and emotional clarity tools',
        });

        console.log(`   ✅ Product created: ${product.id}\n`);

        // Create price
        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: 999, // €9.99
            currency: 'eur',
            recurring: {
                interval: 'month',
            },
        });

        console.log(`   ✅ Price created: ${price.id}`);
        console.log(`   💰 €9.99/month\n`);

        console.log('═══════════════════════════════════════════════════');
        console.log('✅ Setup Complete!');
        console.log('═══════════════════════════════════════════════════\n');
        console.log('📋 Add to .env.local:');
        console.log(`   STRIPE_PRICE_ID=${price.id}\n`);

    } catch (error) {
        console.error('❌ Error creating product:', error.message);
        process.exit(1);
    }
}

// Run the setup
setupStripeProducts();

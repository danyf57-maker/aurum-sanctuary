/**
 * Test Upstash Redis Connection
 * 
 * Run with: node test-redis.js
 */

const UPSTASH_REDIS_REST_URL = "https://distinct-tapir-35960.upstash.io";
const UPSTASH_REDIS_REST_TOKEN = "AYx4AAIncDI1ZTUzODgzNWQ4NTY0Yjk1YjdlZGZjNDQ0MjQwYjNiZXAyMzU5NjA";

async function testRedis() {
    console.log('🔍 Testing Upstash Redis connection...\n');

    try {
        // Test 1: PING
        console.log('Test 1: PING');
        const pingResponse = await fetch(`${UPSTASH_REDIS_REST_URL}/ping`, {
            headers: {
                'Authorization': `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
            },
        });
        const pingResult = await pingResponse.json();
        console.log('✅ PING result:', pingResult);

        // Test 2: SET a key
        console.log('\nTest 2: SET test key');
        const setResponse = await fetch(`${UPSTASH_REDIS_REST_URL}/set/test-key/hello-aurum`, {
            headers: {
                'Authorization': `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
            },
        });
        const setResult = await setResponse.json();
        console.log('✅ SET result:', setResult);

        // Test 3: GET the key
        console.log('\nTest 3: GET test key');
        const getResponse = await fetch(`${UPSTASH_REDIS_REST_URL}/get/test-key`, {
            headers: {
                'Authorization': `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
            },
        });
        const getResult = await getResponse.json();
        console.log('✅ GET result:', getResult);

        // Test 4: Rate limit simulation
        console.log('\nTest 4: Rate limit simulation (INCR)');
        const incrResponse = await fetch(`${UPSTASH_REDIS_REST_URL}/incr/ratelimit:test:user123`, {
            headers: {
                'Authorization': `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
            },
        });
        const incrResult = await incrResponse.json();
        console.log('✅ INCR result:', incrResult);

        // Test 5: Set TTL
        console.log('\nTest 5: Set TTL (60 seconds)');
        const expireResponse = await fetch(`${UPSTASH_REDIS_REST_URL}/expire/ratelimit:test:user123/60`, {
            headers: {
                'Authorization': `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
            },
        });
        const expireResult = await expireResponse.json();
        console.log('✅ EXPIRE result:', expireResult);

        console.log('\n🎉 All tests passed! Upstash Redis is working correctly.');
    } catch (error) {
        console.error('\n❌ Error testing Redis:', error);
    }
}

testRedis();

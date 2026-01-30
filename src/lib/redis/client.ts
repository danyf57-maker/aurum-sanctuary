/**
 * Upstash Redis Client for Rate Limiting
 * 
 * Provides rate limiting functionality for Mirror Chat and other API endpoints.
 * Uses Upstash Redis REST API (Edge Runtime compatible).
 */

import { Redis } from '@upstash/redis';

// Initialize Redis client
export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Rate limit configuration
 */
export const RATE_LIMITS = {
    MIRROR_CHAT_TECHNICAL: { limit: 20, window: 60 }, // 20 req/min (technical limit)
    MIRROR_CHAT_UX: { limit: 1, window: 90 }, // 1 req/90s (UX constraint)
    FORGOT_PASSWORD_EMAIL: { limit: 3, window: 3600 }, // 3 req/hour per email
    FORGOT_PASSWORD_IP: { limit: 20, window: 3600 }, // 20 req/hour per IP
} as const;

/**
 * Check if a request is within rate limits
 * 
 * @param key - Unique identifier for the rate limit (e.g., userId, IP address)
 * @param limit - Maximum number of requests allowed
 * @param window - Time window in seconds
 * @returns Object with allowed status and remaining count
 */
export async function checkRateLimit(
    key: string,
    limit: number,
    window: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const rateLimitKey = `ratelimit:${key}`;

    try {
        // Increment counter
        const count = await redis.incr(rateLimitKey);

        // Set TTL on first request
        if (count === 1) {
            await redis.expire(rateLimitKey, window);
        }

        // Get TTL for resetAt calculation
        const ttl = await redis.ttl(rateLimitKey);
        const resetAt = Date.now() + (ttl * 1000);

        const allowed = count <= limit;
        const remaining = Math.max(0, limit - count);

        return {
            allowed,
            remaining,
            resetAt,
        };
    } catch (error) {
        console.error('Rate limit check failed:', error);
        // Fail open (allow request) if Redis is down
        return {
            allowed: true,
            remaining: limit,
            resetAt: Date.now() + (window * 1000),
        };
    }
}

/**
 * Get current rate limit status without incrementing
 * 
 * @param key - Unique identifier for the rate limit
 * @param limit - Maximum number of requests allowed
 * @param window - Time window in seconds
 * @returns Current rate limit status
 */
export async function getRateLimitStatus(
    key: string,
    limit: number,
    window: number
): Promise<{ count: number; remaining: number; resetAt: number }> {
    const rateLimitKey = `ratelimit:${key}`;

    try {
        const count = await redis.get<number>(rateLimitKey) || 0;
        const ttl = await redis.ttl(rateLimitKey);
        const resetAt = ttl > 0 ? Date.now() + (ttl * 1000) : Date.now() + (window * 1000);

        return {
            count,
            remaining: Math.max(0, limit - count),
            resetAt,
        };
    } catch (error) {
        console.error('Get rate limit status failed:', error);
        return {
            count: 0,
            remaining: limit,
            resetAt: Date.now() + (window * 1000),
        };
    }
}

/**
 * Reset rate limit for a specific key
 * 
 * @param key - Unique identifier for the rate limit
 */
export async function resetRateLimit(key: string): Promise<void> {
    const rateLimitKey = `ratelimit:${key}`;
    try {
        await redis.del(rateLimitKey);
    } catch (error) {
        console.error('Reset rate limit failed:', error);
    }
}

/**
 * Helper to create rate limit key for Mirror Chat
 */
export function getMirrorChatRateLimitKey(userId: string, type: 'technical' | 'ux' = 'technical'): string {
    return `mirror:${type}:${userId}`;
}

/**
 * Helper to create rate limit key for Forgot Password (email-based)
 */
export function getForgotPasswordEmailKey(email: string): string {
    return `forgot-password:email:${email.toLowerCase()}`;
}

/**
 * Helper to create rate limit key for Forgot Password (IP-based)
 */
export function getForgotPasswordIPKey(ip: string): string {
    return `forgot-password:ip:${ip}`;
}

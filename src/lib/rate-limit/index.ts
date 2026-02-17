/**
 * Rate Limiting with Upstash Redis
 *
 * Protects API routes from abuse while maintaining good UX
 */

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export interface RateLimitConfig {
  /**
   * Unique identifier (usually userId or IP)
   */
  identifier: string;

  /**
   * Maximum requests allowed in the time window
   */
  limit: number;

  /**
   * Time window in seconds
   */
  window: number;

  /**
   * Namespace for the rate limit (e.g., 'api:reflect')
   */
  namespace: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp when limit resets
}

/**
 * Check if request is within rate limit
 * Uses sliding window algorithm
 */
export async function rateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  // If Redis is not configured, allow the request (fail open)
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('Rate limiting disabled: Upstash Redis not configured');
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit,
      reset: Date.now() + config.window * 1000,
    };
  }

  const key = `ratelimit:${config.namespace}:${config.identifier}`;
  const now = Date.now();
  const windowMs = config.window * 1000;
  const windowStart = now - windowMs;

  try {
    // Remove old entries outside the window
    await redis.zremrangebyscore(key, 0, windowStart);

    // Count requests in current window
    const count = await redis.zcard(key);

    if (count >= config.limit) {
      // Get oldest request timestamp to calculate reset time
      const oldest = await redis.zrange(key, 0, 0, { withScores: true });
      const resetTime = oldest[1] ? Number(oldest[1]) + windowMs : now + windowMs;

      return {
        success: false,
        limit: config.limit,
        remaining: 0,
        reset: resetTime,
      };
    }

    // Add current request
    await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` });

    // Set expiry on the key (cleanup)
    await redis.expire(key, config.window);

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - count - 1,
      reset: now + windowMs,
    };
  } catch (error) {
    // On Redis error, fail open (allow request) to avoid breaking the app
    console.error('Rate limit error (failing open):', error);
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit,
      reset: now + windowMs,
    };
  }
}

/**
 * Preset configurations for common endpoints
 */
export const RateLimitPresets = {
  /**
   * AI reflection endpoint: 20 requests per 5 minutes
   * Conservative to prevent AI API abuse
   */
  reflect: (identifier: string): RateLimitConfig => ({
    identifier,
    limit: 20,
    window: 300, // 5 minutes
    namespace: 'api:reflect',
  }),

  /**
   * AI analysis endpoint: 20 requests per 5 minutes
   */
  analyze: (identifier: string): RateLimitConfig => ({
    identifier,
    limit: 20,
    window: 300, // 5 minutes
    namespace: 'api:analyze',
  }),

  /**
   * Pattern analysis endpoint: 5 requests per hour
   */
  analyzePatterns: (identifier: string): RateLimitConfig => ({
    identifier,
    limit: 5,
    window: 3600,
    namespace: 'api:analyze-patterns',
  }),

  /**
   * Wellbeing analysis endpoint: 3 requests per day
   */
  analyzeWellbeing: (identifier: string): RateLimitConfig => ({
    identifier,
    limit: 3,
    window: 86400,
    namespace: 'api:analyze-wellbeing',
  }),

  /**
   * Personality analysis endpoint: 3 requests per day
   */
  analyzePersonality: (identifier: string): RateLimitConfig => ({
    identifier,
    limit: 3,
    window: 86400,
    namespace: 'api:analyze-personality',
  }),

  /**
   * Weekly digest endpoint: 1 request per day
   */
  generateDigest: (identifier: string): RateLimitConfig => ({
    identifier,
    limit: 1,
    window: 86400,
    namespace: 'api:generate-digest',
  }),

  /**
   * Auth endpoints: 10 requests per minute
   */
  auth: (identifier: string): RateLimitConfig => ({
    identifier,
    limit: 10,
    window: 60, // 1 minute
    namespace: 'api:auth',
  }),
};

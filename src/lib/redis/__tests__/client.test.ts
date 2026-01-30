/**
 * Unit tests for Upstash Redis rate limiting
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    checkRateLimit,
    getRateLimitStatus,
    resetRateLimit,
    getMirrorChatRateLimitKey,
    getForgotPasswordEmailKey,
    getForgotPasswordIPKey,
    RATE_LIMITS
} from '../client';

// Mock Redis client
vi.mock('@upstash/redis', () => ({
    Redis: vi.fn().mockImplementation(() => ({
        incr: vi.fn(),
        expire: vi.fn(),
        get: vi.fn(),
        ttl: vi.fn(),
        del: vi.fn(),
    })),
}));

describe('Rate Limiting', () => {
    describe('checkRateLimit', () => {
        it('should allow request within limit', async () => {
            const result = await checkRateLimit('test-user', 10, 60);
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBeGreaterThanOrEqual(0);
        });

        it('should return correct rate limit configuration', () => {
            expect(RATE_LIMITS.MIRROR_CHAT_TECHNICAL).toEqual({ limit: 20, window: 60 });
            expect(RATE_LIMITS.MIRROR_CHAT_UX).toEqual({ limit: 1, window: 90 });
            expect(RATE_LIMITS.FORGOT_PASSWORD_EMAIL).toEqual({ limit: 3, window: 3600 });
            expect(RATE_LIMITS.FORGOT_PASSWORD_IP).toEqual({ limit: 20, window: 3600 });
        });
    });

    describe('Helper functions', () => {
        it('should generate correct Mirror Chat rate limit key', () => {
            expect(getMirrorChatRateLimitKey('user123', 'technical')).toBe('mirror:technical:user123');
            expect(getMirrorChatRateLimitKey('user123', 'ux')).toBe('mirror:ux:user123');
        });

        it('should generate correct Forgot Password email key', () => {
            expect(getForgotPasswordEmailKey('Test@Example.com')).toBe('forgot-password:email:test@example.com');
        });

        it('should generate correct Forgot Password IP key', () => {
            expect(getForgotPasswordIPKey('192.168.1.1')).toBe('forgot-password:ip:192.168.1.1');
        });
    });
});

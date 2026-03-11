import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRedis = vi.hoisted(() => ({
  incr: vi.fn(),
  expire: vi.fn(),
  get: vi.fn(),
  ttl: vi.fn(),
  del: vi.fn(),
}));

vi.mock('@upstash/redis', () => ({
  Redis: class MockRedis {
    incr = mockRedis.incr;
    expire = mockRedis.expire;
    get = mockRedis.get;
    ttl = mockRedis.ttl;
    del = mockRedis.del;
  },
}));

import {
  RATE_LIMITS,
  checkRateLimit,
  getForgotPasswordEmailKey,
  getForgotPasswordIPKey,
  getMirrorChatRateLimitKey,
  getRateLimitStatus,
  resetRateLimit,
} from '../client';

describe('Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedis.incr.mockResolvedValue(1);
    mockRedis.expire.mockResolvedValue(1);
    mockRedis.get.mockResolvedValue(0);
    mockRedis.ttl.mockResolvedValue(60);
    mockRedis.del.mockResolvedValue(1);
  });

  describe('checkRateLimit', () => {
    it('allows a request within limit and sets ttl on first hit', async () => {
      const result = await checkRateLimit('test-user', 10, 60);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
      expect(mockRedis.incr).toHaveBeenCalledWith('ratelimit:test-user');
      expect(mockRedis.expire).toHaveBeenCalledWith('ratelimit:test-user', 60);
    });

    it('fails open when redis errors', async () => {
      mockRedis.incr.mockRejectedValueOnce(new Error('redis down'));

      const result = await checkRateLimit('test-user', 10, 60);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(10);
    });

    it('returns correct rate limit configuration', () => {
      expect(RATE_LIMITS.MIRROR_CHAT_TECHNICAL).toEqual({ limit: 20, window: 60 });
      expect(RATE_LIMITS.MIRROR_CHAT_UX).toEqual({ limit: 1, window: 90 });
      expect(RATE_LIMITS.FORGOT_PASSWORD_EMAIL).toEqual({ limit: 3, window: 3600 });
      expect(RATE_LIMITS.FORGOT_PASSWORD_IP).toEqual({ limit: 20, window: 3600 });
    });
  });

  describe('getRateLimitStatus', () => {
    it('returns current count and remaining capacity', async () => {
      mockRedis.get.mockResolvedValueOnce(2);
      mockRedis.ttl.mockResolvedValueOnce(45);

      const result = await getRateLimitStatus('test-user', 5, 60);

      expect(result.count).toBe(2);
      expect(result.remaining).toBe(3);
    });
  });

  describe('resetRateLimit', () => {
    it('deletes the underlying redis key', async () => {
      await resetRateLimit('test-user');
      expect(mockRedis.del).toHaveBeenCalledWith('ratelimit:test-user');
    });
  });

  describe('helper functions', () => {
    it('generates correct Mirror Chat rate limit keys', () => {
      expect(getMirrorChatRateLimitKey('user123', 'technical')).toBe('mirror:technical:user123');
      expect(getMirrorChatRateLimitKey('user123', 'ux')).toBe('mirror:ux:user123');
    });

    it('generates correct Forgot Password email keys', () => {
      expect(getForgotPasswordEmailKey('Test@Example.com')).toBe('forgot-password:email:test@example.com');
    });

    it('generates correct Forgot Password IP keys', () => {
      expect(getForgotPasswordIPKey('192.168.1.1')).toBe('forgot-password:ip:192.168.1.1');
    });
  });
});

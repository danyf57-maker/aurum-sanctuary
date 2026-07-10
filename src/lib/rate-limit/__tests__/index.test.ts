import { afterEach, describe, expect, it } from "vitest";
import { rateLimit, RateLimitPresets } from "../index";

describe("verification email rate limiting", () => {
  const originalUrl = process.env.UPSTASH_REDIS_REST_URL;
  const originalToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  afterEach(() => {
    if (originalUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
    else process.env.UPSTASH_REDIS_REST_URL = originalUrl;
    if (originalToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
    else process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
  });

  it("fails closed when Redis is unavailable for verification emails", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const result = await rateLimit(
      RateLimitPresets.verificationEmail("ip:test")
    );

    expect(result.success).toBe(false);
  });

  it("keeps ordinary rate limits fail-open for availability", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const result = await rateLimit({
      identifier: "test",
      limit: 1,
      window: 60,
      namespace: "test",
    });

    expect(result.success).toBe(true);
  });
});

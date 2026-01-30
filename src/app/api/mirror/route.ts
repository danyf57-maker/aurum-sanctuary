/**
 * Mirror Chat API Route (Vercel Edge Runtime)
 * 
 * Provides streaming AI responses for Mirror Chat using DeepSeek LLM.
 * Enforces authentication, rate limiting, and safe logging.
 */

import { NextRequest } from 'next/server';
import { getUserIdFromAuthHeader } from '@/lib/firebase/edge';
import { checkRateLimit, getMirrorChatRateLimitKey, RATE_LIMITS } from '@/lib/redis/client';
import { callDeepSeekWithRetry, parseDeepSeekStream } from '@/lib/deepseek/adapter';
import { DerivedMemoryLiteSchema } from '@/lib/schemas/derivedMemory';
import { errorSafe } from '@/lib/logger/safe';

// Enable Edge Runtime for low latency
export const runtime = 'edge';

/**
 * POST /api/mirror
 * 
 * Send a message to Mirror Chat and receive streaming response
 * 
 * Request body:
 * - text: string (user's message)
 * - derivedMemoryLite: DerivedMemoryLite (context)
 * 
 * Response: Server-Sent Events (SSE) stream
 */
export async function POST(req: NextRequest) {
    try {
        // 1. Authenticate user
        const authHeader = req.headers.get('Authorization');
        const userId = await getUserIdFromAuthHeader(authHeader);

        if (!userId) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // 2. Check rate limit (technical: 20 req/min)
        const rateLimitKey = getMirrorChatRateLimitKey(userId, 'technical');
        const { limit, window } = RATE_LIMITS.MIRROR_CHAT_TECHNICAL;
        const rateLimit = await checkRateLimit(rateLimitKey, limit, window);

        if (!rateLimit.allowed) {
            return new Response(
                JSON.stringify({
                    error: 'Rate limit exceeded',
                    resetAt: rateLimit.resetAt,
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
                    }
                }
            );
        }

        // 3. Parse and validate request body
        const body = await req.json();
        const { text, derivedMemoryLite } = body;

        if (!text || typeof text !== 'string') {
            return new Response(
                JSON.stringify({ error: 'Invalid request: text is required' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Validate derivedMemoryLite with Zod schema
        let validatedContext;
        try {
            validatedContext = DerivedMemoryLiteSchema.parse(derivedMemoryLite || {});
        } catch (error) {
            errorSafe('DerivedMemoryLite validation failed', { userId, error });
            return new Response(
                JSON.stringify({ error: 'Invalid derivedMemoryLite format' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // 4. Call DeepSeek API with streaming
        const deepSeekStream = await callDeepSeekWithRetry(text, validatedContext);
        const parsedStream = parseDeepSeekStream(deepSeekStream);

        // 5. Return streaming response
        return new Response(parsedStream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error) {
        errorSafe('Mirror Chat API error', { error });

        // User-friendly error message
        const errorMessage = error instanceof Error
            ? (error.message.includes('timeout')
                ? 'The AI is taking too long to respond. Please try again.'
                : 'Something went wrong. Please try again.')
            : 'An unexpected error occurred.';

        return new Response(
            JSON.stringify({ error: errorMessage }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

/**
 * OPTIONS /api/mirror
 * 
 * CORS preflight request handler
 */
export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

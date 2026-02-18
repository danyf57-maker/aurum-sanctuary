/**
 * DeepSeek API Adapter
 * 
 * Provides streaming chat completions using DeepSeek LLM.
 * Optimized for Vercel Edge Runtime compatibility.
 */

import { DerivedMemoryLite } from '@/lib/schemas/derivedMemory';
import { MIRROR_SYSTEM_PROMPT, buildContextPrompt } from './prompts';

/**
 * DeepSeek API configuration
 */
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEFAULT_TIMEOUT = 5000; // 5 seconds
const DEFAULT_MAX_TOKENS = 500; // Cost control

/**
 * DeepSeek API options
 */
export interface DeepSeekOptions {
    timeout?: number;
    maxTokens?: number;
    temperature?: number;
}

/**
 * Call DeepSeek API with streaming support
 * 
 * @param userMessage - User's message
 * @param context - DerivedMemoryLite for context
 * @param options - API options (timeout, maxTokens, temperature)
 * @returns ReadableStream of response tokens
 */
export async function callDeepSeek(
    userMessage: string,
    context: DerivedMemoryLite,
    options: DeepSeekOptions = {}
): Promise<ReadableStream> {
    const {
        timeout = DEFAULT_TIMEOUT,
        maxTokens = DEFAULT_MAX_TOKENS,
        temperature = 1.5,
    } = options;

    // Build full prompt with context
    const contextPrompt = buildContextPrompt(context);
    const fullPrompt = contextPrompt
        ? `${contextPrompt}\n\nUser: ${userMessage}`
        : userMessage;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: MIRROR_SYSTEM_PROMPT },
                    { role: 'user', content: fullPrompt },
                ],
                max_tokens: maxTokens,
                temperature,
                stream: true,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
        }

        if (!response.body) {
            throw new Error('Response body is null');
        }

        return response.body;
    } catch (error) {
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new Error('DeepSeek API timeout');
            }
            throw error;
        }
        throw new Error('Unknown error calling DeepSeek API');
    }
}

/**
 * Parse Server-Sent Events (SSE) stream from DeepSeek
 * 
 * @param stream - Raw ReadableStream from DeepSeek API
 * @returns ReadableStream of parsed text chunks
 */
export function parseDeepSeekStream(stream: ReadableStream): ReadableStream<string> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    return new ReadableStream({
        async start(controller) {
            try {
                while (true) {
                    const { done, value } = await reader.read();

                    if (done) {
                        controller.close();
                        break;
                    }

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6).trim();

                            if (data === '[DONE]') {
                                controller.close();
                                return;
                            }

                            try {
                                const parsed = JSON.parse(data);
                                const content = parsed.choices?.[0]?.delta?.content;

                                if (content) {
                                    controller.enqueue(content);
                                }
                            } catch (e) {
                                // Skip malformed JSON
                                console.warn('Failed to parse SSE data:', data);
                            }
                        }
                    }
                }
            } catch (error) {
                controller.error(error);
            }
        },
    });
}

/**
 * Call DeepSeek with retry logic
 * 
 * @param userMessage - User's message
 * @param context - DerivedMemoryLite for context
 * @param options - API options
 * @param maxRetries - Maximum number of retries (default: 2)
 * @returns ReadableStream of response tokens
 */
export async function callDeepSeekWithRetry(
    userMessage: string,
    context: DerivedMemoryLite,
    options: DeepSeekOptions = {},
    maxRetries: number = 2
): Promise<ReadableStream> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await callDeepSeek(userMessage, context, options);
        } catch (error) {
            lastError = error as Error;

            // Don't retry on timeout or auth errors
            if (lastError.message.includes('timeout') || lastError.message.includes('401')) {
                throw lastError;
            }

            // Exponential backoff
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError || new Error('DeepSeek API call failed after retries');
}

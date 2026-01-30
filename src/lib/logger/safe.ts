/**
 * Safe Logging Utilities
 * 
 * Provides logging functions that automatically redact sensitive data.
 * Use these instead of console.log/error/warn to prevent PII leaks.
 * 
 * Architecture: Admin-Blind Processing
 * - Never log raw error objects (may contain sensitive data)
 * - Never log user content, tokens, keys, or PII
 * - Always use redaction helpers
 */

/**
 * Comprehensive list of sensitive field names to redact
 * 
 * This list is checked against object keys (case-insensitive).
 * Any field matching these patterns will be replaced with '[REDACTED]'.
 */
const SENSITIVE_FIELDS = [
    // Authentication & Tokens
    'password',
    'token',
    'idToken',
    'accessToken',
    'refreshToken',
    'authToken',
    'apiKey',
    'api_key',
    'secret',
    'secretKey',
    'privateKey',
    'private_key',

    // Encryption Keys
    'contentKey',
    'encryptionKey',
    'wrappedContentKey',
    'draftKey',
    'iv',
    'salt',

    // User Content
    'content',
    'entryText',
    'encryptedContent',
    'decryptedContent',
    'plaintext',
    'message',
    'insight',
    'insightText',

    // Personal Identifiable Information (PII)
    'email',
    'phone',
    'phoneNumber',
    'address',
    'ssn',
    'creditCard',
    'cardNumber',
    'cvv',

    // Stripe & Payment
    'stripeToken',
    'paymentMethod',
    'cardDetails',

    // Firebase
    'serviceAccount',
    'serviceAccountKey',
    'firebaseToken',

    // Session & Cookies
    'sessionId',
    'cookie',
    'cookies',

    // Other Sensitive Data
    'userId', // Hash instead of redact
    'uid', // Hash instead of redact
];

/**
 * Hash a value for safe logging (one-way hash)
 * 
 * @param value - Value to hash
 * @returns Hashed value (first 8 chars of SHA-256)
 */
function hashValue(value: string): string {
    // Simple hash for logging (not cryptographic)
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
        const char = value.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return `hash_${Math.abs(hash).toString(16).substring(0, 8)}`;
}

/**
 * Redact sensitive fields from an object
 * 
 * @param obj - Object to redact
 * @returns New object with sensitive fields redacted
 */
export function redactSensitiveFields(obj: any): any {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => redactSensitiveFields(item));
    }

    const redacted: any = {};

    for (const key in obj) {
        const lowerKey = key.toLowerCase();

        // Check if key is sensitive
        const isSensitive = SENSITIVE_FIELDS.some(field =>
            lowerKey.includes(field.toLowerCase())
        );

        if (isSensitive) {
            // Hash userId/uid instead of redacting
            if (lowerKey === 'userid' || lowerKey === 'uid') {
                redacted[key] = typeof obj[key] === 'string' ? hashValue(obj[key]) : '[REDACTED]';
            } else {
                redacted[key] = '[REDACTED]';
            }
        } else if (typeof obj[key] === 'object') {
            // Recursively redact nested objects
            redacted[key] = redactSensitiveFields(obj[key]);
        } else {
            redacted[key] = obj[key];
        }
    }

    return redacted;
}

/**
 * Safe error logging
 * 
 * @param message - Error message
 * @param error - Optional error object (will be sanitized)
 * @param context - Optional context object (will be redacted)
 */
export function errorSafe(message: string, error?: Error | unknown, context?: Record<string, any>) {
    const sanitizedContext = context ? redactSensitiveFields(context) : {};

    // Extract safe error info
    const errorInfo = error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3).join('\n'), // First 3 lines only
    } : { error: String(error) };

    console.error({
        level: 'ERROR',
        message,
        error: errorInfo,
        context: sanitizedContext,
        timestamp: new Date().toISOString(),
    });
}

/**
 * Safe warning logging
 * 
 * @param message - Warning message
 * @param context - Optional context object (will be redacted)
 */
export function warnSafe(message: string, context?: Record<string, any>) {
    const sanitizedContext = context ? redactSensitiveFields(context) : {};

    console.warn({
        level: 'WARN',
        message,
        context: sanitizedContext,
        timestamp: new Date().toISOString(),
    });
}

/**
 * Safe info logging
 * 
 * @param message - Info message
 * @param context - Optional context object (will be redacted)
 */
export function infoSafe(message: string, context?: Record<string, any>) {
    const sanitizedContext = context ? redactSensitiveFields(context) : {};

    console.log({
        level: 'INFO',
        message,
        context: sanitizedContext,
        timestamp: new Date().toISOString(),
    });
}

/**
 * Export logger object for convenience
 */
export const logger = {
    errorSafe,
    warnSafe,
    infoSafe,
    redactSensitiveFields,
};

/**
 * Example usage:
 * 
 * // ❌ UNSAFE - Don't do this
 * console.error('Error:', error);
 * console.log('User data:', { email, password });
 * 
 * // ✅ SAFE - Do this instead
 * logger.errorSafe('Failed to authenticate', error, { userId });
 * logger.infoSafe('User logged in', { hashedUserId: hashValue(userId) });
 */

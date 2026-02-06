/**
 * Firebase Edge Runtime Utilities
 *
 * Edge-compatible Firebase utilities for Vercel Edge Runtime.
 * Used for: Token verification in Edge API routes (e.g., Mirror Chat)
 *
 * IMPORTANT: Firebase Admin SDK does not work in Edge runtime.
 * This module uses Firebase REST API for token verification.
 */

import { logger } from '@/lib/logger/safe';

/**
 * Verify Firebase ID token using REST API (Edge-compatible)
 * 
 * @param idToken - Firebase ID token from client
 * @returns User ID (uid) if valid, null if invalid
 * 
 * Note: This uses the public Firebase API key, which is safe because
 * the security comes from the ID token itself, not the API key.
 */
export async function verifyIdTokenEdge(idToken: string): Promise<string | null> {
    if (!idToken) {
        return null;
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
        throw new Error('Missing NEXT_PUBLIC_FIREBASE_API_KEY');
    }

    try {
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idToken }),
            }
        );

        if (!response.ok) {
            // Invalid token or expired
            return null;
        }

        const data = await response.json();
        const userId = data.users?.[0]?.localId;

        return userId || null;
    } catch (error) {
        // Network error or invalid response
        logger.errorSafe('Error verifying ID token', error);
        return null;
    }
}

/**
 * Extract user ID from Authorization header
 * 
 * @param authHeader - Authorization header value (e.g., "Bearer <token>")
 * @returns User ID if valid, null if invalid
 */
export async function getUserIdFromAuthHeader(authHeader: string | null): Promise<string | null> {
    if (!authHeader) {
        return null;
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
        return null;
    }

    return verifyIdTokenEdge(token);
}

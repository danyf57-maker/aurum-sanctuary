import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { logger } from '@/lib/logger/safe';

/**
 * POST /api/auth/session
 * 
 * Exchanges an ID token for a Firebase Session Cookie.
 * Sets the cookie with HttpOnly, Secure, SameSite, and 5-day expiration (customizable).
 */
export async function POST(request: Request) {
    try {
        // Basic CSRF hardening: reject cross-site origins.
        const requestOrigin = request.headers.get('origin');
        const runtimeOrigin = new URL(request.url).origin;
        const configuredAppOrigin = process.env.NEXT_PUBLIC_APP_URL
            ? new URL(process.env.NEXT_PUBLIC_APP_URL).origin
            : runtimeOrigin;
        const allowedOrigins = new Set([runtimeOrigin, configuredAppOrigin]);

        if (requestOrigin && !allowedOrigins.has(requestOrigin)) {
            return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
        }

        const { idToken } = await request.json();

        if (!idToken) {
            return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });
        }

        // Set session expiration to 14 days
        const expiresIn = 60 * 60 * 24 * 14 * 1000;
        const authName = (auth as any)?.name;
        const isMockAuth = typeof authName === 'string' && authName.includes('mock');

        if (!auth || isMockAuth || typeof (auth as any).createSessionCookie !== 'function') {
            console.warn("Firebase Admin Auth not initialized or mocked. Skipping session cookie creation.");
            return NextResponse.json({ status: 'skipped', message: 'Admin Auth missing' }, { status: 200 });
        }

        // Verify ID token before exchanging to session cookie.
        // Do not require "recent sign-in" here: this endpoint is also used to silently
        // refresh the cookie on normal navigation/page reload.
        await auth.verifyIdToken(idToken, true);

        // Create the session cookie using Firebase Admin
        const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

        if (!sessionCookie || typeof sessionCookie !== 'string') {
            throw new Error("Failed to create session cookie: result is empty.");
        }

        const isProduction = process.env.NODE_ENV === 'production';

        // Set cookie options
        const options = {
            name: '__session', // Standard Firebase cookie name
            value: sessionCookie,
            maxAge: expiresIn / 1000,
            httpOnly: true,
            secure: isProduction,
            path: '/',
            sameSite: 'strict' as const
        };

        // Set the cookie
        (await cookies()).set(options);

        return NextResponse.json({ status: 'success' }, { status: 200 });
    } catch (error) {
        logger.errorSafe('Failed to create session cookie', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

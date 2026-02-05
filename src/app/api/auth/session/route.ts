import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

/**
 * POST /api/auth/session
 * 
 * Exchanges an ID token for a Firebase Session Cookie.
 * Sets the cookie with HttpOnly, Secure, SameSite, and 5-day expiration (customizable).
 */
export async function POST(request: Request) {
    try {
        const { idToken } = await request.json();

        if (!idToken) {
            return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });
        }

        // Set session expiration to 5 days
        const expiresIn = 60 * 60 * 24 * 5 * 1000;

        if (!auth || auth.name === '[DEFAULT]-mock') {
            console.warn("Firebase Admin Auth not initialized or mocked. Skipping session cookie creation.");
            return NextResponse.json({ status: 'skipped', message: 'Admin Auth missing' }, { status: 200 });
        }

        // Create the session cookie using Firebase Admin
        const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

        if (!sessionCookie) {
            throw new Error("Failed to create session cookie: result is empty.");
        }

        // Set cookie options
        const options = {
            name: '__session', // Standard Firebase cookie name
            value: sessionCookie,
            maxAge: expiresIn / 1000,
            httpOnly: true,
            secure: true, // Always secure in production (and mostly dev via localhost HTTPS or similar)
            path: '/',
            sameSite: 'lax' as const
        };

        // Set the cookie
        (await cookies()).set(options);

        return NextResponse.json({ status: 'success' }, { status: 200 });
    } catch (error) {
        console.error('Failed to create session cookie', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logger } from '@/lib/logger/safe';

/**
 * POST /api/auth/logout
 * 
 * Clears the session cookie.
 */
export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();

        // Clear the session cookie
        cookieStore.set({
            name: '__session',
            value: '',
            maxAge: -1,
            path: '/',
        });

        return NextResponse.json({ status: 'success' }, { status: 200 });
    } catch (error) {
        logger.errorSafe('Failed to logout', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

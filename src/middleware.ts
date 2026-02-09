import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for Route Protection
 * 
 * Handles redirects based on authentication state stored in 'session-token' cookie.
 */

// Define routes that require authentication
// Note: /dashboard uses client-side auth (useAuth hook), so it's not in this list
const protectedRoutes = ['/settings', '/profile', '/journal'];

// Define routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/signup', '/forgot-password'];

export function middleware(request: NextRequest) {
    const { nextUrl, cookies } = request;
    const sessionToken = cookies.get('__session')?.value;

    const isProtectedRoute = protectedRoutes.some(route => nextUrl.pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => nextUrl.pathname.startsWith(route));

    // 1. Redirect unauthenticated users from protected routes to login
    if (isProtectedRoute && !sessionToken) {
        const loginUrl = new URL('/login', request.url);
        // Remember the intended destination for after login
        loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 2. Redirect authenticated users from auth routes (login/signup) to dashboard
    if (isAuthRoute && sessionToken) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images (public images)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|images|terms|privacy).*)',
    ],
};

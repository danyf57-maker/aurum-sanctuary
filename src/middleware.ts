import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for Route Protection
 * 
 * Handles redirects based on authentication state stored in 'session-token' cookie.
 */

// Define routes that require authentication
const protectedRoutes = ['/settings', '/profile', '/journal', '/dashboard', '/sanctuary', '/insights', '/account', '/admin'];

// Define routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/signup', '/forgot-password'];
const LOCALE_COOKIE_NAME = 'aurum-locale';
const SUPPORTED_LOCALES = new Set(['en', 'fr', 'es']);

type SupportedLocale = 'en' | 'fr' | 'es';

export function middleware(request: NextRequest) {
    const { nextUrl, cookies } = request;
    const sessionToken = cookies.get('__session')?.value;
    const hasLikelySession = isLikelyFirebaseSessionCookie(sessionToken);
    const forcedLocale = normalizeLocale(nextUrl.searchParams.get('lang') || undefined);
    const resolvedLocale = forcedLocale || resolveLocale(request);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-aurum-locale', resolvedLocale);

    const isProtectedRoute = protectedRoutes.some(route => nextUrl.pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => nextUrl.pathname.startsWith(route));
    let response: NextResponse;

    // 0. Explicit locale override for testing: ?lang=en|fr|es
    if (forcedLocale) {
        const cleanUrl = new URL(request.url);
        cleanUrl.searchParams.delete('lang');
        response = NextResponse.redirect(cleanUrl);
    } else if (isProtectedRoute && !hasLikelySession) {
        // 1. Redirect unauthenticated users from protected routes to login
        const loginUrl = new URL('/login', request.url);
        // Remember the intended destination for after login
        loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
        response = NextResponse.redirect(loginUrl);
    } else if (isAuthRoute && hasLikelySession) {
        // 2. Redirect authenticated users from auth routes (login/signup) to dashboard
        response = NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
        response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    const currentLocaleCookie = normalizeLocale(cookies.get(LOCALE_COOKIE_NAME)?.value);
    if (forcedLocale || !currentLocaleCookie) {
        response.cookies.set({
            name: LOCALE_COOKIE_NAME,
            value: resolvedLocale,
            maxAge: 60 * 60 * 24 * 365,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
        });
    }
    response.headers.set('x-aurum-locale', resolvedLocale);
    return response;
}

function isLikelyFirebaseSessionCookie(cookieValue?: string): boolean {
    if (!cookieValue) return false;
    const segments = cookieValue.split('.');
    if (segments.length !== 3) return false;
    return segments.every((segment) => segment.length > 0);
}

function resolveLocale(request: NextRequest): SupportedLocale {
    const cookieLocale = normalizeLocale(request.cookies.get(LOCALE_COOKIE_NAME)?.value);
    if (cookieLocale) return cookieLocale;

    const acceptLanguage = request.headers.get('accept-language');
    const headerLocale = getLocaleFromAcceptLanguage(acceptLanguage);
    if (headerLocale) return headerLocale;

    const country = (request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry') || '').toUpperCase();
    const countryLocale = getLocaleFromCountry(country);
    if (countryLocale) return countryLocale;

    return 'en';
}

function normalizeLocale(value?: string): SupportedLocale | null {
    if (!value) return null;
    const normalized = value.toLowerCase();
    if (!SUPPORTED_LOCALES.has(normalized)) return null;
    return normalized as SupportedLocale;
}

function getLocaleFromAcceptLanguage(header: string | null): SupportedLocale | null {
    if (!header) return null;
    const tokens = header
        .split(',')
        .map((part) => part.trim().split(';')[0]?.toLowerCase())
        .filter(Boolean) as string[];

    for (const token of tokens) {
        if (token.startsWith('fr')) return 'fr';
        if (token.startsWith('es')) return 'es';
        if (token.startsWith('en')) return 'en';
    }
    return null;
}

function getLocaleFromCountry(country: string): SupportedLocale | null {
    if (!country) return null;

    const frenchCountries = new Set(['FR', 'BE', 'CH', 'LU', 'MC']);
    const spanishCountries = new Set([
        'ES', 'MX', 'AR', 'CO', 'CL', 'PE', 'UY', 'PY', 'BO', 'EC', 'VE',
        'CR', 'GT', 'HN', 'NI', 'SV', 'PA', 'DO', 'PR', 'CU',
    ]);

    if (frenchCountries.has(country)) return 'fr';
    if (spanishCountries.has(country)) return 'es';
    return 'en';
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

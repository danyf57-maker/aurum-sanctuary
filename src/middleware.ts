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
const SUPPORTED_LOCALES = new Set(['en', 'fr']);

type SupportedLocale = 'en' | 'fr';

export function middleware(request: NextRequest) {
    const { nextUrl, cookies } = request;
    const pathname = nextUrl.pathname;
    const pathLocale = detectPathLocale(pathname);
    const normalizedPath = stripLocalePrefix(pathname);
    const sessionToken = cookies.get('__session')?.value;
    const hasLikelySession = isLikelyFirebaseSessionCookie(sessionToken);
    const forcedLocale = normalizeLocale(nextUrl.searchParams.get('lang') || undefined);
    const resolvedLocale = forcedLocale || pathLocale || resolveLocale(request);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-aurum-locale', resolvedLocale);

    const isProtectedRoute = protectedRoutes.some(route => normalizedPath.startsWith(route));
    const isAuthRoute = authRoutes.some(route => normalizedPath.startsWith(route));
    let response: NextResponse;

    // 0. Explicit locale override for testing: ?lang=en|fr
    if (forcedLocale) {
        const cleanUrl = new URL(request.url);
        cleanUrl.searchParams.delete('lang');
        response = NextResponse.redirect(cleanUrl);
    } else if (!pathLocale && resolvedLocale === 'fr' && (request.method === 'GET' || request.method === 'HEAD')) {
        // Canonicalize French visitors to /fr/* URLs to avoid mixed-language navigation.
        const localizedUrl = nextUrl.clone();
        localizedUrl.pathname = localizedPath(pathname, 'fr');
        response = NextResponse.redirect(localizedUrl);
    } else if (isProtectedRoute && !hasLikelySession) {
        // 1. Redirect unauthenticated users from protected routes to login
        const loginUrl = new URL(localizedPath('/login', resolvedLocale), request.url);
        // Remember the intended destination for after login
        loginUrl.searchParams.set('callbackUrl', pathname);
        response = NextResponse.redirect(loginUrl);
    } else if (isAuthRoute && hasLikelySession) {
        // 2. Redirect authenticated users from auth routes (login/signup) to dashboard
        response = NextResponse.redirect(new URL(localizedPath('/dashboard', resolvedLocale), request.url));
    } else if (pathLocale === 'fr') {
        const rewriteUrl = nextUrl.clone();
        rewriteUrl.pathname = normalizedPath;
        response = NextResponse.rewrite(rewriteUrl, {
            request: {
                headers: requestHeaders,
            },
        });
    } else {
        response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    const currentLocaleCookie = normalizeLocale(cookies.get(LOCALE_COOKIE_NAME)?.value);
    if (forcedLocale || currentLocaleCookie !== resolvedLocale) {
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

function detectPathLocale(pathname: string): SupportedLocale | null {
    if (pathname === '/fr' || pathname.startsWith('/fr/')) return 'fr';
    if (pathname === '/en' || pathname.startsWith('/en/')) return 'en';
    return null;
}

function stripLocalePrefix(pathname: string): string {
    if (pathname === '/fr' || pathname === '/en') return '/';
    if (pathname.startsWith('/fr/')) return pathname.slice(3);
    if (pathname.startsWith('/en/')) return pathname.slice(3);
    return pathname;
}

function localizedPath(path: string, locale: SupportedLocale): string {
    if (locale === 'fr') {
        return path === '/' ? '/fr' : `/fr${path}`;
    }
    return path;
}

function isLikelyFirebaseSessionCookie(cookieValue?: string): boolean {
    if (!cookieValue) return false;
    const segments = cookieValue.split('.');
    if (segments.length !== 3) return false;
    return segments.every((segment) => segment.length > 0);
}

function resolveLocale(request: NextRequest): SupportedLocale {
    // Product rule: French countries => FR. Others => EN.
    const country = (request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry') || '').toUpperCase();
    if (country) return getLocaleFromCountry(country);

    // Fallback when country header is unavailable (some devices/proxies).
    const acceptLanguage = request.headers.get('accept-language');
    const headerLocale = getLocaleFromAcceptLanguage(acceptLanguage);
    if (headerLocale) return headerLocale;

    // Last fallback: previous cookie value.
    const cookieLocale = normalizeLocale(request.cookies.get(LOCALE_COOKIE_NAME)?.value);
    if (cookieLocale) return cookieLocale;
    return 'fr';
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
        if (token.startsWith('en')) return 'en';
    }
    return null;
}

function getLocaleFromCountry(country: string): SupportedLocale {
    if (!country) return 'fr';

    const frenchCountries = new Set(['FR', 'BE', 'CH', 'LU', 'MC']);

    if (frenchCountries.has(country)) return 'fr';
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

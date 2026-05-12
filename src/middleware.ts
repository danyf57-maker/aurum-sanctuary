import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  LOCALE_COOKIE_NAME,
  type Locale,
  normalizeLocale,
} from '@/lib/locale';
import {
  detectPathLocale,
  stripLocalePrefix,
  toLocalePath,
} from '@/i18n/routing';

const protectedRoutes = ['/admin'];
const authRoutes = ['/login', '/signup', '/forgot-password'];
const PUBLIC_FILE = /\.[^/]+$/;

export function middleware(request: NextRequest) {
  const { nextUrl, cookies } = request;
  const pathname = nextUrl.pathname;

  if (PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  const pathLocale = detectPathLocale(pathname);
  const normalizedPath = stripLocalePrefix(pathname);

  const forcedLang = normalizeLocale(nextUrl.searchParams.get('lang'));
  const resolvedLocale: Locale = 'fr';

  if (normalizedPath === '/sanctuary/chat') {
    const url = nextUrl.clone();
    url.pathname = '/fr/sanctuary/write';
    const response = NextResponse.redirect(url, 308);
    setLocaleCookie(response, resolvedLocale);
    return response;
  }

  // French-only product routing: /en/* and unprefixed pages now resolve to /fr/*.
  if (pathLocale === 'en' || !pathLocale) {
    const url = nextUrl.clone();
    url.pathname = toLocalePath(normalizedPath, 'fr');
    const response = NextResponse.redirect(url);
    setLocaleCookie(response, 'fr');
    return response;
  }

  // Remove obsolete English override parameters from French URLs.
  if (forcedLang === 'en') {
    const url = nextUrl.clone();
    url.searchParams.delete('lang');
    const response = NextResponse.redirect(url);
    setLocaleCookie(response, 'fr');
    return response;
  }

  const sessionToken = cookies.get('__session')?.value;
  const hasLikelySession = isLikelyFirebaseSessionCookie(sessionToken);
  const localeForPath: Locale = 'fr';
  const localePrefix = '/fr';

  const isProtectedRoute = protectedRoutes.some((route) => normalizedPath.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => normalizedPath.startsWith(route));

  if (isProtectedRoute && !hasLikelySession) {
    const loginUrl = new URL(`${localePrefix}/login`, request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    const response = NextResponse.redirect(loginUrl);
    setLocaleCookie(response, localeForPath);
    return response;
  }

  if (isAuthRoute && hasLikelySession) {
    const writeUrl = new URL(`${localePrefix}/sanctuary/write`, request.url);
    const response = NextResponse.redirect(writeUrl);
    setLocaleCookie(response, localeForPath);
    return response;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-aurum-locale', localeForPath);
  requestHeaders.set('x-aurum-path', normalizedPath);

  const rewriteUrl = nextUrl.clone();
  rewriteUrl.pathname = normalizedPath;
  const response = NextResponse.rewrite(rewriteUrl, {
    request: {
      headers: requestHeaders,
    },
  });
  setLocaleCookie(response, localeForPath);
  return response;
}

function setLocaleCookie(response: NextResponse, locale: Locale) {
  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false,
  });
}

function isLikelyFirebaseSessionCookie(cookieValue?: string): boolean {
  if (!cookieValue) return false;
  const segments = cookieValue.split('.');
  if (segments.length !== 3) return false;
  return segments.every((segment) => segment.length > 0);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};

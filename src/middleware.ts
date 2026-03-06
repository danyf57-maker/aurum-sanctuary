import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  LOCALE_COOKIE_NAME,
  type Locale,
  normalizeLocale,
  resolveLocaleFromAcceptLanguage,
  resolveLocaleFromCountry,
} from '@/lib/locale';
import {
  detectPathLocale,
  stripLocalePrefix,
  toLocalePath,
} from '@/i18n/routing';

const protectedRoutes = ['/admin'];
const authRoutes = ['/login', '/signup', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { nextUrl, cookies } = request;
  const pathname = nextUrl.pathname;
  const pathLocale = detectPathLocale(pathname);
  const normalizedPath = stripLocalePrefix(pathname);

  const forcedLang = normalizeLocale(nextUrl.searchParams.get('lang'));
  const localeFromCookie = normalizeLocale(cookies.get(LOCALE_COOKIE_NAME)?.value);
  const country =
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    request.headers.get('x-country-code');
  const localeFromCountry = resolveLocaleFromCountry(country);
  const localeFromAccept = resolveLocaleFromAcceptLanguage(
    request.headers.get('accept-language')
  );

  const resolvedLocale: Locale =
    forcedLang || pathLocale || localeFromCookie || localeFromCountry || localeFromAccept;

  // Canonical EN routing: /en/* -> /*
  if (pathLocale === 'en') {
    const url = nextUrl.clone();
    url.pathname = normalizedPath;
    const response = NextResponse.redirect(url);
    setLocaleCookie(response, 'en');
    return response;
  }

  // Explicit language overrides via ?lang=
  if (forcedLang === 'fr' && pathLocale !== 'fr') {
    const url = nextUrl.clone();
    url.pathname = toLocalePath(normalizedPath, 'fr');
    const response = NextResponse.redirect(url);
    setLocaleCookie(response, 'fr');
    return response;
  }

  if (forcedLang === 'en' && pathLocale === 'fr') {
    const url = nextUrl.clone();
    url.pathname = normalizedPath;
    const response = NextResponse.redirect(url);
    setLocaleCookie(response, 'en');
    return response;
  }

  // Final routing rule:
  // - EN => /
  // - FR => /fr/*
  if (!pathLocale && resolvedLocale === 'fr') {
    const url = nextUrl.clone();
    url.pathname = toLocalePath(normalizedPath, 'fr');
    const response = NextResponse.redirect(url);
    setLocaleCookie(response, 'fr');
    return response;
  }

  const sessionToken = cookies.get('__session')?.value;
  const hasLikelySession = isLikelyFirebaseSessionCookie(sessionToken);
  const localeForPath: Locale = pathLocale || resolvedLocale;
  const localePrefix = localeForPath === 'fr' ? '/fr' : '';

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
    const dashboardUrl = new URL(`${localePrefix}/dashboard`, request.url);
    const response = NextResponse.redirect(dashboardUrl);
    setLocaleCookie(response, localeForPath);
    return response;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-aurum-locale', localeForPath);

  const response =
    pathLocale === 'fr'
      ? (() => {
          const rewriteUrl = nextUrl.clone();
          rewriteUrl.pathname = normalizedPath;
          return NextResponse.rewrite(rewriteUrl, {
            request: {
              headers: requestHeaders,
            },
          });
        })()
      : NextResponse.next({
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

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { nextUrl } = request;
    const removedAuthRoutes = ['/login', '/signup', '/forgot-password'];
    const isRemovedAuthRoute = removedAuthRoutes.some(route => nextUrl.pathname.startsWith(route));

    // Auth pages were removed in TABULA RASA mode: always send to homepage.
    if (isRemovedAuthRoute) {
        return NextResponse.redirect(new URL('/', request.url));
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

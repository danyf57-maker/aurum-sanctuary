
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth, db } from '@/lib/firebase/admin';
import { TRACKED_EVENTS, type TrackedEventName } from '@/lib/analytics/types';
import { logger } from '@/lib/logger/safe';
import { getActiveEmailAttribution, EMAIL_ATTRIBUTION_WINDOW_HOURS } from '@/lib/onboarding/email-attribution';

export async function POST(request: NextRequest) {
  try {
    const { clientId, name, params, path } = await request.json();

    if (!clientId || !name) {
      return NextResponse.json({ message: "Missing required tracking parameters (clientId, name)." }, { status: 400 });
    }

    const eventName = String(name) as TrackedEventName;
    if (!TRACKED_EVENTS.includes(eventName)) {
      return NextResponse.json({ message: `Unsupported event name: ${eventName}` }, { status: 400 });
    }

    const sessionCookie = (await cookies()).get('__session')?.value;
    let userId: string | null = null;
    let userEmail: string | null = null;
    if (sessionCookie && auth && typeof auth.verifySessionCookie === 'function') {
      try {
        const decoded = await auth.verifySessionCookie(sessionCookie, true);
        userId = decoded.uid ?? null;
        userEmail = decoded.email ?? null;
      } catch {
        userId = null;
        userEmail = null;
      }
    }

    const attributedParams = userId
      ? await getActiveEmailAttribution(userId).then((attribution) =>
          attribution
            ? {
                attributed_email_id: attribution.emailId,
                attributed_email_clicked_at: attribution.clickedAt.toISOString(),
                attribution_window_hours: EMAIL_ATTRIBUTION_WINDOW_HOURS,
              }
            : {}
        )
      : {};

    await db.collection('analyticsEvents').add({
      name: eventName,
      clientId: String(clientId),
      userId,
      userEmail,
      path: typeof path === 'string' ? path : request.nextUrl.pathname,
      params: {
        ...(params && typeof params === 'object' ? params : {}),
        ...attributedParams,
      },
      userAgent: request.headers.get('user-agent') ?? null,
      referer: request.headers.get('referer') ?? null,
      source: 'client',
      occurredAt: new Date(),
    });

    // GTM is now the only Google-managed tracking entrypoint on the site.
    // We keep the internal event log for product analytics and attribution.
    return NextResponse.json({ success: true, message: "Tracked locally." });

  } catch (error) {
    logger.errorSafe('Error in /api/track', error);
    return NextResponse.json({ message: 'Error tracking event' }, { status: 500 });
  }
}

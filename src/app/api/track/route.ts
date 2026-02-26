
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Timestamp } from 'firebase-admin/firestore';
import { auth, db } from '@/lib/firebase/admin';
import { TRACKED_EVENTS, type TrackedEventName } from '@/lib/analytics/types';

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;
const GA_API_SECRET = process.env.GA_MEASUREMENT_PROTOCOL_API_SECRET;

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

    await db.collection('analyticsEvents').add({
      name: eventName,
      clientId: String(clientId),
      userId,
      userEmail,
      path: typeof path === 'string' ? path : request.nextUrl.pathname,
      params: params && typeof params === 'object' ? params : {},
      userAgent: request.headers.get('user-agent') ?? null,
      referer: request.headers.get('referer') ?? null,
      source: 'client',
      occurredAt: Timestamp.now(),
    });

    if (!GA_TRACKING_ID || !GA_API_SECRET || GA_API_SECRET === 'your_secret_here') {
      return NextResponse.json({ success: true, message: "Tracked locally. GA not configured." });
    }

    const body = {
      client_id: clientId,
      events: [{
        name: eventName,
        params: {
            ...params,
            // The Measurement Protocol requires a session_id and engagement_time_msec
            // For simplicity, we are using static values here. This can be enhanced later.
            session_id: '12345', 
            engagement_time_msec: '100',
        },
      }],
    };

    // Forward event to Google Analytics Measurement Protocol
    await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${GA_TRACKING_ID}&api_secret=${GA_API_SECRET}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in /api/track:', error);
    return NextResponse.json({ message: 'Error tracking event' }, { status: 500 });
  }
}

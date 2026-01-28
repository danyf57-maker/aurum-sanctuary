
import { NextRequest, NextResponse } from 'next/server';

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;
const GA_API_SECRET = process.env.GA_MEASUREMENT_PROTOCOL_API_SECRET;

export async function POST(request: NextRequest) {
  if (!GA_TRACKING_ID || !GA_API_SECRET || GA_API_SECRET === 'your_secret_here') {
    // Fail silently if not configured, to not break production app.
    // You can uncomment the log for debugging purposes.
    // console.warn("Analytics is not configured for server-side tracking.");
    return NextResponse.json({ message: "Analytics not configured." });
  }

  try {
    const { clientId, name, params } = await request.json();

    if (!clientId || !name) {
      return NextResponse.json({ message: "Missing required tracking parameters (clientId, name)." }, { status: 400 });
    }

    const body = {
      client_id: clientId,
      events: [{
        name: name,
        params: {
            ...params,
            // The Measurement Protocol requires a session_id and engagement_time_msec
            // For simplicity, we are using static values here. This can be enhanced later.
            session_id: '12345', 
            engagement_time_msec: '100',
        },
      }],
    };

    // Using Google Analytics Measurement Protocol
    await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${GA_TRACKING_ID}&api_secret=${GA_API_SECRET}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in /api/track:', message);
    return NextResponse.json({ message: 'Error tracking event', error: message }, { status: 500 });
  }
}

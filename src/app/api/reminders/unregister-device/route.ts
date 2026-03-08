import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase/admin';
import { trackServerEvent } from '@/lib/analytics/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await auth.verifyIdToken(authHeader.slice(7));
    const body = (await req.json()) as { deviceId?: string };

    if (!body.deviceId) {
      return NextResponse.json({ error: 'Missing deviceId' }, { status: 400 });
    }

    await db.collection('users').doc(decoded.uid).collection('devices').doc(body.deviceId).set(
      {
        token: null,
        pushEnabled: false,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    await trackServerEvent('writing_reminder_device_unregistered', {
      userId: decoded.uid,
      userEmail: decoded.email ?? null,
      path: '/api/reminders/unregister-device',
      params: {
        deviceId: body.deviceId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to unregister device' }, { status: 500 });
  }
}

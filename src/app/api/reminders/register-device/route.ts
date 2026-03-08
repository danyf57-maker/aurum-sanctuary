import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await auth.verifyIdToken(authHeader.slice(7));
    const body = (await req.json()) as {
      deviceId?: string;
      token?: string;
      language?: 'fr' | 'en';
      timezone?: string;
      permission?: string;
      userAgent?: string;
    };

    if (!body.deviceId || !body.token) {
      return NextResponse.json({ error: 'Missing deviceId or token' }, { status: 400 });
    }

    await db.collection('users').doc(decoded.uid).collection('devices').doc(body.deviceId).set(
      {
        token: body.token,
        platform: 'web',
        language: body.language || 'en',
        timezone: body.timezone || 'UTC',
        permission: body.permission || 'default',
        userAgent: body.userAgent || '',
        pushEnabled: true,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to register device' }, { status: 500 });
  }
}

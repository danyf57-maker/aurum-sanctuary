import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase/admin';
import { trackServerEvent } from '@/lib/analytics/server';
import { buildWritingReminderCopy } from '@/lib/reminders/writing-reminders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await auth.verifyIdToken(authHeader.slice(7));
    const userRef = db.collection('users').doc(decoded.uid);
    const [userSnap, devicesSnap] = await Promise.all([
      userRef.get(),
      userRef.collection('devices').where('pushEnabled', '==', true).get(),
    ]);

    if (devicesSnap.empty) {
      return NextResponse.json({ error: 'No active push device' }, { status: 400 });
    }

    const userData = userSnap.data() || {};
    const firstName = String(userData.firstName || userData.displayName || decoded.name || '').split(' ')[0] || null;
    const prefsSnap = await userRef.collection('settings').doc('preferences').get();
    const prefs = prefsSnap.data() || {};
    const locale = prefs.language === 'fr' ? 'fr' : 'en';
    const tone = ['gentle', 'clarity', 'pressure_release', 'routine'].includes(String(prefs.writingReminderTone))
      ? (prefs.writingReminderTone as 'gentle' | 'clarity' | 'pressure_release' | 'routine')
      : 'gentle';
    const copy = buildWritingReminderCopy({ locale, tone, firstName, seed: Date.now() });

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getMessaging } = require('firebase-admin/messaging') as { getMessaging: () => any };
    const messaging = getMessaging();
    const tokens = devicesSnap.docs.map((doc) => doc.data().token).filter(Boolean);

    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: {
        title: copy.title,
        body: copy.body,
      },
      webpush: {
        notification: {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
          tag: `aurum-test-reminder-${decoded.uid}`,
        },
        fcmOptions: {
          link: locale === 'fr' ? 'https://aurumdiary.com/fr/sanctuary/write' : 'https://aurumdiary.com/sanctuary/write',
        },
      },
      data: {
        link: locale === 'fr' ? '/fr/sanctuary/write' : '/sanctuary/write',
        tag: `aurum-test-reminder-${decoded.uid}`,
      },
    });

    if (response.successCount > 0) {
      await trackServerEvent('writing_reminder_test_sent', {
        userId: decoded.uid,
        userEmail: decoded.email ?? null,
        path: '/api/reminders/send-test',
        params: {
          tone,
          locale,
          successCount: response.successCount,
          failureCount: response.failureCount,
        },
      });
    }
    return NextResponse.json({ ok: true, successCount: response.successCount, failureCount: response.failureCount });
  } catch {
    return NextResponse.json({ error: 'Unable to send test reminder' }, { status: 500 });
  }
}

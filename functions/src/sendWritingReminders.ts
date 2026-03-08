import { onSchedule } from 'firebase-functions/v2/scheduler';
import { firestore, admin } from './admin';

type Tone = 'gentle' | 'clarity' | 'pressure_release' | 'routine';
type Locale = 'fr' | 'en';

const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const REMINDER_LIBRARY: Record<Locale, Record<Tone, string[]>> = {
  fr: {
    gentle: [
      '{firstName}, tu veux prendre trois minutes pour toi ?',
      '{firstName}, comment ca va vraiment aujourd\'hui ?',
      '{firstName}, quelques lignes suffisent pour te retrouver.',
    ],
    clarity: [
      '{firstName}, tu veux y voir un peu plus clair ?',
      '{firstName}, qu\'est-ce qui prend le plus de place dans ta tete ?',
      '{firstName}, pose ce qui tourne en boucle.',
    ],
    pressure_release: [
      '{firstName}, tu veux relacher un peu la pression ?',
      '{firstName}, quelques lignes peuvent deja alleger la charge.',
      '{firstName}, un moment pour deposer ce qui pese ?',
    ],
    routine: [
      '{firstName}, tu reprends ton fil aujourd\'hui ?',
      '{firstName}, quelques lignes pour garder ton rythme ?',
      '{firstName}, tu veux continuer ton espace d\'ecriture ?',
    ],
  },
  en: {
    gentle: [
      '{firstName}, want to take three quiet minutes for yourself?',
      '{firstName}, how are you really doing today?',
      '{firstName}, a few lines can be enough to come back to yourself.',
    ],
    clarity: [
      '{firstName}, want a little more clarity today?',
      '{firstName}, what is taking the most space in your mind right now?',
      '{firstName}, want to put down what keeps looping?',
    ],
    pressure_release: [
      '{firstName}, want to let some pressure out?',
      '{firstName}, a few lines can already lighten the load.',
      '{firstName}, want a moment to put down what feels heavy?',
    ],
    routine: [
      '{firstName}, ready to pick up your thread today?',
      '{firstName}, a few lines to keep your rhythm going?',
      '{firstName}, want to come back to your writing space?',
    ],
  },
};

function sanitizeFirstName(value?: string | null) {
  const cleaned = String(value || '').trim();
  if (!cleaned) return null;
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function buildCopy(params: { locale: Locale; tone: Tone; firstName?: string | null; seed: number }) {
  const library = REMINDER_LIBRARY[params.locale][params.tone];
  const template = library[Math.abs(params.seed) % library.length] || library[0];
  const firstName = sanitizeFirstName(params.firstName) || (params.locale === 'fr' ? 'toi' : 'you');
  return {
    title: template.replace('{firstName}', firstName),
    body: params.locale === 'fr'
      ? 'Ouvre Aurum et ecris quelques lignes, sans pression.'
      : 'Open Aurum and write a few lines, without pressure.',
  };
}

function getLocalContext(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const pick = (type: string) => parts.find((part) => part.type === type)?.value || '';
  const weekday = WEEKDAY_MAP[pick('weekday')] ?? 0;
  const year = pick('year');
  const month = pick('month');
  const day = pick('day');
  const hour = Number(pick('hour'));
  const minute = Number(pick('minute'));
  return {
    weekday,
    localDateKey: `${year}-${month}-${day}`,
    minuteOfDay: hour * 60 + minute,
  };
}

function isDue(now: Date, prefs: FirebaseFirestore.DocumentData) {
  const timeZone = typeof prefs.timezone === 'string' && prefs.timezone ? prefs.timezone : 'UTC';
  const context = getLocalContext(now, timeZone);
  const days = Array.isArray(prefs.writingReminderDays)
    ? prefs.writingReminderDays.filter((value: unknown): value is number => typeof value === 'number')
    : [];
  if (!days.includes(context.weekday)) {
    return { due: false, context, timeZone };
  }

  const [hoursRaw, minutesRaw] = String(prefs.writingReminderTime || '20:30').split(':');
  const targetMinute = Number(hoursRaw) * 60 + Number(minutesRaw);
  const delta = context.minuteOfDay - targetMinute;

  return {
    due: delta >= 0 && delta < 5,
    context,
    timeZone,
  };
}

export const sendWritingReminders = onSchedule(
  {
    schedule: 'every 5 minutes',
    timeZone: 'UTC',
    memory: '512MiB',
    timeoutSeconds: 540,
  },
  async () => {
    const prefsSnapshot = await firestore
      .collectionGroup('preferences')
      .where('writingReminderEnabled', '==', true)
      .get();

    const messaging = admin.messaging();
    const now = new Date();
    let sent = 0;

    for (const prefsDoc of prefsSnapshot.docs) {
      const prefs = prefsDoc.data();
      if (!prefs.notificationsEnabled) continue;

      const { due, context } = isDue(now, prefs);
      if (!due) continue;

      const pathParts = prefsDoc.ref.path.split('/');
      const userId = pathParts[1];
      if (!userId) continue;

      const userRef = firestore.collection('users').doc(userId);
      const [userSnap, devicesSnap] = await Promise.all([
        userRef.get(),
        userRef.collection('devices').where('pushEnabled', '==', true).get(),
      ]);

      if (devicesSnap.empty) continue;

      const userData = userSnap.data() || {};
      const locale: Locale = prefs.language === 'fr' ? 'fr' : 'en';
      const tone: Tone = ['gentle', 'clarity', 'pressure_release', 'routine'].includes(String(prefs.writingReminderTone))
        ? prefs.writingReminderTone as Tone
        : 'gentle';
      const firstName = userData.firstName || userData.displayName || userData.email?.split('@')[0] || null;
      const copy = buildCopy({ locale, tone, firstName, seed: now.getUTCDate() + context.weekday });
      const link = locale === 'fr' ? 'https://aurumdiary.com/fr/sanctuary/write' : 'https://aurumdiary.com/sanctuary/write';

      for (const deviceDoc of devicesSnap.docs) {
        const device = deviceDoc.data();
        if (!device.token || device.permission !== 'granted') continue;

        const reminderKey = `${context.localDateKey}:${prefs.writingReminderTime}`;
        if (device.lastReminderSentKey === reminderKey) continue;

        try {
          await messaging.send({
            token: device.token,
            notification: {
              title: copy.title,
              body: copy.body,
            },
            webpush: {
              notification: {
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-192x192.png',
                tag: `aurum-writing-reminder-${deviceDoc.id}`,
              },
              fcmOptions: { link },
            },
            data: {
              link,
              tag: `aurum-writing-reminder-${deviceDoc.id}`,
            },
          });

          await deviceDoc.ref.set(
            {
              lastReminderSentAt: admin.firestore.FieldValue.serverTimestamp(),
              lastReminderSentKey: reminderKey,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );

          await firestore.collection('analyticsEvents').add({
            name: 'writing_reminder_sent',
            userId,
            userEmail: typeof userData.email === 'string' ? userData.email : null,
            clientId: null,
            path: '/functions/sendWritingReminders',
            params: {
              deviceId: deviceDoc.id,
              tone,
              locale,
              reminderTime: String(prefs.writingReminderTime || '20:30'),
              reminderDateKey: context.localDateKey,
            },
            occurredAt: new Date(),
            source: 'server',
          });

          sent += 1;
        } catch (error: any) {
          const code = String(error?.code || '');
          if (code.includes('registration-token-not-registered') || code.includes('invalid-argument')) {
            await deviceDoc.ref.set(
              {
                token: null,
                pushEnabled: false,
                invalidAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true }
            );
          }
        }
      }
    }

    console.log(`sendWritingReminders complete: ${sent} notifications sent`);
  }
);

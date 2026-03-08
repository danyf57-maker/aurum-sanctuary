'use client';

import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { deleteToken, getMessaging, getToken, isSupported } from 'firebase/messaging';
import { app, firestore } from '@/lib/firebase/web-client';

const DEVICE_ID_STORAGE_KEY = 'aurum-push-device-id';

function getDeviceId() {
  if (typeof window === 'undefined') {
    return 'server';
  }

  const existing = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (existing) return existing;

  const next = `web-${crypto.randomUUID()}`;
  window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, next);
  return next;
}

async function getMessagingInstance() {
  if (!(await isSupported())) {
    return null;
  }

  return getMessaging(app);
}

async function getServiceWorkerRegistration() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  return navigator.serviceWorker.register('/firebase-messaging-sw.js');
}

export async function registerPushReminderDevice(params: {
  userId: string;
  idToken: string;
  language: 'fr' | 'en';
  timezone: string;
}) {
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.trim();

  const messaging = await getMessagingInstance();
  if (!messaging) {
    throw new Error('Messaging is not supported in this browser');
  }

  const serviceWorkerRegistration = await getServiceWorkerRegistration();
  if (!serviceWorkerRegistration) {
    throw new Error('Service worker registration failed');
  }

  const token = await getToken(
    messaging,
    vapidKey
      ? {
          vapidKey,
          serviceWorkerRegistration,
        }
      : {
          serviceWorkerRegistration,
        }
  );

  if (!token) {
    throw new Error('No push token returned by Firebase Messaging');
  }

  const deviceId = getDeviceId();
  await fetch('/api/reminders/register-device', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.idToken}`,
    },
    body: JSON.stringify({
      deviceId,
      token,
      language: params.language,
      timezone: params.timezone,
      permission: Notification.permission,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    }),
  });

  await setDoc(
    doc(firestore, 'users', params.userId, 'devices', deviceId),
    {
      token,
      platform: 'web',
      permission: Notification.permission,
      language: params.language,
      timezone: params.timezone,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return { token, deviceId };
}

export async function unregisterPushReminderDevice(params: {
  userId: string;
  idToken: string;
}) {
  const deviceId = getDeviceId();
  const messaging = await getMessagingInstance();

  if (messaging) {
    try {
      await deleteToken(messaging);
    } catch {
      // best effort
    }
  }

  await fetch('/api/reminders/unregister-device', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.idToken}`,
    },
    body: JSON.stringify({ deviceId }),
  });

  await setDoc(
    doc(firestore, 'users', params.userId, 'devices', deviceId),
    {
      token: null,
      permission: typeof Notification !== 'undefined' ? Notification.permission : 'default',
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return { deviceId };
}

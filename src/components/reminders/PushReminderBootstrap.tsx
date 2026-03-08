"use client";

import { useEffect, useRef } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useSettings } from '@/hooks/useSettings';
import { registerPushReminderDevice, unregisterPushReminderDevice } from '@/lib/reminders/push';

export function PushReminderBootstrap() {
  const { user } = useAuth();
  const { preferences } = useSettings();
  const inFlight = useRef(false);

  useEffect(() => {
    if (!user || typeof window === 'undefined' || !('Notification' in window) || inFlight.current) {
      return;
    }

    const shouldRegister =
      preferences.notificationsEnabled &&
      preferences.writingReminderEnabled &&
      Notification.permission === 'granted';

    inFlight.current = true;

    (async () => {
      try {
        const idToken = await user.getIdToken();
        if (shouldRegister) {
          await registerPushReminderDevice({
            userId: user.uid,
            idToken,
            language: preferences.language,
            timezone: preferences.timezone,
          });
        } else {
          await unregisterPushReminderDevice({
            userId: user.uid,
            idToken,
          });
        }
      } catch {
        // silent background sync
      } finally {
        inFlight.current = false;
      }
    })();
  }, [
    preferences.language,
    preferences.notificationsEnabled,
    preferences.timezone,
    preferences.writingReminderEnabled,
    user,
  ]);

  return null;
}

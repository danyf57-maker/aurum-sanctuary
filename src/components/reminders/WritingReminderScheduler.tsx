"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/providers/auth-provider";
import { useLocale } from "@/hooks/use-locale";
import { resolveFirstName } from "@/lib/profile/first-name";
import { buildWritingReminderCopy } from "@/lib/reminders/writing-reminders";

const CHECK_INTERVAL_MS = 30_000;

function isReminderDue(now: Date, reminderTime: string, reminderDays: number[]) {
  if (!reminderDays.includes(now.getDay())) {
    return false;
  }

  const [hours, minutes] = reminderTime.split(":").map((value) => Number(value));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return false;
  }

  return now.getHours() === hours && now.getMinutes() === minutes;
}

function buildReminderStorageKey(userId: string, now: Date, reminderTime: string) {
  const day = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return `aurum-writing-reminder:${userId}:${day}:${reminderTime}`;
}

export function WritingReminderScheduler() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const { toast } = useToast();
  const { user } = useAuth();
  const { preferences } = useSettings();

  const firstName = useMemo(
    () =>
      resolveFirstName({
        firstName: null,
        displayName: user?.displayName,
        email: user?.email,
        fallback: locale === "fr" ? "toi" : "you",
      }),
    [locale, user?.displayName, user?.email]
  );

  useEffect(() => {
    if (!user) return;
    if (typeof window === "undefined") return;
    if (!preferences.notificationsEnabled || !preferences.writingReminderEnabled) return;
    if (!("Notification" in window)) return;

    const triggerReminder = () => {
      const now = new Date();
      if (pathname.includes("/write")) {
        return;
      }

      if (!isReminderDue(now, preferences.writingReminderTime, preferences.writingReminderDays)) {
        return;
      }

      const reminderKey = buildReminderStorageKey(user.uid, now, preferences.writingReminderTime);
      if (window.localStorage.getItem(reminderKey)) {
        return;
      }

      const copy = buildWritingReminderCopy({
        locale,
        tone: preferences.writingReminderTone,
        firstName,
        seed: now.getDay() + now.getDate(),
      });

      const openWriter = () => {
        router.push(locale === "fr" ? "/fr/sanctuary/write" : "/sanctuary/write");
      };

      if (Notification.permission === "granted" && document.visibilityState !== "visible") {
        const notification = new Notification(copy.title, {
          body: copy.body,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-192x192.png",
          tag: `aurum-writing-reminder-${user.uid}`,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
          openWriter();
        };
      } else {
        toast({
          title: copy.title,
          description: copy.body,
          duration: 12000,
        });
      }

      window.localStorage.setItem(reminderKey, now.toISOString());
    };

    triggerReminder();
    const interval = window.setInterval(triggerReminder, CHECK_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [
    firstName,
    locale,
    pathname,
    preferences.notificationsEnabled,
    preferences.writingReminderDays,
    preferences.writingReminderEnabled,
    preferences.writingReminderTime,
    preferences.writingReminderTone,
    router,
    toast,
    user,
  ]);

  return null;
}

"use client";

import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/providers/auth-provider";

export function useLocale(): "en" | "fr" {
  const { preferences } = useSettings();
  const { user } = useAuth();

  if (!user && typeof navigator !== "undefined") {
    return navigator.language.toLowerCase().startsWith("fr") ? "fr" : "en";
  }

  return preferences.language;
}

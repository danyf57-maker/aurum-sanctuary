"use client";

import { useLocale as useNextIntlLocale } from "next-intl";
import { type Locale, normalizeLocale } from "@/lib/locale";

export function useLocale(defaultLocale: Locale = "en"): Locale {
  const locale = normalizeLocale(useNextIntlLocale());
  return locale ?? defaultLocale;
}

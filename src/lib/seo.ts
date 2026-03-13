import type { Locale } from "@/lib/locale";
import { toLocalePath } from "@/i18n/routing";

export const SITE_URL = "https://aurumdiary.com";

export function absoluteUrl(pathname: string, locale: Locale = "en"): string {
  const path = toLocalePath(pathname, locale);
  return new URL(path, SITE_URL).toString();
}

export function buildLanguageAlternates(pathname: string) {
  return {
    en: absoluteUrl(pathname, "en"),
    fr: absoluteUrl(pathname, "fr"),
  };
}

export function buildAlternates(pathname: string, locale: Locale) {
  return {
    canonical: absoluteUrl(pathname, locale),
    languages: buildLanguageAlternates(pathname),
  };
}

export function openGraphLocale(locale: Locale): string {
  return locale === "fr" ? "fr_FR" : "en_US";
}

export function schemaLanguage(locale: Locale): string {
  return locale === "fr" ? "fr-FR" : "en-US";
}

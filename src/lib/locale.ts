import {
  DEFAULT_PRODUCT_LOCALE,
  normalizeProductLocale,
  type ProductLocale,
} from "./language-policy";

export type Locale = ProductLocale;

export const LOCALE_COOKIE_NAME = "aurum-locale";

export function normalizeLocale(input?: string | null): Locale | null {
  return normalizeProductLocale(input);
}

export function resolveLocaleFromAcceptLanguage(header?: string | null): Locale {
  if (!header) return DEFAULT_PRODUCT_LOCALE;
  const parsed = normalizeLocale(header);
  if (parsed) return parsed;

  const parts = header
    .split(",")
    .map((part) => part.split(";")[0]?.trim())
    .filter(Boolean);
  for (const part of parts) {
    const locale = normalizeLocale(part);
    if (locale) return locale;
  }
  return DEFAULT_PRODUCT_LOCALE;
}

export function resolveLocaleFromCountry(country?: string | null): Locale | null {
  if (!country) return null;
  return country.toUpperCase() === "FR" ? "fr" : DEFAULT_PRODUCT_LOCALE;
}

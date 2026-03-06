export type Locale = "fr" | "en";

export const LOCALE_COOKIE_NAME = "aurum-locale";

export function normalizeLocale(input?: string | null): Locale | null {
  if (!input) return null;
  const value = input.toLowerCase();
  if (value.startsWith("fr")) return "fr";
  if (value.startsWith("en")) return "en";
  return null;
}

export function resolveLocaleFromAcceptLanguage(header?: string | null): Locale {
  if (!header) return "en";
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
  return "en";
}

export function resolveLocaleFromCountry(country?: string | null): Locale | null {
  if (!country) return null;
  return country.toUpperCase() === "FR" ? "fr" : "en";
}


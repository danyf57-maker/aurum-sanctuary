import { cookies, headers } from "next/headers";
import {
  LOCALE_COOKIE_NAME,
  type Locale,
  normalizeLocale,
  resolveLocaleFromAcceptLanguage,
  resolveLocaleFromCountry,
} from "@/lib/locale";

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const localeFromMiddleware = normalizeLocale(headerStore.get("x-aurum-locale"));
  if (localeFromMiddleware) return localeFromMiddleware;

  const localeFromCookie = normalizeLocale(
    cookieStore.get(LOCALE_COOKIE_NAME)?.value
  );
  if (localeFromCookie) return localeFromCookie;

  const country =
    headerStore.get("x-vercel-ip-country") ||
    headerStore.get("cf-ipcountry") ||
    headerStore.get("x-country-code");
  const localeFromCountry = resolveLocaleFromCountry(country);
  if (localeFromCountry) return localeFromCountry;

  return resolveLocaleFromAcceptLanguage(headerStore.get("accept-language"));
}

import { cookies, headers } from "next/headers";
import {
  LOCALE_COOKIE_NAME,
  type Locale,
  normalizeLocale,
  resolveLocaleFromCountry,
} from "@/lib/locale";

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const localeFromMiddleware = normalizeLocale(headerStore.get("x-aurum-locale"));
  if (localeFromMiddleware === "fr") return localeFromMiddleware;

  const localeFromCookie = normalizeLocale(
    cookieStore.get(LOCALE_COOKIE_NAME)?.value
  );
  if (localeFromCookie === "fr") return localeFromCookie;

  const country =
    headerStore.get("x-vercel-ip-country") ||
    headerStore.get("cf-ipcountry") ||
    headerStore.get("x-country-code");
  const localeFromCountry = resolveLocaleFromCountry(country);
  if (localeFromCountry) return localeFromCountry;

  return "fr";
}

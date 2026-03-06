"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLocale } from "@/hooks/use-locale";
import { LOCALE_COOKIE_NAME, type Locale } from "@/lib/locale";
import { stripLocalePrefix, toLocalePath } from "@/i18n/routing";

interface LanguageSwitchProps {
  className?: string;
  compact?: boolean;
}

function setLocaleCookie(locale: Locale) {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = [
    `${LOCALE_COOKIE_NAME}=${locale}`,
    "Path=/",
    "Max-Age=31536000",
    "SameSite=Lax",
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function LanguageSwitch({ className, compact = false }: LanguageSwitchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const handleSwitch = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    setLocaleCookie(nextLocale);
    document.documentElement.lang = nextLocale;

    const normalizedPath = stripLocalePrefix(pathname || "/");
    const targetPath = toLocalePath(normalizedPath, nextLocale);
    const query = searchParams.toString();
    router.push(query ? `${targetPath}?${query}` : targetPath);
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-stone-200 bg-white p-1 shadow-sm",
        compact ? "gap-1" : "gap-1.5",
        className
      )}
      role="group"
      aria-label="Language switch"
    >
      {(["fr", "en"] as const).map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => handleSwitch(code)}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] transition-colors",
              compact ? "min-w-9" : "min-w-10",
              active
                ? "bg-stone-900 text-white"
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            )}
            aria-pressed={active}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}

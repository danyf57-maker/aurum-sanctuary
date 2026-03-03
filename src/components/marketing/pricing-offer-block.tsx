 "use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics/client";
import { useEffect, useMemo, useState } from "react";

type PricingOfferBlockProps = {
  ctaHref?: string;
  ctaLabel?: string;
  className?: string;
  locale?: "fr" | "en";
};

export function PricingOfferBlock({
  ctaHref = "/pricing",
  ctaLabel,
  className = "",
  locale: forcedLocale,
}: PricingOfferBlockProps) {
  const [locale, setLocale] = useState<"fr" | "en">("en");

  useEffect(() => {
    if (forcedLocale) {
      setLocale(forcedLocale);
      return;
    }
    if (typeof document === "undefined") return;
    const cookieLocale = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("aurum-locale="))
      ?.split("=")[1]
      ?.toLowerCase();

    if (cookieLocale === "fr") {
      setLocale("fr");
      return;
    }

    const navLang = (navigator.language || "").toLowerCase();
    setLocale(navLang.startsWith("fr") ? "fr" : "en");
  }, [forcedLocale]);

  const copy = useMemo(() => {
    if (locale === "fr") {
      return {
        badge: "ACCES COMPLET 7 JOURS",
        title: "Teste tout pendant 7 jours, puis decide.",
        body: "Aucune carte requise pour ouvrir ton compte. Continue uniquement si ca t'aide.",
        cta: ctaLabel || "Voir les tarifs",
      };
    }

    return {
      badge: "7-DAY FULL ACCESS",
      title: "Try everything for 7 days, then decide.",
      body: "No card required to open your account. Continue only if it helps.",
      cta: ctaLabel || "See pricing",
    };
  }, [ctaLabel, locale]);

  return (
    <section className={className}>
      <div className="mx-auto aspect-square w-full max-w-[560px] rounded-3xl border border-stone-200 bg-gradient-to-b from-white to-stone-50 p-8 shadow-sm md:p-10">
        <div className="flex h-full flex-col justify-between">
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
              {copy.badge}
            </p>
            <h3 className="font-headline text-3xl text-stone-900 md:text-4xl">
              {copy.title}
            </h3>
            <p className="max-w-sm text-base text-stone-600">
              {copy.body}
            </p>
          </div>

          <div className="pt-6">
            <Link
              href={ctaHref}
              onClick={() =>
                void trackEvent({
                  name: "cta_click",
                  params: {
                    cta_id: "landing_square_offer_pricing",
                    cta_text: copy.cta,
                    page_path: "/",
                  },
                })
              }
              className="inline-flex items-center rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-stone-50 hover:bg-stone-800"
            >
              {copy.cta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics/client";
import { useLocale } from "@/hooks/use-locale";
import { useLocalizedHref } from "@/hooks/use-localized-href";
import { useTranslations } from "next-intl";

type PricingOfferBlockProps = {
  ctaHref?: string;
  ctaLabel?: string;
  className?: string;
  pagePath?: string;
};

export function PricingOfferBlock({
  ctaHref = "/pricing",
  ctaLabel,
  className = "",
  pagePath = "/",
}: PricingOfferBlockProps) {
  const t = useTranslations("trialOffer");
  const locale = useLocale();
  const to = useLocalizedHref();

  return (
    <section className={className}>
      <div className="mx-auto w-full max-w-[720px] rounded-3xl border border-stone-200 bg-gradient-to-b from-white to-stone-50 p-8 shadow-sm md:p-10">
        <div className="flex h-full flex-col justify-between gap-8">
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
              {t("badge")}
            </p>
            <h3 className="font-headline text-3xl text-stone-900 md:text-4xl">
              {t("title")}
            </h3>
            <p className="max-w-2xl text-base text-stone-600">
              {t("body")}
            </p>
          </div>

          <div className="pt-2">
            <Link
              href={to(ctaHref)}
              onClick={() =>
                void trackEvent({
                  name: "cta_click",
                  params: {
                    cta_id: `trial_offer_${locale}`,
                    cta_text: ctaLabel || t("cta"),
                    page_path: pagePath,
                  },
                })
              }
              className="inline-flex items-center rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-stone-50 hover:bg-stone-800"
            >
              {ctaLabel || t("cta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

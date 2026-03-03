 "use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics/client";

type PricingOfferBlockProps = {
  ctaHref?: string;
  ctaLabel?: string;
  className?: string;
};

export function PricingOfferBlock({
  ctaHref = "/pricing",
  ctaLabel = "See pricing",
  className = "",
}: PricingOfferBlockProps) {
  return (
    <section className={className}>
      <div className="mx-auto aspect-square w-full max-w-[560px] rounded-3xl border border-stone-200 bg-gradient-to-b from-white to-stone-50 p-8 shadow-sm md:p-10">
        <div className="flex h-full flex-col justify-between">
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
              7-day full access
            </p>
            <h3 className="font-headline text-3xl text-stone-900 md:text-4xl">
              Try everything for 7 days, then decide.
            </h3>
            <p className="max-w-sm text-base text-stone-600">
              No commitment to start. Continue only if it helps.
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
                    cta_text: ctaLabel,
                    page_path: "/",
                  },
                })
              }
              className="inline-flex items-center rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-stone-50 hover:bg-stone-800"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

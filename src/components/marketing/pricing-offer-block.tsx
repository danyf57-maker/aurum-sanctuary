import Link from "next/link";

type PricingOfferBlockProps = {
  ctaHref?: string;
  ctaLabel?: string;
  className?: string;
};

export function PricingOfferBlock({
  ctaHref = "/pricing",
  ctaLabel = "View plans",
  className = "",
}: PricingOfferBlockProps) {
  return (
    <section className={className}>
      <div className="mx-auto max-w-4xl rounded-3xl border border-stone-200 bg-gradient-to-b from-white to-stone-50 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-semibold">
              Limited trial offer
            </p>
            <h3 className="mt-2 text-2xl md:text-3xl font-headline text-stone-900">
              Get full access free for 7 days
            </h3>
            <p className="mt-2 text-sm text-stone-600">
              Experience everything with zero friction, then decide.
            </p>
          </div>
          <div className="inline-flex rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-stone-50">
            Full offer included
          </div>
        </div>

        <div className="mt-5 grid gap-2 text-sm text-stone-700 md:grid-cols-2">
          <p>All core features are available during your 7-day trial.</p>
          <p>No card required to start.</p>
          <p>Then EUR 13/month or EUR 129/year.</p>
          <p>Cancel anytime.</p>
        </div>

        <div className="mt-6">
          <Link
            href={ctaHref}
            className="inline-flex items-center rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-stone-50 hover:bg-stone-800"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

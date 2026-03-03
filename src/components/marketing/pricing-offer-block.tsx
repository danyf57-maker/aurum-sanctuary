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
      <div className="rounded-3xl border border-stone-200 bg-white p-6 md:p-10 shadow-sm">
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-semibold">
            Clear Pricing
          </p>
          <h3 className="mt-2 text-2xl md:text-3xl font-headline text-stone-900">
            Start free for 7 days. Continue only if it helps.
          </h3>
        </div>

        <div className="rounded-2xl bg-stone-50 p-5">
          <ul className="space-y-2 text-sm text-stone-700">
            <li>7-day free trial.</li>
            <li>No card required to start.</li>
            <li>Then EUR 13/month or EUR 129/year.</li>
            <li>Cancel anytime.</li>
            <li>Aurum supports multiple languages: EN, FR, ES.</li>
          </ul>
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

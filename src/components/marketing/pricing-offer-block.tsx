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
            Aurum Premium
          </p>
          <h3 className="mt-2 text-2xl md:text-3xl font-headline text-stone-900">
            7-day free trial, then Premium if you choose to continue
          </h3>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-stone-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-stone-600">
              FR
            </p>
            <ul className="mt-3 space-y-2 text-sm text-stone-700">
              <li>Essai gratuit 7 jours pour tester Aurum Premium.</li>
              <li>Sans carte au demarrage de l'essai.</li>
              <li>Puis 13 EUR/mois ou 129 EUR/an si tu continues.</li>
              <li>Annulation a tout moment.</li>
              <li>Aurum te repond en plusieurs langues: FR, EN, ES.</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-stone-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-stone-600">
              EN
            </p>
            <ul className="mt-3 space-y-2 text-sm text-stone-700">
              <li>7-day free trial to test Aurum Premium.</li>
              <li>No card required to start the trial.</li>
              <li>Then EUR 13/month or EUR 129/year if you continue.</li>
              <li>Cancel anytime.</li>
              <li>Aurum replies in multiple languages: FR, EN, ES.</li>
            </ul>
          </div>
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

"use client";

import { Clock3, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

type TrialExplainerCardProps = {
  namespace?: "pricing" | "paywall";
  compact?: boolean;
};

export function TrialExplainerCard({
  namespace = "pricing",
  compact = false,
}: TrialExplainerCardProps) {
  const pricingT = useTranslations("pricing.trial");
  const paywallT = useTranslations("paywall");

  const copy =
    namespace === "paywall"
      ? {
          badge: paywallT("trialBadge"),
          title: paywallT("trialTitle"),
          body: paywallT("trialBody"),
          bullet1: paywallT("trialBullet1"),
          bullet2: paywallT("trialBullet2"),
          bullet3: paywallT("trialBullet3"),
          note: paywallT("trialNote"),
        }
      : {
          badge: pricingT("badge"),
          title: pricingT("title"),
          body: pricingT("body"),
          bullet1: pricingT("bullet1"),
          bullet2: pricingT("bullet2"),
          bullet3: pricingT("bullet3"),
          bullet4: pricingT("bullet4"),
          note: pricingT("note"),
        };

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 text-stone-800">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-800">
        <Sparkles className="h-3.5 w-3.5" />
        {copy.badge}
      </div>
      <h3 className="font-headline text-2xl text-stone-900">{copy.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-stone-700">{copy.body}</p>
      <ul className="mt-4 space-y-2 text-sm text-stone-700">
        <li className="flex items-start gap-2">
          <Clock3 className="mt-0.5 h-4 w-4 text-amber-700" />
          <span>{copy.bullet1}</span>
        </li>
        <li className="flex items-start gap-2">
          <Clock3 className="mt-0.5 h-4 w-4 text-amber-700" />
          <span>{copy.bullet2}</span>
        </li>
        <li className="flex items-start gap-2">
          <Clock3 className="mt-0.5 h-4 w-4 text-amber-700" />
          <span>{copy.bullet3}</span>
        </li>
        {namespace === "pricing" && !compact && copy.bullet4 && (
          <li className="flex items-start gap-2">
            <Clock3 className="mt-0.5 h-4 w-4 text-amber-700" />
            <span>{copy.bullet4}</span>
          </li>
        )}
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-stone-600">{copy.note}</p>
    </div>
  );
}

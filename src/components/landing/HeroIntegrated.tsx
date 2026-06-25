import { getTranslations } from "next-intl/server";
import { getRequestLocale } from "@/lib/locale-server";
import HeroDraftBox, { type HeroDraftBoxContent } from "./HeroDraftBox";

export default async function HeroIntegrated() {
  const locale = await getRequestLocale();
  const t = await getTranslations("hero");
  const content: HeroDraftBoxContent = {
    helper: t("helper"),
    helperWithDraft: t("helperWithDraft"),
    cta: t("cta"),
    ctaContinueDraft: t("ctaContinueDraft"),
    ctaSecondary: t("ctaSecondary"),
    ctaSecondaryGuest: t("ctaSecondaryGuest"),
    ctaAuthenticated: t("ctaAuthenticated"),
    ctaSecondaryAuthenticated: t("ctaSecondaryAuthenticated"),
    languagesBadge: t("languagesBadge"),
    languages: t("languages"),
    trust: t("trust"),
    placeholders: [t("placeholders.0"), t("placeholders.1"), t("placeholders.2")],
    preview: {
      label: t("preview.label"),
      title: t("preview.title"),
      pointTitle: t("preview.pointTitle"),
      point: t("preview.point"),
      patternTitle: t("preview.patternTitle"),
      pattern: t("preview.pattern"),
      questionTitle: t("preview.questionTitle"),
      question: t("preview.question"),
      cta: t("preview.cta"),
    },
  };

  return (
    <section className="bg-stone-50 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 text-center">
          <div className="space-y-4">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-[#8A6A00] sm:tracking-[0.35em]">
              {t("badge")}
            </p>
            <h1 className="font-headline text-4xl text-stone-900 md:text-6xl">
              {t("title")}
            </h1>
            <p className="font-body text-lg text-stone-600 md:text-xl">
              {t("subtitle")}
            </p>
          </div>

          <HeroDraftBox locale={locale} content={content} />
        </div>
      </div>
    </section>
  );
}

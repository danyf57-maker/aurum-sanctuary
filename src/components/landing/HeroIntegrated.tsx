"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LanguageSwitch } from "@/components/layout/language-switch";
import { useLocale, useTranslations } from "next-intl";
import { useLocalizedHref } from "@/hooks/use-localized-href";
import { useAuth } from "@/providers/auth-provider";
import { resolveMessage } from "@/lib/i18n/resolve-message";

const HeroIntegrated = () => {
  const locale = useLocale();
  const t = useTranslations("hero");
  const to = useLocalizedHref();
  const { user } = useAuth();

  const fallbackContent = useMemo(
    () => locale === "fr"
    ? {
        badge: "ECRITURE PRIVEE • REFLET PRECIS",
        title: "Ecris en prive. Vois plus clair en toi.",
        subtitle:
          "Des travaux de James Pennebaker a l'Universite du Texas montrent que mettre une experience en mots aide a y voir plus clair. Commence a ecrire.",
        helper:
          "Ecris une ligne honnete. Aurum l'ouvre dans ta page privee.",
        helperWithDraft:
          "Crée ton compte pour ouvrir ce texte dans ta page privée.",
        cta: "Commencer gratuitement",
        ctaContinueDraft: "Créer mon compte pour continuer",
        ctaSecondary: "Ecrire une premiere page",
        ctaSecondaryGuest: "J'ai déjà un compte",
        ctaAuthenticated: "Continuer a ecrire",
        ctaSecondaryAuthenticated: "Ouvrir mon journal",
        languagesBadge: "Aurum te repond dans ta langue",
        interfaceLanguage:
          "Au premier chargement, Aurum suit la langue de ton navigateur. Ensuite, il garde la langue que tu choisis.",
        languages:
          "Ecris en francais, anglais, espagnol, italien, allemand ou portugais.",
        trust: "7 jours gratuits • Prive par conception • Resiliable a tout moment.",
        placeholders: [
          "Je n'arrive pas a dormir, mon cerveau tourne en boucle sur la reunion de demain...",
          "Je me sens completement submerge par ma liste de taches aujourd'hui...",
          "J'ai juste besoin de vider ma tete avant d'exploser...",
        ],
      }
    : {
        badge: "PRIVATE WRITING • SHARP REFLECTION",
        title: "Write in private. See yourself more clearly.",
        subtitle:
          "James Pennebaker's work at the University of Texas suggests that putting experience into words helps people see it more clearly. Start writing.",
        helper:
          "Write one honest line. Aurum opens it inside your private page.",
        helperWithDraft:
          "Create your account to open this text inside your private page.",
        cta: "Start for free",
        ctaContinueDraft: "Create my account to continue",
        ctaSecondary: "Write a first page",
        ctaSecondaryGuest: "I already have an account",
        ctaAuthenticated: "Continue writing",
        ctaSecondaryAuthenticated: "Open my journal",
        languagesBadge: "Aurum replies in your language",
        interfaceLanguage:
          "On your first visit, Aurum opens in your browser language. After that, it keeps the language you choose.",
        languages:
          "Write in English, French, Spanish, Italian, German, or Portuguese.",
        trust: "7 days free • Private by design • Cancel anytime.",
        placeholders: [
          "I can't sleep, my mind keeps replaying tomorrow's meeting...",
          "I feel completely overwhelmed by my to-do list today...",
          "I just need to clear my head before I explode...",
        ],
      },
    [locale]
  );

  const placeholders = useMemo(
    () => [
      resolveMessage(t("placeholders.0"), fallbackContent.placeholders[0]),
      resolveMessage(t("placeholders.1"), fallbackContent.placeholders[1]),
      resolveMessage(t("placeholders.2"), fallbackContent.placeholders[2]),
    ],
    [fallbackContent.placeholders, t]
  );
  const [thought, setThought] = useState("");
  const [placeholderText, setPlaceholderText] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const hasDraft = thought.trim().length > 0;
  const draftRedirect = hasDraft
    ? `/sanctuary/write?initial=${encodeURIComponent(thought)}`
    : "/sanctuary/write";
  const signupHref = user
    ? to(draftRedirect)
    : to(`/signup?redirect=${encodeURIComponent(draftRedirect)}`);
  const loginHref = to(`/login?redirect=${encodeURIComponent(draftRedirect)}`);
  const secondaryHref = user ? to("/sanctuary") : loginHref;

  useEffect(() => {
    setPlaceholderText("");
    setPlaceholderIndex(0);
    setCharIndex(0);
    setIsDeleting(false);
  }, [locale]);

  useEffect(() => {
    const current = placeholders[placeholderIndex];
    const typingSpeed = isDeleting ? 40 : 80;
    const timeout = setTimeout(() => {
      if (!isDeleting && charIndex < current.length) {
        setPlaceholderText(current.slice(0, charIndex + 1));
        setCharIndex((value) => value + 1);
      } else if (isDeleting && charIndex > 0) {
        setPlaceholderText(current.slice(0, charIndex - 1));
        setCharIndex((value) => value - 1);
      } else if (!isDeleting && charIndex === current.length) {
        setTimeout(() => setIsDeleting(true), 1800);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setPlaceholderIndex((value) => (value + 1) % placeholders.length);
      }
    }, isDeleting && charIndex === 0 ? 300 : typingSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, placeholderIndex, placeholders]);

  return (
    <section className="bg-stone-50 py-24 md:py-32">
      <div className="container">
        <div className="mb-6 flex justify-end">
          <LanguageSwitch compact />
        </div>
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 text-center">
          <div className="space-y-4">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-[#8A6A00] font-semibold">
              {resolveMessage(t("badge"), fallbackContent.badge)}
            </p>
            <h1 className="font-headline text-4xl md:text-6xl text-stone-900">
              {resolveMessage(t("title"), fallbackContent.title)}
            </h1>
            <p className="font-body text-lg md:text-xl text-stone-600">
              {resolveMessage(t("subtitle"), fallbackContent.subtitle)}
            </p>
          </div>

          <div className="w-full">
            <div className="relative rounded-3xl border border-[#D4AF37]/25 bg-white/80 p-6 md:p-8 shadow-xl">
              <textarea
                value={thought}
                onChange={(event) => setThought(event.target.value)}
                placeholder={placeholderText}
                className="h-44 w-full resize-none bg-transparent text-lg md:text-xl font-body text-stone-800 placeholder:text-stone-400 focus:outline-none"
              />
              <div className="mt-3 border-t border-[#D4AF37]/20 pt-3 text-center">
                <p className="font-body text-sm text-stone-600">
                  {hasDraft
                    ? resolveMessage(t("helperWithDraft"), fallbackContent.helperWithDraft)
                    : resolveMessage(t("helper"), fallbackContent.helper)}
                </p>
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-[#D4AF37]/15" />
            </div>

            <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <>
                <Button
                  asChild
                  size="lg"
                  className="h-12 md:h-14 px-8 rounded-xl bg-[#D4AF37] text-stone-900 hover:bg-[#D4AF37]/90"
                >
                  <Link href={signupHref}>
                    {user
                      ? resolveMessage(t("ctaAuthenticated"), fallbackContent.ctaAuthenticated)
                      : hasDraft
                        ? resolveMessage(t("ctaContinueDraft"), fallbackContent.ctaContinueDraft)
                        : resolveMessage(t("cta"), fallbackContent.cta)}
                  </Link>
                </Button>
                <Link href={secondaryHref} className="font-body text-sm text-stone-600 hover:text-stone-900 transition-colors">
                  {user
                    ? resolveMessage(t("ctaSecondaryAuthenticated"), fallbackContent.ctaSecondaryAuthenticated)
                    : hasDraft
                      ? resolveMessage(t("ctaSecondaryGuest"), fallbackContent.ctaSecondaryGuest)
                      : resolveMessage(t("ctaSecondary"), fallbackContent.ctaSecondary)}
                </Link>
              </>
            </div>
            <div className="mt-4 space-y-3 text-center">
              <div className="flex justify-center">
                <span className="inline-flex items-center rounded-full border border-[#8A6A00]/35 bg-[#D4AF37]/10 px-4 py-2 font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-700">
                  {resolveMessage(t("languagesBadge"), fallbackContent.languagesBadge)}
                </span>
              </div>
              <p className="mx-auto max-w-2xl font-body text-sm text-stone-500">
                {resolveMessage(t("languages"), fallbackContent.languages)}
              </p>
              <span className="block font-body text-xs uppercase tracking-[0.2em] text-stone-500">
                {resolveMessage(t("trust"), fallbackContent.trust)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroIntegrated;

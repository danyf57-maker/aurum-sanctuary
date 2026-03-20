"use client";

import { useEffect, useState } from "react";
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

  const fallbackContent = locale === "fr"
    ? {
        badge: "REFLEXION PRIVEE GUIDEE",
        title: "Ecris en prive. Vois ce qui revient en toi.",
        subtitle:
          "Aurum est un espace de reflexion privee guidee par l'IA. Ecris franchement, recois un reflet clair, et vois ce qui revient dans le temps.",
        helper:
          "Ecris une premiere phrase ici. Aurum l'ouvrira dans ta page privee.",
        cta: "Commencer gratuitement",
        ctaSecondary: "Ecrire une premiere page",
        ctaAuthenticated: "Continuer a ecrire",
        ctaSecondaryAuthenticated: "Ouvrir mon journal",
        languagesBadge: "Reflexion multilingue",
        interfaceLanguage:
          "Au premier chargement, Aurum suit la langue de ton navigateur. Ensuite, il garde la langue que tu choisis.",
        languages:
          "Tu peux ecrire en francais, anglais, espagnol, italien, allemand ou portugais. Aurum te repond dans ta langue.",
        trust: "Chiffre par defaut • Reflexion guidee • Prive par conception.",
        placeholders: [
          "Je n'arrive pas a dormir, mon cerveau tourne en boucle sur la reunion de demain...",
          "Je me sens completement submerge par ma liste de taches aujourd'hui...",
          "J'ai juste besoin de vider ma tete avant d'exploser...",
        ],
      }
    : {
        badge: "PRIVATE GUIDED REFLECTION",
        title: "Write in private. See what keeps returning.",
        subtitle:
          "Aurum is a private AI-guided reflection space. Write honestly, get clear reflections, and see what keeps returning over time.",
        helper:
          "Try a first line here. Aurum will open it inside your private page.",
        cta: "Start for free",
        ctaSecondary: "Write a first page",
        ctaAuthenticated: "Continue writing",
        ctaSecondaryAuthenticated: "Open my journal",
        languagesBadge: "Multilingual reflection",
        interfaceLanguage:
          "On your first visit, Aurum opens in your browser language. After that, it keeps the language you choose.",
        languages:
          "You can write in English, French, Spanish, Italian, German, or Portuguese. Aurum replies in your language.",
        trust: "Encrypted by default • Guided reflection • Private by design.",
        placeholders: [
          "I can't sleep, my mind keeps replaying tomorrow's meeting...",
          "I feel completely overwhelmed by my to-do list today...",
          "I just need to clear my head before I explode...",
        ],
      };

  const placeholders = [
    resolveMessage(t("placeholders.0"), fallbackContent.placeholders[0]),
    resolveMessage(t("placeholders.1"), fallbackContent.placeholders[1]),
    resolveMessage(t("placeholders.2"), fallbackContent.placeholders[2]),
  ];
  const [thought, setThought] = useState("");
  const [placeholderText, setPlaceholderText] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const guestWriteHref =
    thought.trim().length > 0
      ? to(`/sanctuary/write?initial=${encodeURIComponent(thought)}`)
      : to("/sanctuary/write");
  const primaryHref = user ? to("/sanctuary/write") : to("/signup");
  const secondaryHref = user ? to("/sanctuary/magazine") : guestWriteHref;

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
            <p className="font-body text-xs uppercase tracking-[0.35em] text-[#D4AF37] font-semibold">
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
                  {resolveMessage(t("helper"), fallbackContent.helper)}
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
                  <Link href={primaryHref}>
                    {user
                      ? resolveMessage(t("ctaAuthenticated"), fallbackContent.ctaAuthenticated)
                      : resolveMessage(t("cta"), fallbackContent.cta)}
                  </Link>
                </Button>
                <Link href={secondaryHref} className="font-body text-sm text-stone-600 hover:text-stone-900 transition-colors">
                  {user
                    ? resolveMessage(t("ctaSecondaryAuthenticated"), fallbackContent.ctaSecondaryAuthenticated)
                    : resolveMessage(t("ctaSecondary"), fallbackContent.ctaSecondary)}
                </Link>
              </>
            </div>
            <div className="mt-4 space-y-3 text-center">
              <div className="flex justify-center">
                <span className="inline-flex items-center rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-4 py-2 font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-700">
                  {resolveMessage(t("languagesBadge"), fallbackContent.languagesBadge)}
                </span>
              </div>
              <p className="mx-auto max-w-2xl font-body text-sm text-stone-600">
                {resolveMessage(t("interfaceLanguage"), fallbackContent.interfaceLanguage)}
              </p>
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

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
  const { user, loading } = useAuth();

  const fallbackContent = locale === "fr"
    ? {
        badge: "REFLEXION PRIVEE GUIDEE",
        title: "Ecris en prive. Vois ce qui revient en toi.",
        subtitle:
          "Aurum t'aide a ecrire librement, clarifier ce que tu ressens, et faire emerger les motifs interieurs qui reviennent.",
        cta: "Creer mon compte gratuitement",
        ctaSecondary: "Ecrire d'abord, sans engagement",
        ctaAuthenticated: "Continuer a ecrire",
        ctaSecondaryAuthenticated: "Ouvrir mon journal",
        ctaLoading: "Ouverture...",
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
        quotes: [
          {
            hint: "Ecris sans te filtrer. Retrouve de la clarte grace a une reflexion douce.",
            detail: "Ecris simplement ce que tu as en tete, sans filtre.",
            quote: "Ecrire, c'est une facon de parler sans etre interrompu.",
            author: "Jules Renard",
          },
          {
            hint: "Quand tu rumines, ecris ce qui tourne en boucle.",
            detail: "Mettre les mots dehors aide ton mental a ralentir.",
            quote: "J'ecris pour decouvrir ce que je pense.",
            author: "Joan Didion",
          },
          {
            hint: "Si tu portes trop, depose tout ici, ligne apres ligne.",
            detail: "Tu n'as pas besoin d'ecrire parfaitement, juste d'ecrire vrai.",
            quote: "Il n'y a pas de plus grande agonie que de porter une histoire non racontee en soi.",
            author: "Maya Angelou",
          },
        ],
      }
    : {
        badge: "PRIVATE GUIDED REFLECTION",
        title: "Write in private. See what keeps returning.",
        subtitle:
          "Aurum helps you write freely, clarify what you feel, and uncover recurring inner patterns.",
        cta: "Create my free account",
        ctaSecondary: "Write first, no commitment",
        ctaAuthenticated: "Continue writing",
        ctaSecondaryAuthenticated: "Open my journal",
        ctaLoading: "Loading...",
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
        quotes: [
          {
            hint: "Write without filtering. Regain clarity with gentle reflection.",
            detail: "Just write what's on your mind, without filtering.",
            quote: "Writing is a way of talking without being interrupted.",
            author: "Jules Renard",
          },
          {
            hint: "When you're ruminating, write down what keeps looping.",
            detail: "Getting words out helps your mind slow down.",
            quote: "I write to find out what I think.",
            author: "Joan Didion",
          },
          {
            hint: "If you're carrying too much, set it all down here, line by line.",
            detail: "You don't need to write perfectly, just write honestly.",
            quote: "There is no greater agony than bearing an untold story inside you.",
            author: "Maya Angelou",
          },
        ],
      };

  const placeholders = [
    resolveMessage(t("placeholders.0"), fallbackContent.placeholders[0]),
    resolveMessage(t("placeholders.1"), fallbackContent.placeholders[1]),
    resolveMessage(t("placeholders.2"), fallbackContent.placeholders[2]),
  ];
  const rotatingQuotes = Array.from({ length: 8 }, (_, i) => ({
    hint: resolveMessage(t(`quotes.${i}.hint`), fallbackContent.quotes[i % fallbackContent.quotes.length].hint),
    detail: resolveMessage(t(`quotes.${i}.detail`), fallbackContent.quotes[i % fallbackContent.quotes.length].detail),
    quote: resolveMessage(t(`quotes.${i}.quote`), fallbackContent.quotes[i % fallbackContent.quotes.length].quote),
    author: resolveMessage(t(`quotes.${i}.author`), fallbackContent.quotes[i % fallbackContent.quotes.length].author),
  }));
  const [thought, setThought] = useState("");
  const [placeholderText, setPlaceholderText] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
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
    setQuoteIndex(0);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((value) => (value + 1) % rotatingQuotes.length);
    }, 4200);

    return () => clearInterval(interval);
  }, [rotatingQuotes.length]);

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
                <p
                  key={quoteIndex}
                  className="font-body text-sm text-stone-700 transition-opacity duration-500"
                >
                  {rotatingQuotes[quoteIndex].hint}
                </p>
                <p className="mt-1 font-body text-xs text-stone-500 transition-opacity duration-500">
                  {rotatingQuotes[quoteIndex].detail}
                </p>
                <p className="mt-2 font-body text-xs italic text-stone-500 transition-opacity duration-500">
                  &ldquo;{rotatingQuotes[quoteIndex].quote}&rdquo;{" "}
                  <span className="not-italic">- {rotatingQuotes[quoteIndex].author}</span>
                </p>
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-[#D4AF37]/15" />
            </div>

            <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  {loading ? (
                <Button
                  size="lg"
                  disabled
                  className="h-12 md:h-14 px-8 rounded-xl bg-[#D4AF37] text-stone-900"
                >
                  {resolveMessage(t("ctaLoading"), fallbackContent.ctaLoading)}
                </Button>
              ) : (
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
              )}
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

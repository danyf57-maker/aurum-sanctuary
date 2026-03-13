"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LanguageSwitch } from "@/components/layout/language-switch";
import { useLocale, useTranslations } from "next-intl";
import { useLocalizedHref } from "@/hooks/use-localized-href";
import { useAuth } from "@/providers/auth-provider";

const HeroIntegrated = () => {
  const locale = useLocale();
  const t = useTranslations("hero");
  const to = useLocalizedHref();
  const { user, loading } = useAuth();

  const placeholders = [t("placeholders.0"), t("placeholders.1"), t("placeholders.2")];
  const rotatingQuotes = Array.from({ length: 8 }, (_, i) => ({
    hint: t(`quotes.${i}.hint`),
    detail: t(`quotes.${i}.detail`),
    quote: t(`quotes.${i}.quote`),
    author: t(`quotes.${i}.author`),
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
              {t("badge")}
            </p>
            <h1 className="font-headline text-4xl md:text-6xl text-stone-900">
              {t("title")}
            </h1>
            <p className="font-body text-lg md:text-xl text-stone-600">
              {t("subtitle")}
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
                  {t("ctaLoading")}
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="h-12 md:h-14 px-8 rounded-xl bg-[#D4AF37] text-stone-900 hover:bg-[#D4AF37]/90"
                  >
                    <Link href={primaryHref}>
                      {user ? t("ctaAuthenticated") : t("cta")}
                    </Link>
                  </Button>
                  <Link href={secondaryHref} className="font-body text-sm text-stone-600 hover:text-stone-900 transition-colors">
                    {user ? t("ctaSecondaryAuthenticated") : t("ctaSecondary")}
                  </Link>
                </>
              )}
            </div>
            <div className="mt-4 space-y-3 text-center">
              <div className="flex justify-center">
                <span className="inline-flex items-center rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-4 py-2 font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-700">
                  {t("languagesBadge")}
                </span>
              </div>
              <p className="mx-auto max-w-2xl font-body text-sm text-stone-500">
                {t("languages")}
              </p>
              <span className="block font-body text-xs uppercase tracking-[0.2em] text-stone-500">
                {t("trust")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroIntegrated;

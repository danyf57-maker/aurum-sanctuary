"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/hooks/use-locale";

const HeroIntegrated = () => {
  const locale = useLocale();
  const isFr = locale === "fr";
  const placeholders = useMemo(
    () =>
      isFr
        ? [
            "Une intuition...",
            "Une petite victoire...",
            "Un rêve au réveil...",
            "Ce qui te pèse...",
            "Une gratitude...",
          ]
        : [
            "A quiet realization...",
            "A small win...",
            "A dream from this morning...",
            "What's weighing on you...",
            "One thing you're grateful for...",
          ],
    [isFr]
  );
  const [thought, setThought] = useState("");
  const [placeholderText, setPlaceholderText] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

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
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 text-center">
          <div className="space-y-4">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
              {isFr
                ? "APPLICATION DE JOURNALING & BIEN-ÊTRE MENTAL"
                : "JOURNALING & MENTAL WELLBEING APP"}
            </p>
            <h1 className="font-headline text-4xl text-stone-900 md:text-6xl">
              {isFr ? "Ta tête est pleine de bazars ?" : "Is your mind full of noise?"}
            </h1>
            <p className="font-body text-lg text-stone-600 md:text-xl">
              {isFr
                ? "Range tes pensées ici. C'est ton carnet secret pour te sentir mieux."
                : "Put your thoughts down here. Your private notebook to feel clearer."}
            </p>
            <p className="font-body text-sm italic text-stone-500">
              {isFr
                ? "“Écrire un peu chaque jour aide à te sentir mieux.” "
                : "“Writing a little every day helps you feel better.” "}
              <span className="not-italic">- Aurum</span>
            </p>
          </div>

          <div className="w-full">
            <div className="relative rounded-3xl border border-[#D4AF37]/25 bg-white/80 p-6 shadow-xl md:p-8">
              <textarea
                value={thought}
                onChange={(event) => setThought(event.target.value)}
                placeholder={placeholderText}
                className="h-52 w-full resize-none bg-transparent font-body text-lg text-stone-800 placeholder:text-stone-400 focus:outline-none md:text-xl"
              />
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-[#D4AF37]/15" />
            </div>

            <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-xl bg-[#D4AF37] px-8 text-stone-900 hover:bg-[#D4AF37]/90 md:h-14"
              >
                <Link href={`/sanctuary/write?initial=${encodeURIComponent(thought)}`}>
                  {isFr ? "Entrer dans le Sanctuaire" : "Enter the Sanctuary"}
                </Link>
              </Button>
              <span className="font-body text-xs uppercase tracking-[0.2em] text-stone-500">
                {isFr
                  ? "100% Chiffré • Anonyme • Ton jardin privé."
                  : "100% Encrypted • Anonymous • Your private garden."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroIntegrated;

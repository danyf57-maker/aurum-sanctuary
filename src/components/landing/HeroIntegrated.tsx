"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const HeroIntegrated = () => {
  const placeholders = useMemo(
    () => [
      "Une intuition...",
      "Une petite victoire...",
      "Un rêve au réveil...",
      "Ce qui te pèse...",
      "Une gratitude...",
    ],
    []
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
            <p className="font-body text-xs uppercase tracking-[0.35em] text-[#D4AF37] font-semibold">
              APPLICATION DE JOURNALING & BIEN-ÊTRE MENTAL
            </p>
            <h1 className="font-headline text-4xl md:text-6xl text-stone-900">
              Ta tête est pleine de bazars ?
            </h1>
            <p className="font-body text-lg md:text-xl text-stone-600">
              Range tes pensées ici. C'est ton carnet secret pour te sentir mieux.
            </p>
          </div>

          <div className="w-full">
            <div className="relative rounded-3xl border border-[#D4AF37]/25 bg-white/80 p-6 md:p-8 shadow-xl">
              <textarea
                value={thought}
                onChange={(event) => setThought(event.target.value)}
                placeholder={placeholderText}
                className="h-52 w-full resize-none bg-transparent text-lg md:text-xl font-body text-stone-800 placeholder:text-stone-400 focus:outline-none"
              />
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-[#D4AF37]/15" />
            </div>

            <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                asChild
                size="lg"
                className="h-12 md:h-14 px-8 rounded-xl bg-[#D4AF37] text-stone-900 hover:bg-[#D4AF37]/90"
              >
                <Link href={`/sanctuary/write?initial=${encodeURIComponent(thought)}`}>
                  Entrer dans le Sanctuaire
                </Link>
              </Button>
              <span className="font-body text-xs uppercase tracking-[0.2em] text-stone-500">
                100% Chiffré • Anonyme • Ton jardin privé.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroIntegrated;

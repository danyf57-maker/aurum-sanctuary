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
      "Ce qui vous pèse...",
      "Une gratitude...",
    ],
    []
  );
  const rotatingQuotes = useMemo(
    () => [
      {
        hint: "Étape 1: écris juste ce qu'il se passe maintenant.",
        detail: "Exemple: 'J'ai la tête pleine avant ma réunion.'",
        quote: "Écrire, c'est une façon de parler sans être interrompu.",
        author: "Jules Renard",
      },
      {
        hint: "Étape 2: nomme l'émotion que tu ressens.",
        detail: "Exemple: 'Je me sens tendu et un peu perdu.'",
        quote: "Écrire, c'est aussi ne pas parler. C'est se taire. C'est hurler sans bruit.",
        author: "Marguerite Duras",
      },
      {
        hint: "Étape 3: ajoute ce dont tu as besoin tout de suite.",
        detail: "Exemple: 'J'ai besoin de 10 minutes de calme.'",
        quote: "Je n'écris pas pour dire que je suis forte, j'écris pour le devenir.",
        author: "Marie Cardinal",
      },
      {
        hint: "Tu peux écrire en phrases très courtes.",
        detail: "Même 3 lignes suffisent pour remettre de l'ordre.",
        quote: "Le papier est plus patient que les hommes.",
        author: "Anne Frank",
      },
      {
        hint: "N'essaie pas d'être parfait, essaie d'être vrai.",
        detail: "Plus c'est simple, plus ton esprit se calme vite.",
        quote: "J'écris pour savoir ce que je pense.",
        author: "Joan Didion",
      },
    ],
    []
  );
  const [thought, setThought] = useState("");
  const [placeholderText, setPlaceholderText] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const writeHref =
    thought.trim().length > 0
      ? `/sanctuary/write?initial=${encodeURIComponent(thought)}`
      : "/sanctuary/write";

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
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 text-center">
          <div className="space-y-4">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-[#D4AF37] font-semibold">
              INSTANT DE SÉRÉNITÉ
            </p>
            <h1 className="font-headline text-4xl md:text-6xl text-stone-900">
              Votre esprit est plein. Allégez-le ici.
            </h1>
            <p className="font-body text-lg md:text-xl text-stone-600">
              Un sanctuaire secret pour transformer votre chaos intérieur en une clarté immédiate.
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
              <Button
                asChild
                size="lg"
                className="h-12 md:h-14 px-8 rounded-xl bg-[#D4AF37] text-stone-900 hover:bg-[#D4AF37]/90"
              >
                <Link href={writeHref}>
                  Entrer dans le Sanctuaire
                </Link>
              </Button>
              <span className="font-body text-xs uppercase tracking-[0.2em] text-stone-500">
                100% Chiffré • Anonyme • Votre jardin privé.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroIntegrated;

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LanguageSwitch } from "@/components/layout/language-switch";

const HeroIntegrated = () => {
  const placeholders = useMemo(
    () => [
      "Je n'arrive pas à dormir, mon cerveau tourne en boucle sur la réunion de demain...",
      "Je me sens complètement submergé par ma liste de tâches aujourd'hui...",
      "J'ai juste besoin de vider ma tête avant d'exploser...",
    ],
    []
  );
  const rotatingQuotes = useMemo(
    () => [
      {
        hint: "Couche tes pensées. Apaise ton esprit avant de dormir.",
        detail: "Écris simplement ce que tu as en tête, sans filtre.",
        quote: "Écrire, c'est une façon de parler sans être interrompu.",
        author: "Jules Renard",
      },
      {
        hint: "Quand tu rumines, écris ce qui tourne en boucle.",
        detail: "Mettre les mots dehors aide ton mental à ralentir.",
        quote: "J'écris pour découvrir ce que je pense.",
        author: "Joan Didion",
      },
      {
        hint: "Si tu portes trop, dépose tout ici, ligne après ligne.",
        detail: "Tu n'as pas besoin d'écrire parfaitement, juste d'écrire vrai.",
        quote: "Il n'y a pas de plus grande agonie que de porter une histoire non racontée en soi.",
        author: "Maya Angelou",
      },
      {
        hint: "Quand tu doutes de toi, reviens aux faits et à ton ressenti.",
        detail: "Quelques lignes peuvent te redonner un point d'appui.",
        quote: "Un mot après l'autre, c'est le pouvoir.",
        author: "Margaret Atwood",
      },
      {
        hint: "Quand la charge mentale monte, ce cadre devient ton sas.",
        detail: "Tu peux poser tes priorités et retrouver de l'air.",
        quote: "Nous écrivons pour goûter la vie deux fois.",
        author: "Anaïs Nin",
      },
      {
        hint: "Après une journée lourde, vide ta tête avant la nuit.",
        detail: "Même 2 minutes d'écriture peuvent changer ton état.",
        quote: "Écrire est une forme de thérapie.",
        author: "Graham Greene",
      },
      {
        hint: "Quand tout est flou, une phrase claire suffit pour repartir.",
        detail: "Commence petit: un fait, une émotion, un besoin.",
        quote: "Écrire, c'est une façon de parler sans être interrompu.",
        author: "Jules Renard",
      },
      {
        hint: "Quand ton esprit accélère, ralentis avec des mots simples.",
        detail: "Ici, tu peux déposer sans te juger.",
        quote: "J'écris pour découvrir ce que je pense.",
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
  const signupHref = "/signup";

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
              INSTANT DE SÉRÉNITÉ
            </p>
            <h1 className="font-headline text-4xl md:text-6xl text-stone-900">
              Ton esprit est plein. Allège-le ici.
            </h1>
            <p className="font-body text-lg md:text-xl text-stone-600">
              Ton journal intime privé pour transformer ton chaos intérieur en clarté.
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
                <Link href={signupHref}>
                  Créer mon compte gratuitement
                </Link>
              </Button>
              <Link href={writeHref} className="font-body text-sm text-stone-600 hover:text-stone-900 transition-colors">
                Écrire d&apos;abord sans engagement
              </Link>
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

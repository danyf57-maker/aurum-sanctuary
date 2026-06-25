"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { useLocalizedHref } from "@/hooks/use-localized-href";

export type HeroDraftBoxContent = {
  helper: string;
  helperWithDraft: string;
  cta: string;
  ctaContinueDraft: string;
  ctaSecondary: string;
  ctaSecondaryGuest: string;
  ctaAuthenticated: string;
  ctaSecondaryAuthenticated: string;
  languagesBadge: string;
  languages: string;
  trust: string;
  placeholders: string[];
  preview: {
    label: string;
    title: string;
    pointTitle: string;
    point: string;
    patternTitle: string;
    pattern: string;
    questionTitle: string;
    question: string;
    cta: string;
  };
};

type HeroDraftBoxProps = {
  locale: string;
  content: HeroDraftBoxContent;
};

export default function HeroDraftBox({ locale, content }: HeroDraftBoxProps) {
  const to = useLocalizedHref();
  const { user } = useAuth();
  const [thought, setThought] = useState("");
  const [placeholderText, setPlaceholderText] = useState(content.placeholders[0] ?? "");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(content.placeholders[0]?.length ?? 0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const hasDraft = thought.trim().length > 0;
  const canPreview = hasDraft && !user;
  const draftRedirect = hasDraft
    ? `/sanctuary/write?initial=${encodeURIComponent(thought)}`
    : "/sanctuary/write";
  const signupHref = user
    ? to(draftRedirect)
    : to(`/signup?redirect=${encodeURIComponent(draftRedirect)}`);
  const loginHref = to(`/login?redirect=${encodeURIComponent(draftRedirect)}`);
  const secondaryHref = user ? to("/sanctuary") : loginHref;

  useEffect(() => {
    setPlaceholderText(content.placeholders[0] ?? "");
    setPlaceholderIndex(0);
    setCharIndex(content.placeholders[0]?.length ?? 0);
    setIsDeleting(false);
    setShowPreview(false);
  }, [content.placeholders, locale]);

  useEffect(() => {
    const current = content.placeholders[placeholderIndex];
    if (!current) return;

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
        setPlaceholderIndex((value) => (value + 1) % content.placeholders.length);
      }
    }, isDeleting && charIndex === 0 ? 300 : typingSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, content.placeholders, isDeleting, placeholderIndex]);

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-white/90 shadow-xl transition-shadow focus-within:shadow-2xl focus-within:ring-2 focus-within:ring-[#D4AF37]/25">
        <div className="border-b border-[#D4AF37]/20 px-5 py-3 text-left md:px-7">
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A00]">
            {hasDraft ? content.helperWithDraft : content.helper}
          </p>
        </div>
        <textarea
          aria-label={content.helper}
          value={thought}
          onChange={(event) => setThought(event.target.value)}
          placeholder={placeholderText || content.placeholders[0]}
          className="min-h-36 w-full resize-none bg-transparent px-5 py-6 text-left text-lg font-body text-stone-800 placeholder:text-stone-400 focus:outline-none md:min-h-44 md:px-7 md:text-xl"
        />
        <div className="flex flex-col gap-3 border-t border-[#D4AF37]/20 bg-stone-50/70 px-5 py-4 text-left sm:flex-row sm:items-center sm:justify-between md:px-7">
          <p className="font-body text-sm text-stone-600">
            {hasDraft
              ? locale === "fr"
                ? "Ton texte sera repris dans ton espace privé."
                : "Your text will continue inside your private space."
              : locale === "fr"
                ? "Commence par une phrase. Le reste peut attendre."
                : "Start with one sentence. The rest can wait."}
          </p>
          <span className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-[#8A6A00]">
            {locale === "fr" ? "Privé par conception" : "Private by design"}
          </span>
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-[#D4AF37]/15" />
      </div>

      <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        {canPreview ? (
          <Button
            type="button"
            size="lg"
            onClick={() => setShowPreview(true)}
            className="h-12 rounded-xl bg-[#D4AF37] px-8 text-stone-900 hover:bg-[#D4AF37]/90 md:h-14"
          >
            {content.ctaContinueDraft}
          </Button>
        ) : (
          <Button
            asChild
            size="lg"
            className="h-12 rounded-xl bg-[#D4AF37] px-8 text-stone-900 hover:bg-[#D4AF37]/90 md:h-14"
          >
            <Link href={signupHref}>
              {user ? content.ctaAuthenticated : content.cta}
            </Link>
          </Button>
        )}
        <Link href={secondaryHref} className="font-body text-sm text-stone-600 transition-colors hover:text-stone-900">
          {user
            ? content.ctaSecondaryAuthenticated
            : hasDraft ? content.ctaSecondaryGuest : content.ctaSecondary}
        </Link>
      </div>

      {showPreview && (
        <div className="mt-7 rounded-3xl border border-[#D4AF37]/30 bg-white px-5 py-5 text-left shadow-lg md:px-7 md:py-6">
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A6A00]">
            {content.preview.label}
          </p>
          <h2 className="mt-2 font-headline text-2xl text-stone-900">
            {content.preview.title}
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-stone-50 px-4 py-4">
              <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
                {content.preview.pointTitle}
              </p>
              <p className="mt-2 font-body text-sm leading-relaxed text-stone-700">
                {content.preview.point}
              </p>
            </div>
            <div className="rounded-2xl bg-stone-50 px-4 py-4">
              <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
                {content.preview.patternTitle}
              </p>
              <p className="mt-2 font-body text-sm leading-relaxed text-stone-700">
                {content.preview.pattern}
              </p>
            </div>
            <div className="rounded-2xl bg-[#D4AF37]/10 px-4 py-4">
              <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-[#8A6A00]">
                {content.preview.questionTitle}
              </p>
              <p className="mt-2 font-body text-sm leading-relaxed text-stone-800">
                {content.preview.question}
              </p>
            </div>
          </div>
          <div className="mt-5">
            <Button
              asChild
              className="rounded-xl bg-stone-900 px-5 text-stone-50 hover:bg-stone-800"
            >
              <Link href={signupHref}>{content.preview.cta}</Link>
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-3 text-center">
        <div className="flex justify-center">
          <span className="inline-flex items-center rounded-full border border-[#8A6A00]/35 bg-[#D4AF37]/10 px-4 py-2 font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-700">
            {content.languagesBadge}
          </span>
        </div>
        <p className="mx-auto max-w-2xl font-body text-sm text-stone-500">
          {content.languages}
        </p>
        <span className="block font-body text-xs uppercase tracking-[0.12em] text-stone-500 sm:tracking-[0.2em]">
          {content.trust}
        </span>
      </div>
    </div>
  );
}

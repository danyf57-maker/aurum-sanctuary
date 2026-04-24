"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/providers/auth-provider";
import { useLocalizedHref } from "@/hooks/use-localized-href";

export function FloatingHomeCta() {
  const [visible, setVisible] = useState(false);
  const { user } = useAuth();
  const to = useLocalizedHref();
  const t = useTranslations("marketingPage");

  const href = user ? to("/sanctuary/write") : to("/signup");
  const label = user ? t("returningUser.writeCta") : t("floatingCta.cta");

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.8);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-8 right-8 z-[100] transition-all duration-300 ease-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-8 opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <Link
        href={href}
        className="group inline-flex h-14 items-center justify-center gap-3 rounded-full border-4 border-white/20 bg-primary px-8 text-sm font-medium text-primary-foreground shadow-2xl backdrop-blur-sm transition-colors hover:bg-primary/90"
      >
        <span className="font-headline font-semibold">{label}</span>
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      </Link>
      <div className="mt-2 text-center pointer-events-none">
        <span className="rounded-full bg-black/40 px-3 py-1 text-[9px] font-bold uppercase tracking-tighter text-white backdrop-blur-sm">
          {t("floatingCta.label")}
        </span>
      </div>
    </div>
  );
}

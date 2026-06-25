import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function readSource(file: string) {
  return readFileSync(join(process.cwd(), file), "utf8");
}

describe("landing audit regressions", () => {
  it("makes the hero writing field feel actionable instead of empty", () => {
    const hero = readSource("src/components/landing/HeroDraftBox.tsx");

    expect(hero).toContain("aria-label");
    expect(hero).toContain("min-h-36");
    expect(hero).toContain("border-b border-[#D4AF37]/20");
    expect(hero).toContain("setShowPreview(true)");
    expect(hero).toContain("content.preview.question");
    expect(hero).toContain("content.preview.cta");
    expect(hero).not.toContain("h-44 w-full resize-none");
  });

  it("keeps the cookie consent compact on mobile", () => {
    const cookieConsent = readSource("src/components/legal/CookieConsent.tsx");

    expect(cookieConsent).toContain("sm:bottom-4 sm:left-4 sm:right-4");
    expect(cookieConsent).toContain("max-w-3xl");
    expect(cookieConsent).toContain("text-xs sm:text-sm");
    expect(cookieConsent).toContain("size=\"icon\"");
  });

  it("does not let next-pwa auto-register the stale generated service worker", () => {
    const nextConfig = readSource("next.config.js");

    expect(nextConfig).toContain("register: false");
    expect(nextConfig).toContain('sw: "sw.js"');
  });

  it("reduces repeated signup CTAs inside the use-case card grid", () => {
    const marketingPage = readSource("src/app/(marketing)/page.tsx");

    expect(marketingPage).toContain("const FEATURED_USE_CASE_COUNT = 3");
    expect(marketingPage).toContain("index < FEATURED_USE_CASE_COUNT");
    expect(marketingPage).toContain("useCases.sectionCta");
  });
});

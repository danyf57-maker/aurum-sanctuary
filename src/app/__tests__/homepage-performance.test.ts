import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("homepage performance constraints", () => {
  it("does not import the Google One Tap bundle directly in the root layout", () => {
    const layoutSource = readFileSync(
      join(process.cwd(), "src/app/layout.tsx"),
      "utf8"
    );

    expect(layoutSource).not.toMatch(/import GoogleAnalytics from/);
    expect(layoutSource).toContain("dynamic(");
  });

  it("does not hydrate the full i18n message catalog in the root provider", () => {
    const layoutSource = readFileSync(
      join(process.cwd(), "src/app/layout.tsx"),
      "utf8"
    );

    expect(layoutSource).toContain("selectClientMessages");
    expect(layoutSource).toContain("clientMessages");
    expect(layoutSource).toContain("GLOBAL_CLIENT_MESSAGE_KEYS");
    expect(layoutSource).toContain("HOME_MARKETING_CLIENT_MESSAGE_KEYS");
    expect(layoutSource).toContain("HOME_HERO_CLIENT_MESSAGE_KEYS");
    expect(layoutSource).not.toContain("messages={messages}");
  });

  it("keeps the marketing homepage server-first with interaction in small islands", () => {
    const homepageSource = readFileSync(
      join(process.cwd(), "src/app/(marketing)/page.tsx"),
      "utf8"
    );
    const floatingCtaSource = readFileSync(
      join(process.cwd(), "src/components/marketing/floating-home-cta.tsx"),
      "utf8"
    );

    expect(homepageSource).not.toContain("use client");
    expect(homepageSource).not.toContain("framer-motion");
    expect(homepageSource).not.toContain("useAuth");
    expect(homepageSource).not.toContain("useTranslations");
    expect(homepageSource).toContain("getTranslations");
    expect(floatingCtaSource).toContain('"use client"');
    expect(floatingCtaSource).toContain("passive: true");
  });
});

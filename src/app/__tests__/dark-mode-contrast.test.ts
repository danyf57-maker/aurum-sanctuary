import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function readSource(file: string) {
  return readFileSync(join(process.cwd(), file), "utf8");
}

describe("authenticated app dark mode contrast", () => {
  it("keeps marketing FAQ questions visible when dark mode is active", () => {
    const marketingPage = readSource("src/app/(marketing)/page.tsx");

    expect(marketingPage).toContain("dark:text-stone-100");
    expect(marketingPage).toContain("dark:divide-stone-700");
    expect(marketingPage).toContain("dark:border-stone-700");
  });

  it("keeps the journal header, stats, and cards readable in dark mode", () => {
    const journalPage = readSource("src/app/(app)/sanctuary/page.tsx");
    const journalCard = readSource("src/components/journal/journal-magazine-card.tsx");

    expect(journalPage).toContain("dark:text-stone-100");
    expect(journalPage).toContain("dark:text-stone-300");
    expect(journalCard).toContain("dark:bg-stone-900");
    expect(journalCard).toContain("dark:text-stone-100");
    expect(journalCard).toContain("dark:text-stone-300");
  });

  it("keeps entry page navigation, subtitles, timestamps, and chat inputs readable in dark mode", () => {
    const entryPage = readSource("src/app/(app)/sanctuary/entry/[entryId]/page.tsx");
    const entryEditor = readSource("src/components/sanctuary/magazine-entry-editor.tsx");

    expect(entryPage).toContain("dark:text-stone-200");
    expect(entryPage).toContain("dark:text-stone-300");
    expect(entryPage).toContain("dark:bg-stone-900");
    expect(entryEditor).toContain("dark:text-stone-300");
    expect(entryEditor).toContain("dark:placeholder:text-stone-400");
    expect(entryEditor).toContain("dark:from-amber-950");
  });

  it("keeps the app chrome and writing placeholder coherent in dark mode", () => {
    const header = readSource("src/components/layout/header.tsx");
    const languageSwitch = readSource("src/components/layout/language-switch.tsx");
    const appSidebar = readSource("src/components/layout/app-sidebar.tsx");
    const mobileBottomNav = readSource("src/components/layout/mobile-bottom-nav.tsx");
    const writePage = readSource("src/app/(app)/sanctuary/write/page.tsx");
    const premiumForm = readSource("src/components/sanctuary/premium-journal-form.tsx");

    expect(header).toContain("dark:border-stone-700");
    expect(header).toContain("dark:text-stone-200");
    expect(languageSwitch).toContain("dark:bg-stone-900");
    expect(languageSwitch).toContain("dark:text-stone-300");
    expect(appSidebar).toContain("dark:from-stone-950");
    expect(appSidebar).toContain("dark:text-stone-300");
    expect(mobileBottomNav).toContain("dark:bg-stone-950/95");
    expect(writePage).toContain("dark:from-stone-950");
    expect(premiumForm).toContain("dark:placeholder:text-stone-400");
  });
});

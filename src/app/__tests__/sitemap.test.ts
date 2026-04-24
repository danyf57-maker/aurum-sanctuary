import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";

describe("sitemap", () => {
  it("includes the scientific references pages linked from the homepage", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls).toContain("https://aurumdiary.com/etudes-scientifiques");
    expect(urls).toContain("https://aurumdiary.com/fr/etudes-scientifiques");
  });

  it("includes the new organic growth guides in both languages", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);

    for (const slug of [
      "private-journal-app",
      "emotional-clarity-journal",
      "mental-load-journaling",
      "how-to-stop-rumination",
      "journaling-for-overthinking",
      "journal-prompts-for-anxiety",
      "private-diary-vs-notes-app",
      "rosebud-alternative",
    ]) {
      expect(urls).toContain(`https://aurumdiary.com/guides/${slug}`);
      expect(urls).toContain(`https://aurumdiary.com/fr/guides/${slug}`);
    }
  });
});

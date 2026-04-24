import { describe, expect, it } from "vitest";
import { buildLanguageAlternates } from "@/lib/seo";

describe("SEO language alternates", () => {
  it("publishes English, French, and x-default alternates", () => {
    expect(buildLanguageAlternates("/guides/overthinking-at-night")).toEqual({
      en: "https://aurumdiary.com/guides/overthinking-at-night",
      fr: "https://aurumdiary.com/fr/guides/overthinking-at-night",
      "x-default": "https://aurumdiary.com/guides/overthinking-at-night",
    });
  });
});

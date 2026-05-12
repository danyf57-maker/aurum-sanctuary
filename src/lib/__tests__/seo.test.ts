import { describe, expect, it } from "vitest";
import { buildLanguageAlternates } from "@/lib/seo";

describe("SEO language alternates", () => {
  it("publishes French and x-default alternates only", () => {
    expect(buildLanguageAlternates("/guides/overthinking-at-night")).toEqual({
      fr: "https://aurumdiary.com/fr/guides/overthinking-at-night",
      "x-default": "https://aurumdiary.com/fr/guides/overthinking-at-night",
    });
  });
});

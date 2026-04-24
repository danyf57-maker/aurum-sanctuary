import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("guide structured data", () => {
  it("publishes FAQPage and HowTo schema for guide pages", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/guides/[slug]/page.tsx"),
      "utf8"
    );

    expect(source).toContain('"@type": "FAQPage"');
    expect(source).toContain('"@type": "HowTo"');
  });

  it("keeps the final guide CTA visually framed", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/guides/[slug]/page.tsx"),
      "utf8"
    );

    expect(source).not.toContain('<Button asChild variant="ghost" size="lg">');
  });
});

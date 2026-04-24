import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("legacy legal redirects", () => {
  it("permanently redirects obsolete legal URLs to canonical legal pages", () => {
    const configSource = readFileSync(
      join(process.cwd(), "next.config.js"),
      "utf8"
    );

    expect(configSource).toContain("source: '/legal/terms'");
    expect(configSource).toContain("destination: '/terms'");
    expect(configSource).toContain("source: '/legal/privacy'");
    expect(configSource).toContain("destination: '/privacy'");
    expect(configSource).toContain("permanent: true");
  });
});

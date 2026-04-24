import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const publicAurumCopyFiles = [
  "messages/en.json",
  "messages/fr.json",
  "src/app/manifeste/page.tsx",
  "src/app/methodologie/page.tsx",
  "src/app/privacy/page.tsx",
  "src/app/terms/page.tsx",
];

describe("public Aurum copy", () => {
  it("does not expose AI/IA terminology in marketing and legal copy", () => {
    const combinedCopy = publicAurumCopyFiles
      .map((file) => readFileSync(join(process.cwd(), file), "utf8"))
      .join("\n");

    expect(combinedCopy).not.toMatch(/\bAI\b|\bIA\b|AI-assisted|AI-powered|assistée par IA/);
  });
});

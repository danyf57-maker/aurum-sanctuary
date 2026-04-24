import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("PremiumJournalForm draft hydration", () => {
  it("restores the URL initial draft only once so users can delete every character", () => {
    const source = readFileSync(
      join(process.cwd(), "src/components/sanctuary/premium-journal-form.tsx"),
      "utf8"
    );

    expect(source).toContain("const hasRestoredInitialDraftRef = useRef(false);");
    expect(source).toContain("if (hasRestoredInitialDraftRef.current) return;");
    expect(source).toContain("hasRestoredInitialDraftRef.current = true;");
    expect(source).toContain("setDraftContent(target.value);");
  });
});

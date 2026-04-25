import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("MagazineEntryEditor Aurum chat", () => {
  it("times out silent streams and keeps the optimistic user message visible", () => {
    const source = readFileSync(
      join(process.cwd(), "src/components/sanctuary/magazine-entry-editor.tsx"),
      "utf8"
    );

    expect(source).toContain("const AURUM_CHAT_IDLE_TIMEOUT_MS = 22000;");
    expect(source).toContain("controller.abort();");
    expect(source).toContain("Aurum prend plus de temps que prévu");
    expect(source).toContain("setQuestion(cleanQuestion);");
    expect(source).toContain("setPendingAurumTurn(null);");
  });

  it("uses the shared buffered SSE parser for entry-page chat replies", () => {
    const source = readFileSync(
      join(process.cwd(), "src/components/sanctuary/magazine-entry-editor.tsx"),
      "utf8"
    );

    expect(source).toContain("extractSseDataMessages");
    expect(source).toContain("flushSseDataMessages");
  });
});

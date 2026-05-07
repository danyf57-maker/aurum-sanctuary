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

  it("removes partial Aurum turns when the stream reports an error", () => {
    const source = readFileSync(
      join(process.cwd(), "src/components/sanctuary/premium-journal-form.tsx"),
      "utf8"
    );

    expect(source).toContain("if (data.error) {");
    expect(source).toContain("throw new Error(data.error);");
    expect(source).toContain("setConversationTurns((prev) => prev.filter((turn) => turn.id !== aurumTurnId));");
  });

  it("starts the first Aurum reflection automatically after a page is saved", () => {
    const source = readFileSync(
      join(process.cwd(), "src/components/sanctuary/premium-journal-form.tsx"),
      "utf8"
    );

    expect(source).toContain("void handleRequestReflection({ content, entryId: result.entryId || null });");
    expect(source).toContain("const reflectionContent = override?.content ?? savedContent;");
    expect(source).toContain("const reflectionEntryId = override?.entryId ?? savedEntryId;");
  });

  it("allows the first reflection more time than chat follow-ups before aborting", () => {
    const source = readFileSync(
      join(process.cwd(), "src/components/sanctuary/premium-journal-form.tsx"),
      "utf8"
    );

    expect(source).toContain("const REFLECTION_IDLE_TIMEOUT_MS = 65000;");
    expect(source).toContain("const CONVERSATION_IDLE_TIMEOUT_MS = 40000;");
    expect(source).toContain("options?.userMessage ? CONVERSATION_IDLE_TIMEOUT_MS : REFLECTION_IDLE_TIMEOUT_MS");
  });
});

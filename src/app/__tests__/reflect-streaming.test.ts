import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("reflection streaming safeguards", () => {
  it("does not mark interrupted upstream streams as completed replies", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/api/reflect/route.ts"),
      "utf8"
    );

    expect(source).toContain("let upstreamCompleted = false;");
    expect(source).toContain("upstreamCompleted = true;");
    expect(source).toContain("DeepSeek reflection stream ended incomplete");
    expect(source).toContain("Aurum's reply was interrupted");
    expect(source).toContain("return;");
  });

  it("allows longer upstream time for the first deep reflection than for chat follow-ups", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/api/reflect/route.ts"),
      "utf8"
    );

    expect(source).toContain("const REFLECTION_UPSTREAM_TIMEOUT_MS = 70000;");
    expect(source).toContain("const CONVERSATION_UPSTREAM_TIMEOUT_MS = 30000;");
    expect(source).toContain("const upstreamTimeoutMs = isConversationFollowUp");
  });

  it("keeps follow-up replies fast by skipping the pattern prepass", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/api/reflect/route.ts"),
      "utf8"
    );

    expect(source).toContain("const skipPatternPrepass = isConversationFollowUp;");
    expect(source).toContain("skipPatternPrepass ? Promise.resolve(null) : detectPatterns(content)");
    expect(source).toContain("skipPatternPrepass ? Promise.resolve([]) : getUserPatterns(userId)");
    expect(source).toContain("isConversationFollowUp ? 520 : 1000");
  });

  it("persists the user follow-up before waiting for the model stream", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/api/reflect/route.ts"),
      "utf8"
    );

    expect(source).toContain("let persistedUserMessage = false;");
    expect(source).toContain("Failed to persist user follow-up before reflection");
    expect(source).toContain("normalizedUserMessage && !persistedUserMessage");
  });
});

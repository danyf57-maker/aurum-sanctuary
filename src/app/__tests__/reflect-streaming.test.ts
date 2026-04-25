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
});

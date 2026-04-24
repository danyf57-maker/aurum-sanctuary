import { describe, expect, it, vi } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();

function readSourceFiles(directory: string): string {
  return readdirSync(directory)
    .flatMap((entry) => {
      const pathname = join(directory, entry);
      const stat = statSync(pathname);
      if (stat.isDirectory() && entry === "__tests__") return [];
      if (stat.isDirectory()) return readSourceFiles(pathname);
      if (!/\.(ts|tsx)$/.test(entry)) return [];
      return readFileSync(pathname, "utf8");
    })
    .join("\n");
}

describe("DeepSeek model configuration", () => {
  it("uses explicit DeepSeek V4 model identifiers by default", async () => {
    vi.resetModules();
    vi.stubEnv("DEEPSEEK_MODEL", "");
    vi.stubEnv("DEEPSEEK_FAST_MODEL", "");
    const { AI_FAST_MODEL, AI_MODEL } = await import("@/lib/ai/models");

    expect(AI_MODEL).toBe("deepseek-v4-pro");
    expect(AI_FAST_MODEL).toBe("deepseek-v4-flash");
    vi.unstubAllEnvs();
  });

  it("does not hardcode deprecated DeepSeek chat aliases in application sources", () => {
    const sources = [
      "src",
      "functions/src",
    ];

    for (const source of sources) {
      const output = readSourceFiles(join(repoRoot, source));
      expect(output).not.toContain("deepseek-chat");
      expect(output).not.toContain("deepseek-reasoner");
    }
  });
});

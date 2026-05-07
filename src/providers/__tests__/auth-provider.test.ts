import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("AuthProvider legal acceptance flow", () => {
  it("persists the signup terms checkbox so the modal does not reappear after verification", () => {
    const source = readFileSync(
      join(process.cwd(), "src/providers/auth-provider.tsx"),
      "utf8"
    );

    expect(source).toContain("termsAccepted: true");
    expect(source).toContain("aurum-signup-terms-email");
    expect(source).toContain("shouldRestoreSignupTerms");
    expect(source).toContain("window.localStorage.removeItem('aurum-signup-terms-email');");
  });
});

import { describe, expect, it } from "vitest";
import {
  extractFirstNameFromEmail,
  resolveFirstName,
  resolveOptionalFirstName,
} from "../first-name";

describe("first-name resolution", () => {
  it("does not persist an email local-part as a first name", () => {
    expect(resolveOptionalFirstName({ email: "d0ec5xckqm@bltiwd.com" })).toBeNull();
  });

  it("uses the explicit profile name before display fallbacks", () => {
    expect(
      resolveOptionalFirstName({
        firstName: "Beta Testeur",
        displayName: "d0ec5xckqm",
        email: "d0ec5xckqm@bltiwd.com",
      })
    ).toBe("Beta Testeur");
  });

  it("uses a human fallback instead of a disposable email local-part", () => {
    expect(resolveFirstName({ email: "d0ec5xckqm@bltiwd.com", fallback: "toi" })).toBe("toi");
  });

  it("keeps email local-part extraction isolated for legacy migrations", () => {
    expect(extractFirstNameFromEmail("daniel.fioriti@example.com")).toBe("daniel");
  });
});

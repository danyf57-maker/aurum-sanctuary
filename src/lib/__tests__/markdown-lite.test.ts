import { describe, expect, it } from "vitest";
import { parseMarkdownLiteInline } from "../markdown-lite";

describe("markdown-lite parser", () => {
  it("parses bold emphasis without exposing literal markdown markers", () => {
    expect(parseMarkdownLiteInline("**La séquence probable** commence ici")).toEqual([
      { text: "La séquence probable", bold: true },
      { text: " commence ici", bold: false },
    ]);
  });

  it("keeps unmatched markers as text", () => {
    expect(parseMarkdownLiteInline("Un **début sans fin")).toEqual([
      { text: "Un **début sans fin", bold: false },
    ]);
  });
});

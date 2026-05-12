import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { middleware } from "@/middleware";

function runMiddleware(path: string) {
  return middleware(new NextRequest(`https://aurumdiary.com${path}`));
}

describe("French-only routing", () => {
  it("redirects obsolete English URLs to their French route", () => {
    const response = runMiddleware("/en/guides/private-journal-app");

    expect(response.headers.get("location")).toBe(
      "https://aurumdiary.com/fr/guides/private-journal-app"
    );
    expect(response.cookies.get("aurum-locale")?.value).toBe("fr");
  });

  it("redirects unprefixed product pages to French", () => {
    const response = runMiddleware("/pricing");

    expect(response.headers.get("location")).toBe("https://aurumdiary.com/fr/pricing");
    expect(response.cookies.get("aurum-locale")?.value).toBe("fr");
  });

  it("does not redirect public files", () => {
    const response = runMiddleware("/manifest.json");

    expect(response.headers.get("location")).toBeNull();
  });
});

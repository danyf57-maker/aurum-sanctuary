import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function readSource(file: string) {
  return readFileSync(join(process.cwd(), file), "utf8");
}

describe("subscription conversion regressions", () => {
  it("keeps the selected plan through signup and login", () => {
    const pricing = readSource("src/app/pricing/page.tsx");
    const signup = readSource("src/app/signup/page.tsx");
    const login = readSource("src/app/login/page.tsx");

    expect(pricing).toContain("/pricing?checkout=${planKey}");
    expect(pricing).toContain("/signup?redirect=${encodeURIComponent(returnPath)}");
    expect(pricing).toContain("currentUrl.searchParams.get('checkout')");
    expect(signup).toContain("/login?redirect=${encodeURIComponent(redirectAfterGoogle)}");
    expect(login).toContain("/signup?redirect=${encodeURIComponent(redirectUrl)}");
  });

  it("records one server-side checkout start after Stripe creates the session", () => {
    const checkoutRoute = readSource("src/app/api/stripe/create-checkout-session/route.ts");
    const webhook = readSource("src/app/api/stripe/webhook/route.ts");
    const pricing = readSource("src/app/pricing/page.tsx");

    expect(checkoutRoute).toContain("await trackServerEvent('checkout_start'");
    expect(checkoutRoute).not.toContain("requestedPriceId");
    expect(checkoutRoute).toContain("const selectedPriceId = planPriceIds[selectedPlan]");
    expect(checkoutRoute.indexOf("stripe.checkout.sessions.create")).toBeLessThan(
      checkoutRoute.indexOf("await trackServerEvent('checkout_start'")
    );
    expect(webhook).not.toContain("trackServerEvent('checkout_start'");
    expect(pricing).not.toContain('name: "checkout_start"');
  });

  it("keeps public conversion copy non-clinical", () => {
    const files = [
      "messages/fr.json",
      "messages/en.json",
      "src/app/pricing/layout.tsx",
      "src/app/verify-email/verify-email-client.tsx",
      "src/app/manifeste/page.tsx",
      "src/app/guides/page.tsx",
      "src/app/actions.ts",
      "src/app/(app)/settings/page.tsx",
      "src/components/dashboard/last-insight-card.tsx",
    ];
    const copy = files.map(readSource).join("\n");

    expect(copy).not.toMatch(
      /lecture psychologique|psychological reflection|psychological reading|psychologique profonde|deep psychological/i
    );
  });
});

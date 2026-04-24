import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const dynamicAnalyticsRoutes = [
  "src/app/api/admin/analytics/route.ts",
  "src/app/api/admin/analytics/email-funnel/route.ts",
  "src/app/api/admin/analytics/reminder-funnel/route.ts",
  "src/app/api/admin/analytics/revenue-summary/route.ts",
];

describe("admin analytics routes", () => {
  it("declares request-bound analytics endpoints as dynamic", () => {
    for (const routePath of dynamicAnalyticsRoutes) {
      const source = readFileSync(join(process.cwd(), routePath), "utf8");

      expect(source).toContain('export const dynamic = "force-dynamic";');
    }
  });
});

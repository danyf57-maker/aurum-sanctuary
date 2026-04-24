import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function read(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

function readMessages(locale: "fr" | "en") {
  return JSON.parse(read(`messages/${locale}.json`)) as Record<string, Record<string, unknown>>;
}

describe("beta report regressions", () => {
  it("keeps app-critical client i18n namespaces available across client navigations", () => {
    const layoutSource = read("src/app/layout.tsx");

    for (const namespace of [
      "login",
      "settings",
      "accountData",
      "sanctuary",
      "writePage",
      "entryForm",
    ]) {
      expect(layoutSource).toMatch(new RegExp(`['"]${namespace}['"]`));
    }
  });

  it("does not link public footer visitors to a removed sanctuary chat route", () => {
    const footerSource = read("src/components/layout/footer.tsx");

    expect(footerSource).not.toContain("/sanctuary/chat");
    expect(footerSource).toContain("/sanctuary/write");
  });

  it("uses existing nav helper translation keys in the mobile menu", () => {
    const mobileNavSource = read("src/components/layout/mobile-nav.tsx");
    const frNav = readMessages("fr").nav;
    const enNav = readMessages("en").nav;

    for (const key of ["writeDesc", "journalDesc", "settingsDesc"]) {
      expect(mobileNavSource).toContain(`helperKey: '${key}'`);
      expect(frNav).toHaveProperty(key);
      expect(enNav).toHaveProperty(key);
    }

    for (const missingKey of ["newPage", "yourEntries", "accountData"]) {
      expect(mobileNavSource).not.toContain(`helperKey: '${missingKey}'`);
    }
  });

  it("keeps French reminder copy accented", () => {
    const reminderSource = read("src/lib/reminders/writing-reminders.ts");
    const functionsReminderSource = read("functions/src/sendWritingReminders.ts");

    expect(reminderSource).toContain("revenir à toi");
    expect(reminderSource).toContain("écris quelques lignes privées");
    expect(functionsReminderSource).toContain("réflexion privé");
    expect(functionsReminderSource).toContain("aidera à voir");
  });
});

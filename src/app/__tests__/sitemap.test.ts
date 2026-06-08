import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";

describe("sitemap", () => {
  it("includes the scientific references pages linked from the homepage", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls).toContain("https://aurumdiary.com/fr/etudes-scientifiques");
    expect(urls).toContain("https://aurumdiary.com/fr/contact");
    expect(urls).not.toContain("https://aurumdiary.com/etudes-scientifiques");
    expect(urls).not.toContain("https://aurumdiary.com/contact");
  });

  it("includes the new organic growth guides in French only", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);

    for (const slug of [
      "private-journal-app",
      "emotional-clarity-journal",
      "mental-load-journaling",
      "how-to-stop-rumination",
      "journaling-for-overthinking",
      "journal-prompts-for-anxiety",
      "pensees-recurrentes",
      "prompts-pensees-recurrentes",
      "conversation-qui-revient",
      "meilleure-application-journal-pensees-recurrentes",
      "journal-guide-charge-mentale",
      "private-diary-vs-notes-app",
      "rosebud-alternative",
    ]) {
      expect(urls).toContain(`https://aurumdiary.com/fr/guides/${slug}`);
      expect(urls).not.toContain(`https://aurumdiary.com/guides/${slug}`);
    }
  });

  it("includes the science of writing guides in French only", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);

    for (const slug of [
      "journaling-scientifique",
      "bienfaits-ecriture-expressive",
      "comment-vider-sa-tete-quand-on-a-trop-de-choses-en-tete",
      "comment-ecrire-ce-que-je-ressens",
      "ecriture-et-clarte-mentale",
      "journaling-et-rumination",
      "ecriture-manuscrite-ou-clavier",
      "journal-intime-et-emotions",
      "prompts-ecriture-expressive",
      "ecriture-et-recits-personnels",
    ]) {
      expect(urls).toContain(`https://aurumdiary.com/fr/guides/${slug}`);
      expect(urls).not.toContain(`https://aurumdiary.com/guides/${slug}`);
    }
  });
});

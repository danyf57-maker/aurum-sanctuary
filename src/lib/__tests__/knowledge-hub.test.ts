import { describe, expect, it } from "vitest";
import { getKnowledgeHubTopic } from "@/lib/knowledge-hub";

const prioritySlugs = [
  "overthinking-at-night",
  "journaling-prompts-for-clarity",
  "charge-mentale",
] as const;

const growthSlugs = [
  "private-journal-app",
  "emotional-clarity-journal",
  "mental-load-journaling",
  "how-to-stop-rumination",
  "journaling-for-overthinking",
  "journal-prompts-for-anxiety",
  "private-diary-vs-notes-app",
  "rosebud-alternative",
] as const;

function guideWordCount(slug: string, locale: "en" | "fr") {
  const topic = getKnowledgeHubTopic(slug, locale);
  if (!topic) return 0;

  return [
    topic.title,
    topic.question,
    topic.shortAnswer,
    ...topic.deepDive,
    ...(topic.practicalSteps ?? []),
    ...(topic.example ?? []),
    ...(topic.howAurumHelps ?? []),
  ]
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

describe("priority guide content depth", () => {
  it.each(prioritySlugs)("%s has substantial English and French content", (slug) => {
    expect(guideWordCount(slug, "en")).toBeGreaterThanOrEqual(700);
    expect(guideWordCount(slug, "fr")).toBeGreaterThanOrEqual(700);
  });

  it.each(growthSlugs)("%s exists with useful bilingual launch content", (slug) => {
    expect(guideWordCount(slug, "en")).toBeGreaterThanOrEqual(250);
    expect(guideWordCount(slug, "fr")).toBeGreaterThanOrEqual(250);
  });
});

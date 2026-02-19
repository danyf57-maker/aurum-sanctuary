import type { Metadata } from "next";
import Link from "next/link";
import { knowledgeHubTopics } from "@/lib/knowledge-hub";

export const metadata: Metadata = {
  title: "Knowledge Hub | Clarté mentale, introspection et journal guidé",
  description:
    "Ressources Aurum en format question-réponse: charge mentale, introspection, confidentialité mentale et routine de 5 minutes.",
  alternates: {
    canonical: "https://aurumdiary.com/guides",
  },
};

export default function GuidesPage() {
  return (
    <div className="bg-stone-50/50 min-h-screen">
      <section className="py-24 md:py-32">
        <div className="container max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight mb-6">
            Aurum Knowledge Hub
          </h1>
          <p className="text-lg text-muted-foreground mb-10">
            Réponses claires et concrètes pour mieux comprendre ce que tu ressens.
          </p>

          <div className="grid gap-4">
            {knowledgeHubTopics.map((topic) => (
              <Link
                key={topic.slug}
                href={`/guides/${topic.slug}`}
                className="rounded-2xl border border-stone-200 bg-white p-6 transition-colors hover:bg-stone-100"
              >
                <h2 className="text-xl font-headline mb-2">{topic.title}</h2>
                <p className="text-muted-foreground">{topic.question}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

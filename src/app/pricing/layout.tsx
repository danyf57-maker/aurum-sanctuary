import type { Metadata } from "next";
import { getRequestLocale } from "@/lib/locale-server";
import { buildAlternates, openGraphLocale } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const title = isFr ? "Tarifs Aurum" : "Aurum Pricing";
  const description = isFr
    ? "Compare les offres Aurum pour une réflexion privée guidée, plus de clarté émotionnelle et une lecture des motifs dans le temps."
    : "Compare Aurum plans for private AI-guided reflection, emotional clarity, and recurring pattern discovery.";
  const alternates = buildAlternates("/pricing", locale);

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      type: "website",
      locale: openGraphLocale(locale),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

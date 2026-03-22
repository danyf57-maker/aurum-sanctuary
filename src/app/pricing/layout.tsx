import type { Metadata } from "next";
import { getRequestLocale } from "@/lib/locale-server";
import { buildAlternates, openGraphLocale } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const title = isFr ? "Tarifs Aurum" : "Aurum Pricing";
  const description = isFr
    ? "Compare les offres Aurum pour une écriture privée, une lecture psychologique profonde, et des motifs intérieurs plus lisibles."
    : "Compare Aurum plans for private writing, deep psychological reflection, and clearer inner patterns.";
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

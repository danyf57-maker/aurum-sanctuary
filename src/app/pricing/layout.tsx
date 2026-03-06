import type { Metadata } from "next";
import { getRequestLocale } from "@/lib/locale-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const title = isFr ? "Tarifs Aurum" : "Aurum Pricing";
  const description = isFr
    ? "Compare les offres Aurum et choisis le plan qui correspond à ton rythme d'introspection."
    : "Compare Aurum plans and choose the one that matches your reflection rhythm.";
  const canonical = "https://aurumdiary.com/pricing";

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      locale: isFr ? "fr_FR" : "en_US",
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

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "Compare les offres Aurum et choisis le plan qui correspond à ton rythme d'introspection.",
  alternates: {
    canonical: "https://aurumdiary.com/pricing",
  },
  openGraph: {
    title: "Tarifs Aurum",
    description:
      "Compare les offres Aurum et choisis le plan qui correspond à ton rythme d'introspection.",
    url: "https://aurumdiary.com/pricing",
    type: "website",
    locale: "fr_FR",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

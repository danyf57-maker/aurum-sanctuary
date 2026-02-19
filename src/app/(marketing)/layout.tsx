import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Aurum Sanctuary",
    description:
        "Un espace privé pour écrire, comprendre ce que tu ressens et retrouver de la clarté mentale rapidement.",
    alternates: {
        canonical: "https://aurumdiary.com/",
    },
    openGraph: {
        title: "Aurum Sanctuary",
        description:
            "Un espace privé pour écrire, comprendre ce que tu ressens et retrouver de la clarté mentale rapidement.",
        url: "https://aurumdiary.com/",
        siteName: "Aurum",
        type: "website",
        locale: "fr_FR",
    },
    twitter: {
        card: "summary_large_image",
        title: "Aurum Sanctuary",
        description:
            "Un espace privé pour écrire, comprendre ce que tu ressens et retrouver de la clarté mentale rapidement.",
    },
};

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}

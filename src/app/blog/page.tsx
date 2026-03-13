
import type { Metadata } from "next";
import { BlogCard } from "@/components/blog/blog-card";
import type { PublicPost } from "@/lib/types";
import { getRequestLocale } from "@/lib/locale-server";
import { buildAlternates, openGraphLocale, schemaLanguage } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRequestLocale();
    const isFr = locale === "fr";
    const alternates = buildAlternates("/blog", locale);
    const title = isFr
        ? "Journal Aurum | Réflexion privée, clarté émotionnelle et motifs récurrents"
        : "Aurum Journal | Private reflection, emotional clarity, and recurring patterns";
    const description = isFr
        ? "Articles et réflexions sur l'écriture privée, la clarté émotionnelle et les motifs intérieurs qui émergent dans le temps."
        : "Essays on private reflection, emotional clarity, and the recurring patterns that become visible over time.";

    return {
        title,
        description,
        alternates,
        openGraph: {
            title,
            description,
            url: alternates.canonical,
            siteName: "Aurum Diary",
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

export default async function BlogPage() {
    const locale = await getRequestLocale();
    const isFr = locale === "fr";
    let posts: PublicPost[] = [];
    try {
        const hasFirebaseWebConfig = Boolean(
            process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
            process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
            process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        );
        if (hasFirebaseWebConfig) {
            const { getPublicPosts } = await import('@/lib/firebase/firestore');
            posts = await getPublicPosts();
        }
    } catch (error) {
        console.warn('Failed to fetch blog posts:', error);
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: isFr ? "Le Journal d'Alma" : "Alma's Journal",
        description: isFr
            ? "Textes sur l'écriture privée, la clarté émotionnelle et les motifs intérieurs qui se révèlent au fil du temps."
            : "Essays on private writing, emotional clarity, and recurring inner patterns over time.",
        url: buildAlternates("/blog", locale).canonical,
        inLanguage: schemaLanguage(locale),
        publisher: {
            "@type": "Organization",
            name: "Aurum Diary",
        },
    };

    return (
        <div className="bg-stone-50/50">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <section className="py-24 md:py-32">
                <div className="container max-w-4xl mx-auto text-center animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">
                        {isFr ? "Le Journal d'Alma" : "Alma's Journal"}
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        {isFr
                            ? "Textes sur l'écriture privée, la clarté émotionnelle et les motifs intérieurs qui se révèlent au fil du temps."
                            : "Essays on private writing, emotional clarity, and the patterns that keep resurfacing over time."}
                    </p>
                </div>
            </section>

            <section className="pb-24 md:pb-32">
                <div className="container max-w-7xl mx-auto">
                    {posts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map(post => (
                                <BlogCard key={post.id} post={post} locale={locale} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed rounded-lg flex flex-col items-center">
                            <h3 className="text-xl font-semibold">
                                {isFr ? "Le silence règne encore." : "The journal is still quiet."}
                            </h3>
                            <p className="text-muted-foreground mt-2">
                                {isFr
                                    ? "Alma n'a pas encore partagé ses pensées. Revenez bientôt pour découvrir son voyage intérieur."
                                    : "Alma has not shared new reflections yet. Come back soon to read the next one."}
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

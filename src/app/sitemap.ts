
import { MetadataRoute } from 'next';
import { knowledgeHubTopics } from '@/lib/knowledge-hub';
import type { Locale } from '@/lib/locale';
import { absoluteUrl, buildLanguageAlternates } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();
    const localizedRoutes = [
        { route: '', priority: 1, changeFrequency: 'weekly' as const },
        { route: '/blog', priority: 0.9, changeFrequency: 'weekly' as const },
        { route: '/guides', priority: 0.8, changeFrequency: 'weekly' as const },
        { route: '/pricing', priority: 0.8, changeFrequency: 'weekly' as const },
        { route: '/manifeste', priority: 0.6, changeFrequency: 'monthly' as const },
        { route: '/auteur', priority: 0.5, changeFrequency: 'monthly' as const },
        { route: '/methodologie', priority: 0.6, changeFrequency: 'monthly' as const },
        { route: '/privacy', priority: 0.4, changeFrequency: 'monthly' as const },
        { route: '/terms', priority: 0.4, changeFrequency: 'monthly' as const },
    ];

    const buildLocalizedEntries = (
        route: string,
        priority: number,
        changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
        lastModified: Date | string = now
    ): MetadataRoute.Sitemap =>
        (["en", "fr"] as const).map((locale: Locale) => ({
            url: absoluteUrl(route || "/", locale),
            lastModified,
            changeFrequency,
            priority,
            alternates: {
                languages: buildLanguageAlternates(route || "/"),
            },
        }));

    const staticRoutes = localizedRoutes.flatMap(({ route, priority, changeFrequency }) =>
        buildLocalizedEntries(route || "/", priority, changeFrequency)
    );

    let blogRoutes: MetadataRoute.Sitemap = [];
    try {
        const hasFirebaseWebConfig = Boolean(
            process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
            process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
            process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        );

        if (hasFirebaseWebConfig) {
            const { getPublicPosts } = await import('@/lib/firebase/firestore');
            const posts = await getPublicPosts();
            blogRoutes = posts.flatMap((post) =>
                post.slug
                    ? buildLocalizedEntries(`/blog/${post.slug}`, 0.7, 'monthly', post.publishedAt ?? now)
                    : []
            );
        }
    } catch {
        blogRoutes = [];
    }

    const knowledgeHubRoutes: MetadataRoute.Sitemap = knowledgeHubTopics.flatMap((topic) =>
        buildLocalizedEntries(`/guides/${topic.slug}`, 0.7, 'monthly')
    );

    return [...staticRoutes, ...knowledgeHubRoutes, ...blogRoutes];
}

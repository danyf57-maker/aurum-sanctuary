
import { MetadataRoute } from 'next';
import { getPublicPosts } from '@/lib/firebase/firestore';
import { knowledgeHubTopics } from '@/lib/knowledge-hub';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://aurumdiary.com';

    // Strategic static routes (exclude auth pages)
    const staticRoutes = [
        { route: '', priority: 1, changeFrequency: 'weekly' as const },
        { route: '/blog', priority: 0.9, changeFrequency: 'weekly' as const },
        { route: '/guides', priority: 0.8, changeFrequency: 'weekly' as const },
        { route: '/manifeste', priority: 0.7, changeFrequency: 'monthly' as const },
        { route: '/auteur', priority: 0.6, changeFrequency: 'monthly' as const },
        { route: '/methodologie', priority: 0.7, changeFrequency: 'monthly' as const },
        { route: '/legal/privacy', priority: 0.5, changeFrequency: 'monthly' as const },
        { route: '/legal/terms', priority: 0.5, changeFrequency: 'monthly' as const },
        { route: '/privacy', priority: 0.4, changeFrequency: 'monthly' as const },
        { route: '/terms', priority: 0.4, changeFrequency: 'monthly' as const },
    ].map(({ route, priority, changeFrequency }) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency,
        priority,
    }));

    let blogRoutes: MetadataRoute.Sitemap = [];
    try {
        const posts = await getPublicPosts();
        blogRoutes = posts
            .filter((post) => Boolean(post.slug))
            .map((post) => ({
                url: `${baseUrl}/blog/${post.slug}`,
                lastModified: post.publishedAt ?? new Date(),
                changeFrequency: 'monthly' as const,
                priority: 0.7,
            }));
    } catch {
        blogRoutes = [];
    }

    const knowledgeHubRoutes: MetadataRoute.Sitemap = knowledgeHubTopics.map((topic) => ({
        url: `${baseUrl}/guides/${topic.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }));

    return [...staticRoutes, ...knowledgeHubRoutes, ...blogRoutes];
}

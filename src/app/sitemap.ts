
import { MetadataRoute } from 'next';
import { getPublicPosts } from '@/lib/firebase/firestore';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://aurum-sanctuary.vercel.app';

    // Static routes
    const routes = [
        '',
        '/blog',
        '/login',
        '/signup',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic blog posts
    const posts = await getPublicPosts();
    const postRoutes = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.publishedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }));

    return [...routes, ...postRoutes];
}

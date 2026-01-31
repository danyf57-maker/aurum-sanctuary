
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/sanctuary/', '/api/'], // Private routes
        },
        sitemap: 'https://aurum-sanctuary.vercel.app/sitemap.xml',
    };
}

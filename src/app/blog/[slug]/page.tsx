
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPublicPostBySlug } from '@/lib/firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Compass } from 'lucide-react';

export const revalidate = 3600; // Revalidate every hour

type BlogArticlePageProps = {
    params: {
        slug: string;
    }
}

function calculateReadingTime(text: string): number {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
}

export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
    const post = await getPublicPostBySlug(params.slug);

    if (!post) {
        return {
            title: 'Article introuvable | Aurum',
            description: 'L\'article que vous cherchez n\'existe pas.',
        };
    }

    const excerpt = post.content.substring(0, 160).replace(/\n/g, ' ') + '...';
    const publishedTime = post.publishedAt.toISOString();

    return {
        title: `${post.title} | Aurum Journal`,
        description: excerpt,
        openGraph: {
            title: post.title,
            description: excerpt,
            url: `https://aurum-sanctuary.vercel.app/blog/${params.slug}`,
            type: 'article',
            publishedTime: publishedTime,
            authors: ['Alma'],
            tags: post.tags,
            images: [
                {
                    url: '/og-image.png',
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: excerpt,
            images: ['/og-image.png'],
        },
    };
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
    const post = await getPublicPostBySlug(params.slug);

    if (!post) {
        notFound();
    }

    const formattedDate = new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'full',
    }).format(new Date(post.publishedAt));

    const readingTime = calculateReadingTime(post.content);

    return (
        <article className="bg-stone-50/50 min-h-screen">
            <div className="container max-w-4xl mx-auto py-20 md:py-28 animate-fade-in">
                <header className="mb-12">
                    <Button asChild variant="ghost" className="mb-8">
                        <Link href="/blog">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour au blog
                        </Link>
                    </Button>
                    <h1 className="text-4xl md:text-5xl font-bold font-headline leading-tight tracking-tight mb-4">
                        {post.title}
                    </h1>
                    <div className="text-muted-foreground flex items-center gap-4">
                        <p>{formattedDate}</p>
                        <span className="h-1 w-1 rounded-full bg-muted-foreground"></span>
                        <p>{readingTime} min de lecture</p>
                    </div>
                </header>

                <div
                    className="prose prose-lg prose-stone lg:prose-xl font-body leading-relaxed prose-headings:font-headline"
                    dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
                />

                <footer className="mt-16 pt-8 border-t space-y-12">
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="font-normal capitalize">{tag}</Badge>
                        ))}
                    </div>
                    <div className="text-center bg-amber-50/50 rounded-lg p-8">
                        <Compass className="mx-auto h-8 w-8 text-amber-500 mb-4" />
                        <p className="text-stone-600 italic">Alma partage son journal pour inspirer votre propre voyage intérieur.</p>
                        <Button asChild className="mt-6">
                            <Link href="/">Créez votre sanctuaire privé</Link>
                        </Button>
                    </div>
                </footer>
            </div>
        </article>
    );
}

// Ensure prose styles are available. We need to update tailwind config for this.
// I will also add the official tailwind typography plugin.

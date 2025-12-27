
import Link from 'next/link';
import { getPublicPosts } from '@/lib/firebase/firestore';
import { PublicPost } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

function BlogCard({ post }: { post: PublicPost }) {
    const formattedDate = new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'long',
    }).format(new Date(post.publishedAt));

    const excerpt = post.content.substring(0, 200) + (post.content.length > 200 ? '...' : '');

    return (
        <Card className="flex flex-col transition-all hover:shadow-lg hover:-translate-y-1 bg-card/50">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">{formattedDate}</p>
                    <Badge variant="outline" className="border-primary text-primary">Journal d'Alma</Badge>
                </div>
                <h3 className="text-2xl font-headline font-semibold pt-2">
                    <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                        {post.title}
                    </Link>
                </h3>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-foreground/80 leading-relaxed">{excerpt}</p>
            </CardContent>
            <div className="p-6 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="font-normal capitalize">{tag}</Badge>
                    ))}
                </div>
                 <Link href={`/blog/${post.slug}`} className="flex items-center text-sm font-semibold text-primary hover:underline">
                    Lire la suite <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
            </div>
        </Card>
    );
}

export default async function BlogPage() {
    const posts = await getPublicPosts();

    return (
        <div className="bg-stone-50/50">
            <section className="py-24 md:py-32">
                <div className="container max-w-4xl mx-auto text-center animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">Le Journal d'Alma</h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Pensées partagées depuis le sanctuaire. Un regard sur le cheminement intérieur, les réflexions et les découvertes faites au fil des mots.
                    </p>
                </div>
            </section>

            <section className="pb-24 md:pb-32">
                <div className="container max-w-7xl mx-auto">
                    {posts.length > 0 ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map(post => (
                                <BlogCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed rounded-lg flex flex-col items-center">
                            <h3 className="text-xl font-semibold">Le silence règne encore.</h3>
                            <p className="text-muted-foreground mt-2">Alma n'a pas encore partagé ses pensées. Revenez bientôt pour découvrir son voyage intérieur.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}


import Link from 'next/link';
import { getPublicPosts } from '@/lib/firebase/firestore';
import { BlogCard } from '@/components/blog/blog-card';

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

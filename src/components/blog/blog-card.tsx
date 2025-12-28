import Link from 'next/link';
import { PublicPost } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export function BlogCard({ post }: { post: PublicPost }) {
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

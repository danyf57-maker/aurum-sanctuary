import Link from 'next/link';
import type { Locale } from "@/lib/locale";
import { toLocalePath } from "@/i18n/routing";
import { PublicPost } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export function BlogCard({ post, locale }: { post: PublicPost; locale: Locale }) {
    const isFr = locale === "fr";
    const formattedDate = new Intl.DateTimeFormat(isFr ? 'fr-FR' : 'en-US', {
        dateStyle: 'long',
    }).format(new Date(post.publishedAt));

    const excerpt = post.content.substring(0, 200) + (post.content.length > 200 ? '...' : '');
    const postHref = toLocalePath(`/blog/${post.slug}`, locale);

    return (
        <Card className="flex flex-col transition-all hover:shadow-lg hover:-translate-y-1 bg-card/50">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">{formattedDate}</p>
                    <Badge variant="outline" className="border-primary text-primary">
                        {isFr ? "Journal d'Alma" : "Alma's Journal"}
                    </Badge>
                </div>
                <h3 className="text-2xl font-headline font-semibold pt-2">
                    <Link href={postHref} className="hover:text-primary transition-colors">
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
                 <Link href={postHref} className="flex items-center text-sm font-semibold text-primary hover:underline">
                    {isFr ? "Lire la suite" : "Read more"} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
            </div>
        </Card>
    );
}

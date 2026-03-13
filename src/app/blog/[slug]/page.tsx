import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Compass } from "lucide-react";
import { getRequestLocale } from "@/lib/locale-server";
import { toLocalePath } from "@/i18n/routing";
import { absoluteUrl, buildAlternates, openGraphLocale, schemaLanguage } from "@/lib/seo";

export const revalidate = 3600; // Revalidate every hour

type BlogArticlePageProps = {
  params: {
    slug: string;
  };
};

function calculateReadingTime(text: string): number {
  const safeText = text ?? "";
  const wordsPerMinute = 200;
  const wordCount = safeText.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function getPost(slug: string) {
  const hasFirebaseWebConfig = Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
  if (!hasFirebaseWebConfig) return null;
  const { getPublicPostBySlug } = await import("@/lib/firebase/firestore");
  return getPublicPostBySlug(slug);
}

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: isFr ? "Article introuvable | Aurum Diary" : "Article not found | Aurum Diary",
      description: isFr
        ? "L'article que vous cherchez n'existe pas."
        : "The article you are looking for does not exist.",
    };
  }

  const excerpt = `${post.content.substring(0, 160).replace(/\n/g, " ").trim()}${post.content.length > 160 ? "..." : ""}`;
  const publishedTime = post.publishedAt.toISOString();
  const alternates = buildAlternates(`/blog/${params.slug}`, locale);

  return {
    title: `${post.title} | Aurum Journal`,
    description: excerpt,
    alternates,
    openGraph: {
      title: post.title,
      description: excerpt,
      url: alternates.canonical,
      siteName: "Aurum Diary",
      type: "article",
      locale: openGraphLocale(locale),
      publishedTime: publishedTime,
      authors: ["Alma"],
      tags: post.tags,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: excerpt,
      images: ["/og-image.png"],
    },
  };
}

export default async function BlogArticlePage({
  params,
}: BlogArticlePageProps) {
  const locale = await getRequestLocale();
  const blogHref = toLocalePath("/blog", locale);
  const homeHref = toLocalePath("/", locale);
  const isFr = locale === "fr";
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  const formattedDate = new Intl.DateTimeFormat(isFr ? "fr-FR" : "en-US", {
    dateStyle: "full",
  }).format(new Date(post.publishedAt));

  const readingTime = calculateReadingTime(post.content);
  const postUrl = absoluteUrl(`/blog/${params.slug}`, locale);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.content.substring(0, 160).replace(/\n/g, " "),
      articleSection: isFr ? "Réflexion privée" : "Private reflection",
      keywords: post.tags?.join(", "),
      datePublished: post.publishedAt.toISOString(),
      dateModified: post.publishedAt.toISOString(),
      author: {
        "@type": "Person",
        name: "Alma",
      },
      publisher: {
        "@type": "Organization",
        name: "Aurum Diary",
        logo: {
          "@type": "ImageObject",
          url: "https://aurumdiary.com/og-image.png",
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": postUrl,
      },
      url: postUrl,
      image: "https://aurumdiary.com/og-image.png",
      inLanguage: schemaLanguage(locale),
      isPartOf: absoluteUrl("/blog", locale),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: isFr ? "Le Journal d'Alma" : "Alma's Journal",
          item: absoluteUrl("/blog", locale),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: post.title,
          item: postUrl,
        },
      ],
    },
  ];

  return (
    <article className="bg-stone-50/50 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container max-w-4xl mx-auto py-20 md:py-28 animate-fade-in">
        <header className="mb-12">
          <Button asChild variant="ghost" className="mb-8">
            <Link href={blogHref}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {isFr ? "Retour au journal" : "Back to the journal"}
            </Link>
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold font-headline leading-tight tracking-tight mb-4">
            {post.title}
          </h1>
          <div className="text-muted-foreground flex items-center gap-4">
            <p>{formattedDate}</p>
            <span className="h-1 w-1 rounded-full bg-muted-foreground"></span>
            <p>{isFr ? `${readingTime} min de lecture` : `${readingTime} min read`}</p>
          </div>
        </header>

        <div
          className="prose prose-lg prose-stone lg:prose-xl font-body leading-relaxed prose-headings:font-headline"
          dangerouslySetInnerHTML={{
            __html: escapeHtml(post.content).replace(/\n/g, "<br />"),
          }}
        />

        <footer className="mt-16 pt-8 border-t space-y-12">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="font-normal capitalize"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <div className="text-center bg-amber-50/50 rounded-lg p-8">
            <Compass className="mx-auto h-8 w-8 text-amber-500 mb-4" />
            <p className="text-stone-600 italic">
              {isFr
                ? "Alma partage son journal pour inspirer votre propre chemin intérieur."
                : "Alma shares this journal to spark your own private reflection."}
            </p>
            <Button asChild className="mt-6">
              <Link href={homeHref}>
                {isFr ? "Crée ton espace de réflexion" : "Create your reflection space"}
              </Link>
            </Button>
          </div>
        </footer>
      </div>
    </article>
  );
}

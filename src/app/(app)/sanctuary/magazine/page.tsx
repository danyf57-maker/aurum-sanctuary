import Link from "next/link";
import { db } from "@/lib/firebase/admin";
import { getAuthedUserId } from "@/app/actions/auth";
import { Timestamp } from "firebase-admin/firestore";
import { BookImage, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

type MagazineIssue = {
  id: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  createdAt?: Timestamp | null;
};

export const dynamic = "force-dynamic";

async function getMagazineIssuesForUser(userId: string): Promise<MagazineIssue[]> {
  try {
    const snap = await db
      .collection("users")
      .doc(userId)
      .collection("magazineIssues")
      .orderBy("createdAt", "desc")
      .limit(30)
      .get();

    const docs = Array.isArray((snap as any)?.docs) ? (snap as any).docs : [];

    return docs.map((doc: any) => {
      const data = doc.data() as Record<string, any>;
      return {
        id: doc.id,
        title: String(data.title || "Entrée"),
        excerpt: String(data.excerpt || ""),
        coverImageUrl: data.coverImageUrl ? String(data.coverImageUrl) : null,
        createdAt: data.createdAt || null,
      };
    });
  } catch (error) {
    // Keep the page usable in local/mock mode even if query operators are unavailable.
    return [];
  }
}

export default async function MagazinePage() {
  const userId = await getAuthedUserId();
  const issues = userId ? await getMagazineIssuesForUser(userId) : [];

  return (
    <div className="container max-w-7xl py-8 md:py-12">
      <header className="mb-10 space-y-2">
        <h1 className="font-headline text-4xl tracking-tight text-stone-900">Magazine</h1>
        <p className="text-stone-600">Tes pensées en vue éditoriale: image à la une, extrait, mémoire.</p>
      </header>

      {issues.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/60 p-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
            <BookImage className="h-6 w-6 text-stone-500" />
          </div>
          <p className="text-stone-700">Aucune édition pour l’instant.</p>
          <p className="mt-1 text-sm text-stone-500">Écris une entrée avec une image pour composer ton magazine.</p>
          <Button asChild className="mt-5 bg-stone-900 text-stone-50 hover:bg-stone-800">
            <Link href="/sanctuary/write">
              <PenSquare className="mr-2 h-4 w-4" />
              Écrire une entrée
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {issues.map((issue) => (
            <Link key={issue.id} href={`/sanctuary/magazine/${issue.id}`} className="group block">
              <article className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
                <div className="aspect-[16/10] w-full bg-stone-100">
                  {issue.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={issue.coverImageUrl} alt={issue.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-stone-400">
                      <BookImage className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-5">
                  <h2 className="line-clamp-2 font-headline text-2xl text-stone-900">{issue.title}</h2>
                  <p className="line-clamp-4 text-sm leading-relaxed text-stone-600">{issue.excerpt || "Sans extrait."}</p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

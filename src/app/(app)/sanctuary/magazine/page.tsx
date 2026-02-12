'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookImage, PenSquare } from 'lucide-react';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { useAuth } from '@/providers/auth-provider';
import { firestore as db } from '@/lib/firebase/web-client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type MagazineIssue = {
  id: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
};

export default function MagazinePage() {
  const { user, loading } = useAuth();
  const [issues, setIssues] = useState<MagazineIssue[]>([]);
  const [isLoadingIssues, setIsLoadingIssues] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadIssues = async () => {
      if (!user) {
        if (isMounted) {
          setIssues([]);
          setIsLoadingIssues(false);
        }
        return;
      }

      setIsLoadingIssues(true);
      try {
        const issuesRef = collection(db, 'users', user.uid, 'magazineIssues');
        const q = query(issuesRef, orderBy('createdAt', 'desc'), limit(30));
        const snap = await getDocs(q);

        if (!isMounted) return;
        const nextIssues: MagazineIssue[] = snap.docs.map((docSnap) => {
          const data = docSnap.data() as Record<string, unknown>;
          return {
            id: docSnap.id,
            title: String(data.title || 'Entrée'),
            excerpt: String(data.excerpt || ''),
            coverImageUrl: data.coverImageUrl ? String(data.coverImageUrl) : null,
          };
        });
        setIssues(nextIssues);
      } catch {
        if (isMounted) setIssues([]);
      } finally {
        if (isMounted) setIsLoadingIssues(false);
      }
    };

    void loadIssues();
    return () => {
      isMounted = false;
    };
  }, [user]);

  if (loading || isLoadingIssues) {
    return (
      <div className="container max-w-7xl py-8 md:py-12 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-[340px] rounded-3xl" />
          <Skeleton className="h-[340px] rounded-3xl" />
          <Skeleton className="h-[340px] rounded-3xl" />
        </div>
      </div>
    );
  }

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
                  {issue.excerpt && issue.excerpt !== issue.title && (
                    <p className="line-clamp-4 text-sm leading-relaxed text-stone-600">{issue.excerpt}</p>
                  )}
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

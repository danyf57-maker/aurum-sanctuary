'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore as db } from '@/lib/firebase/web-client';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MagazineEntryEditor } from '@/components/sanctuary/magazine-entry-editor';

type EntryImage = {
  id: string;
  url: string;
  caption?: string;
  name?: string;
};

type EntryDetails = {
  id: string;
  content: string;
  tags: string[];
  images: EntryImage[];
  readOnly: boolean;
};

function normalizeEntry(docId: string, data: Record<string, unknown>): EntryDetails {
  const hasPlainContent = typeof data.content === 'string';

  const rawImages = Array.isArray(data.images) ? data.images : [];
  const images: EntryImage[] = rawImages
    .filter((item: unknown) => item && typeof item === 'object' && typeof (item as any).url === 'string')
    .map((item: any) => ({
      id: String(item.id || Math.random().toString(36).slice(2)),
      url: String(item.url),
      caption: item.caption ? String(item.caption) : undefined,
      name: item.name ? String(item.name) : undefined,
    }));

  return {
    id: docId,
    content: hasPlainContent ? String(data.content) : '[Entrée chiffrée - lecture indisponible ici]',
    tags: Array.isArray(data.tags) ? data.tags.map((t: any) => String(t)) : [],
    images,
    readOnly: !hasPlainContent,
  };
}

export default function MagazineEntryPage() {
  const { user, loading } = useAuth();
  const params = useParams<{ entryId: string }>();
  const entryId = params?.entryId || '';
  const [entry, setEntry] = useState<EntryDetails | null>(null);
  const [isLoadingEntry, setIsLoadingEntry] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadEntry = async () => {
      if (!user || !entryId) {
        if (isMounted) {
          setEntry(null);
          setIsLoadingEntry(false);
        }
        return;
      }

      setIsLoadingEntry(true);
      try {
        const entryRef = doc(db, 'users', user.uid, 'entries', entryId);
        const snap = await getDoc(entryRef);
        if (!isMounted) return;
        if (!snap.exists()) {
          setEntry(null);
          return;
        }
        setEntry(normalizeEntry(snap.id, snap.data() as Record<string, unknown>));
      } catch {
        if (isMounted) setEntry(null);
      } finally {
        if (isMounted) setIsLoadingEntry(false);
      }
    };

    void loadEntry();
    return () => {
      isMounted = false;
    };
  }, [user, entryId]);

  if (loading || isLoadingEntry) {
    return (
      <div className="container mx-auto max-w-4xl py-8 md:py-12 space-y-5">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-[420px] w-full rounded-3xl" />
      </div>
    );
  }

  if (!user || !entry) {
    return (
      <div className="container mx-auto max-w-4xl py-8 md:py-12">
        <Button asChild variant="ghost" className="mb-4 pl-0 text-stone-600 hover:text-stone-900">
          <Link href="/sanctuary/magazine">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au journal
          </Link>
        </Button>
        <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center text-stone-600">
          Entrée introuvable ou inaccessible.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 md:py-12">
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4 pl-0 text-stone-600 hover:text-stone-900">
          <Link href="/sanctuary/magazine">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au journal
          </Link>
        </Button>
        <h1 className="font-headline text-4xl tracking-tight text-stone-900">Entrée du journal</h1>
        <p className="mt-2 text-stone-600">
          Lis, modifie ou supprime cette entrée.
        </p>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm md:p-8">
        <MagazineEntryEditor
          entryId={entry.id}
          initialContent={entry.content}
          initialTags={entry.tags}
          images={entry.images}
          readOnly={entry.readOnly}
        />
      </div>
    </div>
  );
}

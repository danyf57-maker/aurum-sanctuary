import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/lib/firebase/admin';
import { getAuthedUserId } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
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

export const dynamic = 'force-dynamic';

async function getEntry(userId: string, entryId: string): Promise<EntryDetails | null> {
  const doc = await db
    .collection('users')
    .doc(userId)
    .collection('entries')
    .doc(entryId)
    .get();

  if (!doc.exists) return null;

  const data = doc.data() as Record<string, any>;
  const hasPlainContent = typeof data.content === 'string';

  const rawImages = Array.isArray(data.images) ? data.images : [];
  const images: EntryImage[] = rawImages
    .filter((item: any) => item && typeof item.url === 'string')
    .map((item: any) => ({
      id: String(item.id || Math.random().toString(36).slice(2)),
      url: String(item.url),
      caption: item.caption ? String(item.caption) : undefined,
      name: item.name ? String(item.name) : undefined,
    }));

  return {
    id: doc.id,
    content: hasPlainContent ? String(data.content) : '[Entrée chiffrée - lecture indisponible ici]',
    tags: Array.isArray(data.tags) ? data.tags.map((t: any) => String(t)) : [],
    images,
    readOnly: !hasPlainContent,
  };
}

export default async function MagazineEntryPage({
  params,
}: {
  params: { entryId: string };
}) {
  const userId = await getAuthedUserId();
  if (!userId) notFound();

  const entry = await getEntry(userId, params.entryId);
  if (!entry) notFound();

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

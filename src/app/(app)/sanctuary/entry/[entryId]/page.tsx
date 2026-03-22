'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore as db } from '@/lib/firebase/web-client';
import { useAuth } from '@/providers/auth-provider';
import { useEncryption } from '@/hooks/useEncryption';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MagazineEntryEditor } from '@/components/sanctuary/magazine-entry-editor';
import type { EncryptedData } from '@/lib/crypto/encryption';
import { useLocalizedHref } from '@/hooks/use-localized-href';
import { useLocale } from '@/hooks/use-locale';

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

export default function EntryDiagnosticPage() {
  const to = useLocalizedHref();
  const locale = useLocale();
  const isFr = locale === 'fr';
  const { user, loading } = useAuth();
  const { isReady: encryptionReady, decrypt } = useEncryption();
  const params = useParams<{ entryId: string }>();
  const entryId = params?.entryId || '';
  const [entry, setEntry] = useState<EntryDetails | null>(null);
  const [isLoadingEntry, setIsLoadingEntry] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadEntry = async () => {
      if (!user || !entryId || !encryptionReady) {
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

        const data = snap.data() as Record<string, unknown>;

        let content: string;
        let readOnly = false;

        if (data.encryptedContent && data.iv) {
          try {
            const encryptedData: EncryptedData = {
              ciphertext: String(data.encryptedContent),
              iv: String(data.iv),
              version: data.version ? Number(data.version) : 1,
            };
            content = await decrypt(encryptedData);
          } catch (decryptError) {
            console.error('Failed to decrypt entry:', decryptError);
            content = isFr ? '[Erreur de dechiffrement]' : '[Decryption error]';
            readOnly = true;
          }
        } else {
          content = typeof data.content === 'string' ? String(data.content) : '[No content]';
        }

        const rawImages = Array.isArray(data.images) ? data.images : [];
        const images: EntryImage[] = rawImages
          .filter((item: unknown) => item && typeof item === 'object' && typeof (item as { url?: unknown }).url === 'string')
          .map((item) => {
            const image = item as { id?: unknown; url: string; caption?: unknown; name?: unknown };
            return {
              id: String(image.id || Math.random().toString(36).slice(2)),
              url: String(image.url),
              caption: image.caption ? String(image.caption) : undefined,
              name: image.name ? String(image.name) : undefined,
            };
          });

        if (isMounted) {
          setEntry({
            id: snap.id,
            content,
            tags: Array.isArray(data.tags) ? data.tags.map((tag) => String(tag)) : [],
            images,
            readOnly,
          });
        }
      } catch (error) {
        console.error('Error loading entry:', error);
        if (isMounted) setEntry(null);
      } finally {
        if (isMounted) setIsLoadingEntry(false);
      }
    };

    void loadEntry();

    return () => {
      isMounted = false;
    };
  }, [user, entryId, encryptionReady, decrypt, isFr]);

  if (loading || isLoadingEntry) {
    return (
      <div className="container mx-auto max-w-4xl space-y-5 py-8 md:py-12">
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
          <Link href={to('/sanctuary')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {isFr ? 'Retour au journal' : 'Back to journal'}
          </Link>
        </Button>
        <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center text-stone-600">
          {isFr ? 'Page introuvable ou inaccessible.' : 'Entry not found or inaccessible.'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 md:py-12">
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4 pl-0 text-stone-600 hover:text-stone-900">
          <Link href={to('/sanctuary')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {isFr ? 'Retour au journal' : 'Back to journal'}
          </Link>
        </Button>
        <h1 className="font-headline text-4xl tracking-tight text-stone-900">
          {isFr ? 'Page et diagnostic' : 'Page and reflection'}
        </h1>
        <p className="mt-2 text-stone-600">
          {isFr ? 'Relis, ecris, et vois ce qu’Aurum remarque.' : 'Read, write, and see what Aurum notices.'}
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

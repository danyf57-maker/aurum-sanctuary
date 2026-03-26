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
import { EncryptionAccessPanel } from '@/components/security/EncryptionAccessPanel';

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

export default function MagazineEntryPage() {
  const to = useLocalizedHref();
  const { user, loading } = useAuth();
  const {
    status: encryptionStatus,
    error: encryptionError,
    isReady: encryptionReady,
    decrypt,
    migrateEntry,
    setupVault,
    unlockVault,
  } = useEncryption();
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

        // Decrypt content if encrypted
        let content: string;
        let readOnly = false;

        const entryVersion = data.version ? Number(data.version) : 1;

        if (data.encryptedContent && data.iv) {
          try {
            const encryptedData: EncryptedData = {
              ciphertext: String(data.encryptedContent),
              iv: String(data.iv),
              version: entryVersion,
            };
            content = await decrypt(encryptedData);
            if (entryVersion < 2) {
              void migrateEntry(snap.id, content);
            }
          } catch (decryptError) {
            console.error('Failed to decrypt entry:', decryptError);
            content = '[Erreur de déchiffrement]';
            readOnly = true;
          }
        } else {
          // Legacy plaintext entry
          content = typeof data.content === 'string' ? String(data.content) : '[No content]';
          if (typeof data.content === 'string') {
            void migrateEntry(snap.id, content);
          }
        }

        // Parse images
        const rawImages = Array.isArray(data.images) ? data.images : [];
        const images: EntryImage[] = rawImages
          .filter((item: unknown) => item && typeof item === 'object' && typeof (item as any).url === 'string')
          .map((item: any) => ({
            id: String(item.id || Math.random().toString(36).slice(2)),
            url: String(item.url),
            caption: item.caption ? String(item.caption) : undefined,
            name: item.name ? String(item.name) : undefined,
          }));

        if (isMounted) {
          setEntry({
            id: snap.id,
            content,
            tags: Array.isArray(data.tags) ? data.tags.map((t: any) => String(t)) : [],
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
  }, [user, entryId, encryptionReady, decrypt]);

  if (loading || isLoadingEntry) {
    return (
      <div className="container mx-auto max-w-4xl py-8 md:py-12 space-y-5">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-[420px] w-full rounded-3xl" />
      </div>
    );
  }

  if (user && encryptionStatus !== 'ready') {
    return (
      <div className="container mx-auto max-w-4xl py-8 md:py-12 space-y-6">
        <Button asChild variant="ghost" className="pl-0 text-stone-600 hover:text-stone-900">
          <Link href={to("/sanctuary/magazine")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au journal
          </Link>
        </Button>
        <EncryptionAccessPanel
          status={encryptionStatus}
          error={encryptionError}
          onSetup={setupVault}
          onUnlock={unlockVault}
        />
      </div>
    );
  }

  if (!user || !entry) {
    return (
      <div className="container mx-auto max-w-4xl py-8 md:py-12">
        <Button asChild variant="ghost" className="mb-4 pl-0 text-stone-600 hover:text-stone-900">
          <Link href={to("/sanctuary/magazine")}>
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
          <Link href={to("/sanctuary/magazine")}>
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

'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';
import { updateJournalEntry, deleteJournalEntry } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

type EntryImage = {
  id: string;
  url: string;
  caption?: string;
  name?: string;
};

interface MagazineEntryEditorProps {
  entryId: string;
  initialContent: string;
  initialTags: string[];
  images: EntryImage[];
  readOnly: boolean;
}

export function MagazineEntryEditor({
  entryId,
  initialContent,
  initialTags,
  images,
  readOnly,
}: MagazineEntryEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [content, setContent] = useState(initialContent);
  const [tags, setTags] = useState(initialTags.join(', '));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const hasChanges = useMemo(() => {
    return content !== initialContent || tags !== initialTags.join(', ');
  }, [content, initialContent, initialTags, tags]);

  const onSave = async () => {
    if (readOnly) return;
    setIsSaving(true);
    try {
      const result = await updateJournalEntry(entryId, { content, tags });
      if (result.error) {
        toast({
          title: 'Erreur',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Mise à jour réussie',
        description: 'Ton entrée a été mise à jour.',
      });
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    if (readOnly) return;
    const confirmed = window.confirm('Supprimer définitivement cette entrée ?');
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      const result = await deleteJournalEntry(entryId);
      if (result.error) {
        toast({
          title: 'Erreur',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: 'Entrée supprimée',
        description: 'L’entrée a été retirée du journal.',
      });
      router.push('/sanctuary/magazine');
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {images.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {images.map((image) => (
            <figure key={image.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt={image.caption || image.name || 'Image'} className="h-auto w-full object-cover" />
              {(image.caption || image.name) && (
                <figcaption className="px-3 py-2 text-xs text-stone-600">
                  {image.caption || image.name}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="entry-tags" className="text-sm font-medium text-stone-700">
          Étiquettes
        </label>
        <Input
          id="entry-tags"
          value={tags}
          onChange={(event) => setTags(event.currentTarget.value)}
          placeholder="gratitude, travail, famille..."
          disabled={readOnly || isSaving || isDeleting}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="entry-content" className="text-sm font-medium text-stone-700">
          Contenu
        </label>
        <Textarea
          id="entry-content"
          value={content}
          onChange={(event) => setContent(event.currentTarget.value)}
          className="min-h-[360px] text-lg leading-relaxed"
          disabled={readOnly || isSaving || isDeleting}
        />
        {readOnly && (
          <p className="text-xs text-amber-700">
            Cette entrée est au format chiffré legacy et n’est pas éditable ici.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={onSave}
          disabled={readOnly || !hasChanges || isSaving || isDeleting}
          className="bg-stone-900 text-stone-50 hover:bg-stone-800"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            'Enregistrer'
          )}
        </Button>
        <Button
          onClick={onDelete}
          variant="outline"
          disabled={readOnly || isSaving || isDeleting}
          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          {isDeleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Suppression...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

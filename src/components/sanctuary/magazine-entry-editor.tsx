'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Loader2, Trash2 } from 'lucide-react';
import { updateJournalEntry, deleteJournalEntry } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/auth-provider';
import { ReflectionResponse } from './reflection-response';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { firestore as clientDb } from '@/lib/firebase/web-client';

type EntryImage = {
  id: string;
  url: string;
  caption?: string;
  name?: string;
};

type ConversationTurn = {
  id: string;
  role: 'user' | 'aurum';
  text: string;
  createdAt?: Date;
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
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState(initialContent);
  const [tags, setTags] = useState(initialTags.join(', '));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [question, setQuestion] = useState('');
  const [isAskingAurum, setIsAskingAurum] = useState(false);
  const [aurumReply, setAurumReply] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);

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

  const onAskAurum = async () => {
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: "Reconnecte-toi pour demander l'avis d'Aurum.",
        variant: 'destructive',
      });
      return;
    }
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;

    setIsAskingAurum(true);
    try {
      const idToken = await user.getIdToken();
      const payload = [
        'Voici mon entrée de journal:',
        content,
        '',
        "Ma question à Aurum:",
        cleanQuestion,
      ].join('\n');

      const response = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: payload,
          idToken,
          entryId,
          userMessage: cleanQuestion,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Aurum n'a pas pu répondre.");
      }

      const data = await response.json();
      setAurumReply(String(data.reflection || ''));
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : "Aurum n'a pas pu répondre.",
        variant: 'destructive',
      });
    } finally {
      setIsAskingAurum(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setConversation([]);
      return;
    }

    const conversationRef = collection(
      clientDb,
      'users',
      user.uid,
      'entries',
      entryId,
      'aurumConversation'
    );
    const q = query(conversationRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const turns = snapshot.docs.map((doc) => {
        const data = doc.data() as { role?: string; text?: string; createdAt?: { toDate?: () => Date } };
        return {
          id: doc.id,
          role: data.role === 'user' ? 'user' : 'aurum',
          text: String(data.text || ''),
          createdAt: data.createdAt?.toDate?.(),
        } as ConversationTurn;
      });
      setConversation(turns);
    });

    return () => unsubscribe();
  }, [entryId, user]);

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

      <div className="rounded-2xl border border-amber-200/40 bg-amber-50/30 p-4 md:p-6 space-y-4">
        <div className="flex items-center gap-2 text-stone-900">
          <Eye className="h-4 w-4 text-amber-600" />
          <h3 className="font-medium">Demander l'avis d'Aurum</h3>
        </div>
        <Textarea
          value={question}
          onChange={(event) => setQuestion(event.currentTarget.value)}
          placeholder="Pose ta question à partir de cette entrée..."
          className="min-h-[92px]"
          disabled={isAskingAurum}
        />
        <div className="flex justify-end">
          <Button
            onClick={onAskAurum}
            disabled={isAskingAurum || !question.trim()}
            className="bg-amber-700 text-white hover:bg-amber-800"
          >
            {isAskingAurum ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aurum réfléchit...
              </>
            ) : (
              "Demander l'avis d'Aurum"
            )}
          </Button>
        </div>
        {aurumReply && (
          <ReflectionResponse reflection={aurumReply} />
        )}
      </div>

      {conversation.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white/70 p-4 md:p-6 space-y-3">
          <h3 className="font-medium text-stone-900">Échanges avec Aurum</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {conversation.map((turn) => (
              <div
                key={turn.id}
                className={turn.role === 'user'
                  ? 'ml-auto max-w-[92%] rounded-xl bg-stone-900 text-stone-50 px-3 py-2 text-sm'
                  : 'mr-auto max-w-[92%] rounded-xl bg-amber-50 text-stone-800 px-3 py-2 text-sm border border-amber-100'}
              >
                {turn.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

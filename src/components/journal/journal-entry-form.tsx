"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from 'lucide-react';
import { useAuth, ALMA_EMAIL } from '@/providers/auth-provider';
import { saveJournalEntry, type FormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { AuthDialog } from "@/components/auth/auth-dialog";


function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-stone-600 text-white hover:bg-stone-700">
      {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyse en cours...</> : "Sauvegarder au Sanctuaire"}
    </Button>
  );
}

interface PostWritePayload {
  freeQuestion: string;
  lockedQuestions: string[];
  sentiment?: string;
  mood?: string;
  insight?: string;
}

interface JournalEntryFormProps {
  onSave?: (payload?: PostWritePayload) => void;
}

function buildMirrorQuestions(sentiment?: string, mood?: string): {
  freeQuestion: string;
  lockedQuestions: string[];
} {
  const moodLower = (mood || "").toLowerCase();
  const sentimentLower = (sentiment || "").toLowerCase();

  if (moodLower.includes("anx") || moodLower.includes("stress") || sentimentLower === "negative") {
    return {
      freeQuestion: "Si cette tension avait une forme, laquelle serait‑elle ?",
      lockedQuestions: [
        "Qu’est‑ce que cette situation protège en vous ?",
        "Quel besoin non nommé se cache derrière cette inquiétude ?",
      ],
    };
  }

  if (moodLower.includes("trist") || moodLower.includes("sad")) {
    return {
      freeQuestion: "Si cette tristesse pouvait parler, que dirait‑elle ?",
      lockedQuestions: [
        "Qu’est‑ce qui mérite d’être accueilli ici, sans le juger ?",
        "Quelle part de vous demande de la douceur aujourd’hui ?",
      ],
    };
  }

  if (sentimentLower === "positive" || moodLower.includes("joy") || moodLower.includes("calm")) {
    return {
      freeQuestion: "Qu’est‑ce qui a rendu ce moment possible ?",
      lockedQuestions: [
        "Quel détail voudriez‑vous retenir pour y revenir ?",
        "Comment ce calme pourrait‑il vous accompagner demain ?",
      ],
    };
  }

  return {
    freeQuestion: "Si ce sentiment avait une couleur, laquelle serait‑elle ?",
    lockedQuestions: [
      "Qu’est‑ce que cette situation protège en vous ?",
      "Quel besoin non nommé se cache derrière cette tension ?",
    ],
  };
}

export function JournalEntryForm({ onSave }: JournalEntryFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  useEffect(() => {
    console.log('[JournalEntryForm] Auth dialog state changed:', isAuthDialogOpen);
  }, [isAuthDialogOpen]);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // CRITICAL: Capture form reference BEFORE any async operations
    // React synthetic events are nullified after async calls
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) {
      console.error('[JournalEntryForm] event.currentTarget is not a form:', form);
      toast({
        title: 'Erreur',
        description: 'Erreur de formulaire. Veuillez recharger la page.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      console.log('[JournalEntryForm] User not authenticated, opening auth dialog');
      setIsAuthDialogOpen(true);
      return;
    }

    // Verify token is still valid
    try {
      const token = await user.getIdToken();
      if (!token) {
        throw new Error('No token available');
      }
    } catch (error) {
      console.error('[JournalEntryForm] Token invalid or expired', error);
      toast({
        title: "Session expirée",
        description: "Veuillez vous reconnecter.",
        variant: "destructive",
      });
      setIsAuthDialogOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const rawFormData = new FormData(form);
      const content = String(rawFormData.get("content") || "").trim();
      const tags = String(rawFormData.get("tags") || "");
      const publishAsPost = rawFormData.get("publishAsPost") === "on";

      if (!content) {
        throw new Error("Le contenu ne peut pas être vide.");
      }

      // TABULA RASA: Pas de chiffrement, envoi direct en plaintext
      let analysis: any = null;
      const questions = buildMirrorQuestions(analysis?.sentiment, analysis?.mood);

      // Build payload for server action (plaintext mode)
      const payload = new FormData();
      payload.set("content", content); // ← PLAINTEXT (temporaire)
      if (tags) payload.set("tags", tags);
      if (publishAsPost) payload.set("publishAsPost", "on");
      if (analysis?.sentiment) payload.set("sentiment", analysis.sentiment);
      if (analysis?.mood) payload.set("mood", analysis.mood);
      if (analysis?.insight) payload.set("insight", analysis.insight);

      // Only send raw content for Alma public posts
      if (publishAsPost && user?.email === ALMA_EMAIL) {
        payload.set("content", content);
      }

      // Server action expects a "previous state" argument, even if we don't use it here.
      const result: FormState = await saveJournalEntry({} as FormState, payload);

      // Check if result exists
      if (!result) {
        throw new Error('Aucune réponse du serveur. Veuillez réessayer.');
      }

      if (!result.errors && !result.message) {
        if (onSave) onSave({
          freeQuestion: questions.freeQuestion,
          lockedQuestions: questions.lockedQuestions,
          sentiment: analysis?.sentiment,
          mood: analysis?.mood,
          insight: analysis?.insight,
        });
        if (formRef.current) formRef.current.reset();
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
        toast({
          title: "Entrée enregistrée",
          description: result.isFirstEntry
            ? "Félicitations pour votre première entrée ! Bienvenue dans votre sanctuaire."
            : "Votre pensée a été préservée en toute sécurité.",
        });
      } else {
        // Extract all validation errors
        let errorMsg = result.message || "Une erreur est survenue.";
        if (result.errors) {
          const allErrors = Object.values(result.errors).flat().filter(Boolean);
          if (allErrors.length > 0) {
            errorMsg = allErrors[0];
          }
        }
        toast({
          title: "Erreur de validation",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Une erreur est survenue.";
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, []);

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  const isAlma = user?.email === ALMA_EMAIL;

  return (
    <>
      <form ref={formRef} onSubmit={handleFormSubmit} className="w-full max-w-2xl mx-auto space-y-8">
        <div>
          <Textarea
            ref={textareaRef}
            id="content"
            name="content"
            placeholder="Écrivez ici..."
            className="bg-transparent border-none shadow-none resize-none overflow-hidden min-h-[30vh] p-0 font-body text-xl leading-relaxed text-stone-800 placeholder:text-stone-300 focus:ring-0 focus:outline-none focus-visible:ring-0"
            required
            onInput={handleInput}
          />
        </div>
        <div className="space-y-4 opacity-80 focus-within:opacity-100 transition-opacity">
          <div>
            <Label htmlFor="tags" className="sr-only">Étiquettes</Label>
            <Input
              id="tags"
              name="tags"
              placeholder="Ajouter des étiquettes... (ex: gratitude, travail)"
              className="bg-transparent border-0 border-b rounded-none px-0 focus:ring-0 focus-visible:ring-0"
            />
          </div>
          {isAlma && (
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="publishAsPost" name="publishAsPost" defaultChecked={true} />
              <Label htmlFor="publishAsPost" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Publier sur le blog public en tant qu'Alma
              </Label>
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <SubmitButton isSubmitting={isSubmitting} />
        </div>
      </form>
      <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
    </>
  );
}

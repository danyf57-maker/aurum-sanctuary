"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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

interface JournalEntryFormProps {
  onSave?: () => void;
}

export function JournalEntryForm({ onSave }: JournalEntryFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      setIsAuthDialogOpen(true);
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    // Server action expects a "previous state" argument, even if we don't use it here.
    const result: FormState = await saveJournalEntry({} as FormState, formData);
    setIsSubmitting(false);

    if (result && !result.errors && !result.message) {
      if (onSave) onSave();
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
      const errorMsg = result.errors?.content?.[0] || result.errors?.userId?.[0] || result.message || "Une erreur est survenue.";
      toast({
        title: "Erreur de validation",
        description: errorMsg,
        variant: "destructive",
      });
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
        <input type="hidden" name="userId" value={user?.uid ?? ''} />
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

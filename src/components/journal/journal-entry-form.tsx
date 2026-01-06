
"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus, useFormState } from "react-dom";
import { Loader2 } from 'lucide-react';
import { useAuth, ALMA_USER_ID } from "@/hooks/use-auth";
import { saveJournalEntry, type FormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { AuthDialog } from "@/components/auth/auth-dialog";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-stone-600 text-white hover:bg-stone-700">
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyse en cours...</> : "Sauvegarder au Sanctuaire"}
    </Button>
  );
}

interface JournalEntryFormProps {
    onSave?: () => void;
}

export function JournalEntryForm({ onSave }: JournalEntryFormProps) {
  const initialState: FormState = { message: "", errors: {} };
  
  const formAction = async (prevState: FormState, formData: FormData): Promise<FormState> => {
    const result = await saveJournalEntry(prevState, formData);
    if (result && !result.errors && !result.message) {
        if(onSave) onSave();
        if(formRef.current) formRef.current.reset();
        if(textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
        toast({
          title: "Entrée enregistrée",
          description: state?.isFirstEntry 
            ? "Félicitations pour votre première entrée ! Bienvenue dans votre sanctuaire."
            : "Votre pensée a été préservée en toute sécurité.",
        });
    }
    return result || { message: "Une erreur inattendue est survenue."};
  };

  const [state, dispatch] = useFormState(formAction, initialState);
  const { user } = useAuth();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state?.message) {
      toast({
        title: "Impossible d'enregistrer l'entrée",
        description: state.message,
        variant: "destructive",
      });
    } else if (state?.errors) {
        const errorMsg = state.errors.content?.[0] || state.errors.userId?.[0] || "Une erreur est survenue.";
         toast({
            title: "Erreur de validation",
            description: errorMsg,
            variant: "destructive",
        });
    }
  }, [state, toast]);
  
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      setIsAuthDialogOpen(true);
      return;
    }
    const formData = new FormData(event.currentTarget);
    formData.set("userId", user.uid);
    dispatch(formData);
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

  const isAlma = user?.uid === ALMA_USER_ID;

  return (
    <>
    <form ref={formRef} action={dispatch} onSubmit={handleFormSubmit} className="w-full max-w-2xl mx-auto space-y-8">
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
        {state?.errors?.content && (
          <p className="text-sm font-medium text-destructive mt-2">
            {state.errors.content[0]}
          </p>
        )}
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
        <SubmitButton />
      </div>
    </form>
    <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
    </>
  );
}

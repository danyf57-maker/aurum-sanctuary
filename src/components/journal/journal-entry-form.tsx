
"use client";

import { useEffect, useRef, useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from 'lucide-react';
import { useAuth } from "@/hooks/use-auth";
import { saveJournalEntry, type FormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { AuthDialog } from "@/components/auth/auth-dialog";

const ALMA_USER_ID = "alma_user_placeholder_id";


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant="ghost" className="w-full sm:w-auto text-muted-foreground hover:text-foreground">
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...</> : "Sauvegarder au Sanctuaire"}
    </Button>
  );
}

export function JournalEntryForm() {
  const initialState: FormState = { message: "", errors: {} };
  const [state, dispatch] = useActionState(saveJournalEntry, initialState);
  const { user } = useAuth();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state.message && state.errors) {
      const errorMsg = state.errors.content?.[0] || state.errors.userId?.[0] || state.message;
      toast({
        title: "Impossible d'enregistrer l'entrée",
        description: errorMsg,
        variant: "destructive",
      });
    }
  }, [state, toast]);
  
  const handleFormSubmit = (formData: FormData) => {
    if (!user) {
      setIsAuthDialogOpen(true);
      return;
    }
    formData.set("userId", user.uid);
    dispatch(formData);
  };
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
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
    <form ref={formRef} action={handleFormSubmit} className="w-full max-w-2xl mx-auto space-y-8">
      <input type="hidden" name="userId" value={user?.uid ?? ''} />
      <div>
        <Textarea
          ref={textareaRef}
          id="content"
          name="content"
          placeholder="Écrivez ici..."
          className="bg-transparent border-none shadow-none resize-none overflow-hidden min-h-[60vh] p-0 font-headline text-2xl leading-relaxed text-stone-800 placeholder:text-stone-300 focus:ring-0 focus:outline-none focus-visible:ring-0"
          required
          onInput={handleInput}
        />
        {state.errors?.content && (
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
            <Checkbox id="publishAsPost" name="publishAsPost" />
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

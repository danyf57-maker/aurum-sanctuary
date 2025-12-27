"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Loader2 } from 'lucide-react';
import { useAuth } from "@/hooks/use-auth";
import { saveJournalEntry, type FormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AuthDialog } from "@/components/auth/auth-dialog";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save to Sanctuary"}
    </Button>
  );
}

export function JournalEntryForm() {
  const initialState: FormState = { message: "", errors: {} };
  const [state, dispatch] = useFormState(saveJournalEntry, initialState);
  const { user } = useAuth();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  useEffect(() => {
    if (state.message && state.errors) {
      const errorMsg = state.errors.content?.[0] || state.errors.userId?.[0] || state.message;
      toast({
        title: "Could not save entry",
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
    // A bit of a hack since server actions can't access client-side auth context
    formData.set("userId", user.uid);
    dispatch(formData);
  };

  return (
    <>
    <form ref={formRef} action={handleFormSubmit} className="space-y-6">
      <input type="hidden" name="userId" value={user?.uid ?? ''} />
      <div className="space-y-2">
        <Label htmlFor="content" className="text-lg">
          What's on your mind?
        </Label>
        <Textarea
          id="content"
          name="content"
          placeholder="Pour your thoughts here..."
          className="min-h-[300px] text-base bg-card"
          required
        />
        {state.errors?.content && (
          <p className="text-sm font-medium text-destructive">
            {state.errors.content[0]}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          name="tags"
          placeholder="e.g., gratitude, work, reflection"
          className="bg-card"
        />
        <p className="text-sm text-muted-foreground">
          Separate tags with a comma.
        </p>
      </div>
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
    <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
    </>
  );
}

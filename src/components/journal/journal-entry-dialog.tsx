
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { JournalEntryForm } from "./journal-entry-form";

interface JournalEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
}

export function JournalEntryDialog({ open, onOpenChange, onSave }: JournalEntryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Nouvelle Entrée</DialogTitle>
          <DialogDescription>
            Écrivez librement. Votre sanctuaire écoute.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <JournalEntryForm onSave={() => {
                onOpenChange(false);
                if(onSave) onSave();
            }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

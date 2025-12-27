import { JournalEntryForm } from '@/components/journal/journal-entry-form';

export default function Home() {
  return (
    <div className="container max-w-4xl py-8 md:py-12">
      <header className="mb-12 text-center animate-fade-in">
        <h1 className="text-4xl font-bold font-headline tracking-tight md:text-5xl">
          Le Sanctuaire d'Aurum
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Un espace numérique tranquille pour vos pensées et réflexions dorées.
        </p>
      </header>
      <JournalEntryForm />
    </div>
  );
}

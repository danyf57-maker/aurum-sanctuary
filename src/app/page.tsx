import { JournalEntryForm } from '@/components/journal/journal-entry-form';

export default function Home() {
  return (
    <div className="container max-w-4xl py-8 md:py-12">
      <header className="mb-12 text-center animate-fade-in">
        <h1 className="text-4xl font-bold font-headline tracking-tight md:text-5xl">
          The Aurum Sanctuary
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A quiet, digital space for your golden thoughts and reflections.
        </p>
      </header>
      <JournalEntryForm />
    </div>
  );
}

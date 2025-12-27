import { JournalEntryForm } from '@/components/journal/journal-entry-form';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center py-8 md:py-12 animate-fade-in">
        <JournalEntryForm />
    </div>
  );
}

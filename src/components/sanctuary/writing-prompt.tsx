'use client';

type WritingPromptProps = {
  prompts: string[];
};

export function WritingPrompt({ prompts }: WritingPromptProps) {
  if (prompts.length === 0) return null;

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600">Suggestions intelligentes</p>
      <div className="mt-3 space-y-2">
        {prompts.map((prompt, index) => (
          <div key={`${prompt}-${index}`} className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700">
            {prompt}
          </div>
        ))}
      </div>
    </section>
  );
}

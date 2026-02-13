'use client';

type ThemeTemplate = 'minimal' | 'elegant' | 'magazine' | 'zen';

type MagazineThemePickerProps = {
  value: ThemeTemplate;
  onChange: (value: ThemeTemplate) => void;
};

const options: Array<{ id: ThemeTemplate; label: string }> = [
  { id: 'minimal', label: 'Minimal' },
  { id: 'elegant', label: 'Elegant' },
  { id: 'magazine', label: 'Magazine' },
  { id: 'zen', label: 'Zen' },
];

export function MagazineThemePicker({ value, onChange }: MagazineThemePickerProps) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600">Theme</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              value === option.id
                ? 'border-[#C5A059] bg-[#C5A059]/10 text-[#7A5D24]'
                : 'border-stone-300 bg-stone-50 text-stone-600'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}

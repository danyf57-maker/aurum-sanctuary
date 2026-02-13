'use client';

import { Trash2 } from 'lucide-react';

export type MagazineCollection = {
  id: string;
  name: string;
  color: string;
  entryIds: string[];
};

type CollectionManagerProps = {
  collections: MagazineCollection[];
  selectedCollectionId: string;
  onSelectCollection: (collectionId: string) => void;
  onCreateCollection: (name: string, color: string) => Promise<void>;
  onDeleteCollection: (collectionId: string) => Promise<void>;
};

export function CollectionManager({
  collections,
  selectedCollectionId,
  onSelectCollection,
  onCreateCollection,
  onDeleteCollection,
}: CollectionManagerProps) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600">Collections</p>
        <span className="text-xs text-stone-500">{collections.length}</span>
      </div>

      <form
        className="mt-3 flex flex-wrap items-center gap-2"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const formData = new FormData(form);
          const name = String(formData.get('name') || '').trim();
          const color = String(formData.get('color') || '#C5A059');
          if (!name) return;
          await onCreateCollection(name, color);
          form.reset();
        }}
      >
        <input
          name="name"
          placeholder="Nouvelle collection"
          className="h-9 min-w-[180px] rounded-xl border border-stone-300 bg-stone-50 px-3 text-sm outline-none focus:border-[#C5A059]"
        />
        <input name="color" type="color" defaultValue="#C5A059" className="h-9 w-11 rounded border border-stone-300 bg-white p-1" />
        <button type="submit" className="h-9 rounded-xl bg-stone-900 px-3 text-xs font-medium text-white hover:bg-stone-800">
          Creer
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelectCollection('all')}
          className={`rounded-full border px-3 py-1 text-xs ${
            selectedCollectionId === 'all'
              ? 'border-[#C5A059] bg-[#C5A059]/10 text-[#7A5D24]'
              : 'border-stone-300 bg-stone-50 text-stone-600'
          }`}
        >
          Toutes
        </button>

        {collections.map((collection) => (
          <div key={collection.id} className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-stone-50 pr-1">
            <button
              type="button"
              onClick={() => onSelectCollection(collection.id)}
              className={`rounded-full px-3 py-1 text-xs ${
                selectedCollectionId === collection.id ? 'text-[#7A5D24]' : 'text-stone-600'
              }`}
            >
              <span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: collection.color }} />
              {collection.name}
            </button>

            <button
              type="button"
              onClick={() => onDeleteCollection(collection.id)}
              className="rounded-full p-1 text-stone-500 hover:text-red-600"
              aria-label={`Supprimer ${collection.name}`}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

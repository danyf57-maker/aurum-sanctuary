'use client';

import Link from 'next/link';
import { BookImage, Star } from 'lucide-react';

export type TimelineIssue = {
  id: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  createdAt: Date | null;
};

type MagazineTimelineProps = {
  issues: TimelineIssue[];
  favorites: string[];
};

export function MagazineTimeline({ issues, favorites }: MagazineTimelineProps) {
  const grouped = issues.reduce<Record<string, TimelineIssue[]>>((acc, issue) => {
    const key = issue.createdAt
      ? issue.createdAt.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      : 'Sans date';
    if (!acc[key]) acc[key] = [];
    acc[key].push(issue);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([month, monthIssues]) => (
        <section key={month} className="relative border-l-2 border-stone-200 pl-6">
          <h3 className="mb-4 inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-stone-600">
            {month}
          </h3>

          <div className="space-y-4">
            {monthIssues.map((issue) => {
              const isFavorite = favorites.includes(issue.id);

              return (
                <Link key={issue.id} href={`/sanctuary/magazine/${issue.id}`} className="block">
                  <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex gap-4">
                      <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                        {issue.coverImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={issue.coverImageUrl} alt={issue.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-stone-400">
                            <BookImage className="h-5 w-5" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="line-clamp-2 font-headline text-2xl text-stone-900">{issue.title}</h4>
                          {isFavorite && <Star className="h-4 w-4 fill-[#C5A059] text-[#C5A059]" />}
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-stone-600">{issue.excerpt}</p>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

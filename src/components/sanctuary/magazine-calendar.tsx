'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BookImage, Star } from 'lucide-react';

type CalendarIssue = {
  id: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  createdAt: Date | null;
  mood: string | null;
};

type MagazineCalendarProps = {
  issues: CalendarIssue[];
  favorites: string[];
};

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const WEEKS = 12;

function getIntensityClass(count: number): string {
  if (count >= 4) return 'bg-[#C5A059]';
  if (count >= 3) return 'bg-[#C5A059]/70';
  if (count >= 2) return 'bg-[#C5A059]/40';
  if (count >= 1) return 'bg-[#C5A059]/20';
  return 'bg-stone-100';
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function MagazineCalendar({ issues, favorites }: MagazineCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const { grid, monthLabels, dateCounts, dateToIso } = useMemo(() => {
    // Count entries per day
    const counts = new Map<string, number>();
    for (const issue of issues) {
      if (!issue.createdAt) continue;
      const key = dateKey(issue.createdAt);
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    // Build grid: 7 rows (Mon-Sun) x WEEKS columns
    const totalDays = WEEKS * 7;
    const today = new Date();

    // Find the start date: go back totalDays and align to Monday
    const start = new Date(today);
    start.setDate(start.getDate() - totalDays + 1);
    // Adjust to previous Monday (getDay: 0=Sun, 1=Mon...)
    const dayOfWeek = start.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    start.setDate(start.getDate() + mondayOffset);

    // Build the grid
    const rows: Array<Array<{ key: string; label: string; count: number; date: Date; isToday: boolean; isFuture: boolean }>> = [];
    const isoMap = new Map<string, string>();
    const months: Array<{ label: string; col: number }> = [];
    let lastMonth = -1;

    for (let row = 0; row < 7; row++) {
      rows[row] = [];
    }

    const totalCols = Math.ceil(totalDays / 7) + 1;
    for (let col = 0; col < totalCols; col++) {
      for (let row = 0; row < 7; row++) {
        const d = new Date(start);
        d.setDate(d.getDate() + col * 7 + row);
        const key = dateKey(d);
        const iso = d.toISOString().split('T')[0];
        isoMap.set(key, iso);

        // Track month labels
        if (row === 0 && d.getMonth() !== lastMonth) {
          lastMonth = d.getMonth();
          months.push({
            label: d.toLocaleDateString('fr-FR', { month: 'short' }),
            col,
          });
        }

        rows[row].push({
          key,
          label: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
          count: counts.get(key) || 0,
          date: d,
          isToday: dateKey(today) === key,
          isFuture: d > today,
        });
      }
    }

    return { grid: rows, monthLabels: months, dateCounts: counts, dateToIso: isoMap };
  }, [issues]);

  // Entries for selected day
  const selectedEntries = useMemo(() => {
    if (!selectedDay) return [];
    return issues.filter((issue) => {
      if (!issue.createdAt) return false;
      return dateKey(issue.createdAt) === selectedDay;
    });
  }, [issues, selectedDay]);

  const handleDayClick = (key: string, count: number) => {
    if (count === 0) {
      setSelectedDay(null);
      return;
    }
    setSelectedDay(selectedDay === key ? null : key);
  };

  return (
    <div className="space-y-6">
      {/* Heatmap */}
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600">
            Calendrier d&apos;ecriture ({WEEKS} semaines)
          </p>
          {selectedDay && (
            <button
              onClick={() => setSelectedDay(null)}
              className="text-xs text-stone-500 hover:text-stone-800 transition-colors"
            >
              Effacer le filtre
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          {/* Month labels */}
          <div className="flex mb-1" style={{ paddingLeft: '32px' }}>
            {monthLabels.map((m, i) => (
              <div
                key={`${m.label}-${i}`}
                className="text-[10px] text-stone-400 font-medium"
                style={{
                  position: 'absolute',
                  left: `${32 + m.col * 16}px`,
                }}
              >
                {m.label}
              </div>
            ))}
          </div>

          <div className="relative mt-5">
            {/* Grid */}
            {grid.map((row, rowIdx) => (
              <div key={rowIdx} className="flex items-center gap-[3px] mb-[3px]">
                {/* Day label */}
                <div className="w-7 text-[10px] text-stone-400 text-right pr-1 shrink-0">
                  {rowIdx % 2 === 0 ? DAY_LABELS[rowIdx] : ''}
                </div>

                {row.map((cell) => {
                  if (cell.isFuture) {
                    return (
                      <div
                        key={cell.key}
                        className="h-[14px] w-[14px] rounded-[2px] bg-transparent"
                      />
                    );
                  }

                  const isSelected = selectedDay === cell.key;

                  return (
                    <div
                      key={cell.key}
                      title={`${cell.label} — ${cell.count} entree(s)`}
                      onClick={() => handleDayClick(cell.key, cell.count)}
                      className={`
                        h-[14px] w-[14px] rounded-[2px] transition-all duration-150
                        ${getIntensityClass(cell.count)}
                        ${cell.count > 0 ? 'cursor-pointer hover:ring-2 hover:ring-[#C5A059]/50' : ''}
                        ${isSelected ? 'ring-2 ring-stone-800' : ''}
                        ${cell.isToday ? 'ring-1 ring-stone-400' : ''}
                      `}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-end gap-1 text-[10px] text-stone-400">
          <span>Moins</span>
          <div className="h-[10px] w-[10px] rounded-[2px] bg-stone-100 border border-stone-200" />
          <div className="h-[10px] w-[10px] rounded-[2px] bg-[#C5A059]/20" />
          <div className="h-[10px] w-[10px] rounded-[2px] bg-[#C5A059]/40" />
          <div className="h-[10px] w-[10px] rounded-[2px] bg-[#C5A059]/70" />
          <div className="h-[10px] w-[10px] rounded-[2px] bg-[#C5A059]" />
          <span>Plus</span>
        </div>
      </section>

      {/* Selected day entries */}
      {selectedDay && selectedEntries.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
            {selectedEntries[0]?.createdAt?.toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })} — {selectedEntries.length} entree(s)
          </p>

          <div className="space-y-3">
            {selectedEntries.map((issue) => {
              const isFavorite = favorites.includes(issue.id);
              return (
                <Link key={issue.id} href={`/sanctuary/magazine/${issue.id}`} className="block">
                  <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex gap-4">
                      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-stone-100">
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
                          <h4 className="line-clamp-1 font-headline text-lg text-stone-900">{issue.title}</h4>
                          {isFavorite && <Star className="h-4 w-4 shrink-0 fill-[#C5A059] text-[#C5A059]" />}
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-stone-600">{issue.excerpt}</p>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

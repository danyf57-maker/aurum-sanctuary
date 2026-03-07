'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PenSquare, BookOpenText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

const NAV_ITEMS = [
  { key: 'write' as const, href: '/sanctuary/write', icon: PenSquare },
  { key: 'journal' as const, href: '/sanctuary', icon: BookOpenText },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const t = useTranslations('nav');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200/80 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors',
                isActive
                  ? 'text-stone-900'
                  : 'text-stone-400 active:text-stone-600'
              )}
            >
              {isActive && (
                <span
                  className="absolute top-0 h-0.5 w-10 rounded-full bg-amber-500"
                  aria-hidden
                />
              )}
              <item.icon className={cn('h-5 w-5', isActive && 'text-[#C5A059]')} />
              <span className={cn('text-[10px] font-medium tracking-wide', isActive && 'font-semibold')}>
                {t(item.key)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PenSquare, BookOpenText } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    title: 'Écrire',
    href: '/sanctuary/write',
    icon: PenSquare,
  },
  {
    title: 'Journal',
    href: '/sanctuary/magazine',
    icon: BookOpenText,
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors',
                isActive
                  ? 'text-stone-900'
                  : 'text-stone-400 active:text-stone-600'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'text-[#C5A059]')} />
              <span className={cn('text-[10px] font-medium', isActive && 'font-bold')}>
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

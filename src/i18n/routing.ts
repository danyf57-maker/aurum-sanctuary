import type { Locale } from '@/lib/locale';

export const I18N_LOCALES = ['en', 'fr'] as const;
export const I18N_DEFAULT_LOCALE: Locale = 'en';

export function detectPathLocale(pathname: string): Locale | null {
  if (pathname === '/fr' || pathname.startsWith('/fr/')) return 'fr';
  if (pathname === '/en' || pathname.startsWith('/en/')) return 'en';
  return null;
}

export function stripLocalePrefix(pathname: string): string {
  if (pathname === '/fr' || pathname === '/en') return '/';
  if (pathname.startsWith('/fr/')) return pathname.slice(3);
  if (pathname.startsWith('/en/')) return pathname.slice(3);
  return pathname;
}

export function toLocalePath(pathname: string, locale: Locale): string {
  if (locale === 'fr') {
    return pathname === '/' ? '/fr' : `/fr${pathname}`;
  }
  return pathname;
}

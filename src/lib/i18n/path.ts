import type { Locale } from '@/lib/locale';
import { normalizeLocale } from '@/lib/locale';
import { stripLocalePrefix, toLocalePath } from '@/i18n/routing';

export function localizeHref(href: string, locale: Locale): string {
  if (!href) return href;
  if (isExternalOrSpecial(href)) return href;

  const path = href.startsWith('/') ? href : `/${href}`;
  const { pathname, suffix } = splitPath(path);
  const pathLocale = getPathLocale(pathname);

  if (pathLocale === locale) {
    const canonicalPath =
      locale === 'en' ? stripLocalePrefix(pathname) : toLocalePath(stripLocalePrefix(pathname), 'fr');
    return `${canonicalPath}${suffix}`;
  }

  const normalized = stripLocalePrefix(pathname);
  const localized = toLocalePath(normalized, locale);
  return `${localized}${suffix}`;
}

function isExternalOrSpecial(href: string): boolean {
  return (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#') ||
    href.startsWith('?')
  );
}

function splitPath(href: string): { pathname: string; suffix: string } {
  const hashIndex = href.indexOf('#');
  const queryIndex = href.indexOf('?');

  let cutIndex = -1;
  if (hashIndex >= 0 && queryIndex >= 0) {
    cutIndex = Math.min(hashIndex, queryIndex);
  } else if (hashIndex >= 0) {
    cutIndex = hashIndex;
  } else if (queryIndex >= 0) {
    cutIndex = queryIndex;
  }

  if (cutIndex === -1) {
    return { pathname: href, suffix: '' };
  }

  return {
    pathname: href.slice(0, cutIndex),
    suffix: href.slice(cutIndex),
  };
}

function getPathLocale(pathname: string): Locale | null {
  if (pathname === '/fr' || pathname.startsWith('/fr/')) return 'fr';
  if (pathname === '/en' || pathname.startsWith('/en/')) return 'en';
  const first = pathname.split('/').filter(Boolean)[0] ?? null;
  return normalizeLocale(first);
}

"use client";

import { useCallback } from 'react';
import { useLocale } from '@/hooks/use-locale';
import { localizeHref } from '@/lib/i18n/path';

export function useLocalizedHref() {
  const locale = useLocale();

  return useCallback(
    (href: string) => localizeHref(href, locale),
    [locale]
  );
}

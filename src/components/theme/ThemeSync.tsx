'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSettings } from '@/hooks/useSettings';

function normalizePathname(pathname: string) {
  return pathname.replace(/^\/(fr|en)(?=\/|$)/, '') || '/';
}

function isPrivateAppPath(pathname: string) {
  const normalized = normalizePathname(pathname);
  return (
    normalized.startsWith('/sanctuary') ||
    normalized.startsWith('/settings') ||
    normalized.startsWith('/account') ||
    normalized.startsWith('/admin')
  );
}

export function ThemeSync() {
  const pathname = usePathname();
  const { preferences } = useSettings();

  useEffect(() => {
    if (isPrivateAppPath(pathname)) return;

    const root = document.documentElement;
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }, [pathname, preferences.theme]);

  return null;
}

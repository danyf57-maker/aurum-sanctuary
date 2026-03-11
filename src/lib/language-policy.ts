export const PRODUCT_LOCALES = ['en', 'fr'] as const;
export type ProductLocale = (typeof PRODUCT_LOCALES)[number];

export const REFLECTION_LANGUAGES = ['en', 'fr', 'es', 'it', 'de', 'pt'] as const;
export type ReflectionLanguage = (typeof REFLECTION_LANGUAGES)[number];

export const DEFAULT_PRODUCT_LOCALE: ProductLocale = 'en';

export const REFLECTION_LANGUAGE_LABELS: Record<ReflectionLanguage, string> = {
  en: 'English',
  fr: 'French',
  es: 'Spanish',
  it: 'Italian',
  de: 'German',
  pt: 'Portuguese',
};

export function isProductLocale(value: string): value is ProductLocale {
  return (PRODUCT_LOCALES as readonly string[]).includes(value);
}

export function isReflectionLanguage(value: string): value is ReflectionLanguage {
  return (REFLECTION_LANGUAGES as readonly string[]).includes(value);
}

export function normalizeProductLocale(input?: string | null): ProductLocale | null {
  if (!input) return null;
  const value = input.toLowerCase();

  for (const locale of PRODUCT_LOCALES) {
    if (value.startsWith(locale)) return locale;
  }

  return null;
}

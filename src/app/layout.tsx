
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/providers/auth-provider';
import { Suspense } from 'react';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import { headers } from 'next/headers';
import ProductEventTracker from '@/components/analytics/ProductEventTracker';
import { CookieConsent } from '@/components/legal/CookieConsent';
import { TermsModal } from '@/components/auth/TermsModal';
import { ThemeSync } from '@/components/theme/ThemeSync';
import { getRequestLocale } from '@/lib/locale-server';
import { PUBLIC_PRICING } from '@/lib/billing/config';
import { buildAlternates, openGraphLocale, SITE_URL } from '@/lib/seo';
import { NextIntlClientProvider } from 'next-intl';
import type { AbstractIntlMessages } from 'next-intl';
import { getMessages } from 'next-intl/server';

import { Cormorant_Garamond, Inter, Dawning_of_a_New_Day } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const dawning = Dawning_of_a_New_Day({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dawning',
  display: 'swap',
});

const GTM_CONTAINER_ID = 'GTM-WNDQPP94';
const GoogleAnalytics = dynamic(() => import('@/components/analytics/GoogleAnalytics'), {
  loading: () => null,
});

type Messages = AbstractIntlMessages;

const GLOBAL_CLIENT_MESSAGE_KEYS = [
  'accountData',
  'authButton',
  'authDialog',
  'entryForm',
  'forgotPassword',
  'header',
  'login',
  'mobileNav',
  'nav',
  'paywall',
  'pricing',
  'sanctuary',
  'settings',
  'signup',
  'termsModal',
  'trialOffer',
  'writePage',
] as const;

const HOME_HERO_CLIENT_MESSAGE_KEYS = [
  'badge',
  'title',
  'subtitle',
  'helper',
  'helperWithDraft',
  'cta',
  'ctaContinueDraft',
  'ctaSecondary',
  'ctaSecondaryGuest',
  'ctaAuthenticated',
  'ctaSecondaryAuthenticated',
  'languagesBadge',
  'languages',
  'trust',
  'placeholders',
] as const;

const HOME_MARKETING_CLIENT_MESSAGE_KEYS = [
  'floatingCta',
  'returningUser',
] as const;

function pickMessageKeys(
  messages: Messages,
  namespace: string,
  keys: readonly string[]
): Messages[string] | undefined {
  const source = messages[namespace];
  if (!source || typeof source !== 'object' || Array.isArray(source)) return undefined;

  return Object.fromEntries(
    keys
      .filter((key) => key in source)
      .map((key) => [key, (source as Record<string, unknown>)[key]])
  ) as Messages[string];
}

function selectClientMessages(messages: Messages, pathname: string): Messages {
  const keys = new Set<string>(GLOBAL_CLIENT_MESSAGE_KEYS);
  const selected: Messages = {};

  if (pathname === '/') {
    const heroMessages = pickMessageKeys(messages, 'hero', HOME_HERO_CLIENT_MESSAGE_KEYS);
    const marketingMessages = pickMessageKeys(
      messages,
      'marketingPage',
      HOME_MARKETING_CLIENT_MESSAGE_KEYS
    );
    if (heroMessages) selected.hero = heroMessages;
    if (marketingMessages) selected.marketingPage = marketingMessages;
  }

  if (pathname.startsWith('/login')) keys.add('login');
  if (pathname.startsWith('/signup')) keys.add('signup');
  if (pathname.startsWith('/forgot-password')) keys.add('forgotPassword');
  if (pathname.startsWith('/pricing')) {
    keys.add('pricing');
    keys.add('trialOffer');
  }
  if (pathname.startsWith('/settings')) keys.add('settings');
  if (pathname.startsWith('/account/data')) keys.add('accountData');
  if (pathname.startsWith('/sanctuary')) {
    keys.add('sanctuary');
    keys.add('writePage');
    keys.add('entryForm');
  }

  for (const key of keys) {
    if (key in messages) selected[key] = messages[key];
  }

  return selected;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const alternates = buildAlternates("/", locale);

  const title = isFr
    ? "Aurum | Journal privé guidé pour les pensées qui reviennent"
    : "Aurum Diary | Private guided journal for thoughts that keep coming back";
  const description = isFr
    ? "Écris ce qui tourne en boucle. Aurum est un journal privé guidé pour clarifier ce que tu ressens et mieux comprendre les schémas qui reviennent."
    : "Write what keeps looping. Aurum is a private guided journal for emotional clarity, recurring patterns, and the thoughts you cannot seem to leave alone.";
  const ogTitle = isFr
    ? "Aurum | Journal privé guidé pour les pensées qui reviennent"
    : "Aurum Diary | Private guided journal for thoughts that keep coming back";
  const ogDescription = isFr
    ? "Écris ce qui revient avant que ça prenne toute la place."
    : "Write what keeps coming back before it takes all the space.";

  return {
    title,
    description,
    icons: {
      icon: [
        { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
      shortcut: ["/icons/icon-192x192.png"],
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: alternates.canonical,
      siteName: "Aurum Diary",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Aurum Diary",
        },
      ],
      locale: openGraphLocale(locale),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: ["/og-image.png"],
    },
    alternates,
    metadataBase: new URL(SITE_URL),
  };
}

export const viewport: Viewport = {
  themeColor: "#1c1917",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const messages = await getMessages();
  const headerStore = await headers();
  const pathname = headerStore.get('x-aurum-path') || '/';
  const clientMessages = selectClientMessages(messages as Messages, pathname);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Aurum',
    description: isFr
      ? "Un journal privé guidé pour écrire ce qui revient et mieux voir les schémas qui prennent de la place."
      : "A private guided journal for writing what keeps coming back and seeing recurring patterns more clearly.",
    applicationCategory: ['LifestyleApplication', 'ProductivityApplication'],
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: String(PUBLIC_PRICING.monthlyAmount),
      priceCurrency: PUBLIC_PRICING.currencyCode,
    },
    featureList: isFr
      ? [
          "Espace de réflexion privée chiffré en AES-256",
          "Écriture privée pour clarifier ce que l'on vit",
          "Motifs récurrents visibles dans le temps",
          "Suivi des émotions et de leur évolution",
          "Alternative privée à Rosebud",
        ]
      : [
          "AES-256 encrypted private reflection space",
          "Private writing for clearer reflection",
          "Recurring patterns visible over time",
          "Mood and emotion tracking",
          "Private alternative to Rosebud",
        ]
  };

  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <head>
        <Script id="gtm-init" strategy="lazyOnload">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Le script GSI est maintenant dans GoogleAnalytics.tsx */}
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased",
          inter.variable,
          cormorant.variable,
          dawning.variable
        )}
        suppressHydrationWarning={true}
      >
        <noscript>
          <iframe
            title="Google Tag Manager"
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <NextIntlClientProvider locale={locale} messages={clientMessages}>
          <AuthProvider>
            <ThemeSync />
            <TermsModal />
            <Suspense fallback={null}>
              <GoogleAnalytics />
              <ProductEventTracker />
            </Suspense>
            {children}
            <Toaster />
            <CookieConsent />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

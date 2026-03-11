
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/providers/auth-provider';
import { Suspense } from 'react';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import ProductEventTracker from '@/components/analytics/ProductEventTracker';
import { CookieConsent } from '@/components/legal/CookieConsent';
import { TermsModal } from '@/components/auth/TermsModal';
import { getRequestLocale } from '@/lib/locale-server';
import { PUBLIC_PRICING } from '@/lib/billing/config';
import { NextIntlClientProvider } from 'next-intl';
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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";

  const title = isFr
    ? "Aurum Diary | Réflexion privée guidée pour plus de clarté émotionnelle"
    : "Aurum Diary | Private AI-guided reflection for emotional clarity";
  const description = isFr
    ? "Aurum Diary est un compagnon de réflexion privée guidée par IA pour écrire librement, clarifier tes émotions et faire émerger les motifs intérieurs qui reviennent dans le temps."
    : "Aurum Diary is a private AI-guided reflection companion that helps you write freely, clarify emotions, and uncover recurring inner patterns over time.";
  const ogTitle = isFr
    ? "Aurum Diary | Un compagnon privé de réflexion pour plus de clarté émotionnelle"
    : "Aurum Diary | A private AI reflection companion for emotional clarity";
  const ogDescription = isFr
    ? "Écris librement en privé, reçois une réflexion guidée par IA, et remarque les motifs intérieurs qui reviennent."
    : "Write freely in private, receive AI-guided reflection, and notice recurring inner patterns over time.";

  return {
    title,
    description,
    manifest: "/manifest.json",
    icons: {
      icon: [
        { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
      shortcut: ["/icons/icon-192x192.png"],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Aurum",
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: "https://aurumdiary.com",
      siteName: "Aurum Diary",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Aurum Diary",
        },
      ],
      locale: isFr ? "fr_FR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: isFr
        ? "Réflexion privée guidée par IA pour plus de clarté émotionnelle et des motifs récurrents."
        : "Private AI-guided reflection for emotional clarity and recurring inner patterns.",
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: "https://aurumdiary.com",
      languages: {
        en: "https://aurumdiary.com",
        fr: "https://aurumdiary.com/fr",
      },
    },
    metadataBase: new URL("https://aurumdiary.com"),
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Aurum',
    description: isFr
      ? "Un compagnon de réflexion privée guidée par IA pour écrire librement, clarifier ses émotions et faire émerger des motifs intérieurs récurrents."
      : "A private AI-guided reflection companion that helps users write freely, clarify emotions, and uncover recurring inner patterns over time.",
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
          "Réflexion guidée par IA pour la clarté émotionnelle",
          "Motifs intérieurs récurrents visibles dans le temps",
          "Suivi des émotions et de leur évolution",
          "Alternative privée à Rosebud",
        ]
      : [
          "AES-256 encrypted private reflection space",
          "AI-guided reflection for emotional clarity",
          "Recurring inner pattern discovery over time",
          "Mood and emotion tracking",
          "Private alternative to Rosebud",
        ]
  };

  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta name="mobile-web-app-capable" content="yes" />
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
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
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

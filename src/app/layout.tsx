
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/providers/auth-provider';
import { Suspense } from 'react';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import { CookieConsent } from '@/components/legal/CookieConsent';
import { TermsModal } from '@/components/auth/TermsModal';

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

export const metadata: Metadata = {
  title: 'Aurum – Journal Intime en Ligne & Application de Journaling | Bien-être Mental',
  description: 'Aurum est l\'application de journaling pour gérer votre charge mentale, comprendre vos émotions et réduire le stress. Journal intime en ligne 100% chiffré. Essayez gratuitement.',
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Aurum",
  },
  openGraph: {
    title: 'Aurum – Journal Intime en Ligne & Application de Journaling | Bien-être Mental',
    description: 'Aurum est l\'application de journaling pour gérer votre charge mentale, comprendre vos émotions et réduire le stress. Journal intime en ligne 100% chiffré. Essayez gratuitement.',
    url: 'https://aurumdiary.com',
    siteName: 'Aurum Sanctuary',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Aurum Sanctuary Banner',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aurum – Journal Intime en Ligne & Application de Journaling | Bien-être Mental',
    description: 'Aurum est l\'application de journaling pour gérer votre charge mentale, comprendre vos émotions et réduire le stress. Journal intime en ligne 100% chiffré. Essayez gratuitement.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://aurumdiary.com',
  },
  metadataBase: new URL('https://aurumdiary.com'),
};

export const viewport: Viewport = {
  themeColor: "#1c1917",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Aurum',
    applicationCategory: ['HealthApplication', 'LifestyleApplication'],
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    featureList: [
      "Journal intime en ligne chiffré AES-256",
      "Gestion de la charge mentale",
      "Suivi des émotions et de l'humeur",
      "Journal guidé avec intelligence artificielle",
      "Alternative privée à Rosebud"
    ]
  };

  return (
    <html lang="fr" suppressHydrationWarning={true}>
      <head>
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
        <AuthProvider>
          <TermsModal />
          <Suspense fallback={null}>
            <GoogleAnalytics />
          </Suspense>
          {children}
          <Toaster />
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  );
}

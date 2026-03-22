
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/providers/auth-provider';
import { Suspense } from 'react';
import Script from 'next/script';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import ProductEventTracker from '@/components/analytics/ProductEventTracker';
import { CookieConsent } from '@/components/legal/CookieConsent';
import { TermsModal } from '@/components/auth/TermsModal';
import { ThemeSync } from '@/components/theme/ThemeSync';
import ServiceWorkerRefresh from '@/components/pwa/ServiceWorkerRefresh';
import { getRequestLocale } from '@/lib/locale-server';
import { PUBLIC_PRICING } from '@/lib/billing/config';
import { buildAlternates, openGraphLocale, SITE_URL } from '@/lib/seo';
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

const GTM_CONTAINER_ID = 'GTM-WNDQPP94';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const alternates = buildAlternates("/", locale);

  const title = isFr
    ? "Aurum Diary | Écriture privée et lecture psychologique profonde"
    : "Aurum Diary | Private writing and deep psychological reflection";
  const description = isFr
    ? "Aurum Diary est un espace d'écriture privé qui aide à voir plus clairement ce qui se répète, se contredit, se protège, ou reste sans se dire dans le temps."
    : "Aurum Diary is a private writing space that helps you see more clearly what repeats, contradicts itself, protects itself, or stays unspoken over time.";
  const ogTitle = isFr
    ? "Aurum Diary | Écriture privée et lecture psychologique profonde"
    : "Aurum Diary | Private writing and deep psychological reflection";
  const ogDescription = isFr
    ? "Écris librement en privé et reçois une lecture psychologique profonde de ce qui revient dans tes mots."
    : "Write freely in private and receive a deep psychological reading of what keeps returning in your words.";

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
      description: isFr
        ? "Écriture privée et lecture psychologique profonde pour plus de clarté émotionnelle."
        : "Private writing and deep psychological reflection for emotional clarity.",
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Aurum',
    description: isFr
      ? "Un espace d'écriture privé qui aide à voir plus clairement ce qui se répète, se contredit, se protège, ou reste sans se dire."
      : "A private writing space that helps users see more clearly what repeats, contradicts itself, protects itself, or stays unspoken.",
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
          "Lecture psychologique profonde pour plus de clarté émotionnelle",
          "Motifs intérieurs récurrents visibles dans le temps",
          "Suivi des émotions et de leur évolution",
          "Alternative privée à Rosebud",
        ]
      : [
          "AES-256 encrypted private reflection space",
          "Deep psychological reflection for emotional clarity",
          "Recurring inner pattern discovery over time",
          "Mood and emotion tracking",
          "Private alternative to Rosebud",
        ]
  };

  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <head>
        <Script id="gtm-init" strategy="beforeInteractive">
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
        <noscript>
          <iframe
            title="Google Tag Manager"
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <ThemeSync />
            <TermsModal />
            <Suspense fallback={null}>
              <GoogleAnalytics />
              <ProductEventTracker />
            </Suspense>
            <ServiceWorkerRefresh />
            {children}
            <Toaster />
            <CookieConsent />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

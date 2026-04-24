/** @type {import('next').NextConfig} */
const cspReportOnly = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com https://accounts.google.com https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://api.deepseek.com https://www.google-analytics.com https://region1.google-analytics.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebasestorage.googleapis.com https://*.googleapis.com https://*.gstatic.com https://api.stripe.com",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://accounts.google.com",
    "worker-src 'self' blob:",
].join("; ");

const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'picsum.photos',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
                pathname: '/**',
            },
        ],
    },
    async redirects() {
        return [
            {
                source: '/legal/terms',
                destination: '/terms',
                permanent: true,
            },
            {
                source: '/legal/privacy',
                destination: '/privacy',
                permanent: true,
            },
            {
                source: '/fr/legal/terms',
                destination: '/fr/terms',
                permanent: true,
            },
            {
                source: '/fr/legal/privacy',
                destination: '/fr/privacy',
                permanent: true,
            },
        ];
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()'
                    },
                    {
                        key: 'Content-Security-Policy-Report-Only',
                        value: cspReportOnly,
                    },
                ],
            },
        ];
    },
};

const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const runtimeCaching = [
    {
        urlPattern: /^https?:\/\/.*\/api\/.*/i,
        handler: "NetworkOnly",
        method: "GET",
    },
    {
        urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
            cacheName: "google-fonts-webfonts",
            expiration: {
                maxEntries: 4,
                maxAgeSeconds: 60 * 60 * 24 * 365,
            },
        },
    },
    {
        urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
            cacheName: "google-fonts-stylesheets",
            expiration: {
                maxEntries: 4,
                maxAgeSeconds: 60 * 60 * 24 * 7,
            },
        },
    },
    {
        urlPattern: /\/_next\/static\/.+\.(?:js|css)$/i,
        handler: "CacheFirst",
        options: {
            cacheName: "next-static-assets",
            expiration: {
                maxEntries: 64,
                maxAgeSeconds: 60 * 60 * 24,
            },
        },
    },
    {
        urlPattern: /\/_next\/image\?url=.+$/i,
        handler: "StaleWhileRevalidate",
        options: {
            cacheName: "next-image-assets",
            expiration: {
                maxEntries: 64,
                maxAgeSeconds: 60 * 60 * 24,
            },
        },
    },
    {
        urlPattern: /\.(?:png|jpg|jpeg|gif|svg|ico|webp)$/i,
        handler: "StaleWhileRevalidate",
        options: {
            cacheName: "static-image-assets",
            expiration: {
                maxEntries: 64,
                maxAgeSeconds: 60 * 60 * 24 * 30,
            },
        },
    },
    {
        urlPattern: /\.(?:woff|woff2|ttf|otf)$/i,
        handler: "CacheFirst",
        options: {
            cacheName: "static-font-assets",
            expiration: {
                maxEntries: 16,
                maxAgeSeconds: 60 * 60 * 24 * 30,
            },
        },
    },
    {
        urlPattern: /\.(?:json|xml|csv)$/i,
        handler: "NetworkFirst",
        options: {
            cacheName: "static-data-assets",
            expiration: {
                maxEntries: 32,
                maxAgeSeconds: 60 * 60 * 24,
            },
        },
    },
    {
        urlPattern: ({ sameOrigin, url }) =>
            sameOrigin &&
            !url.pathname.startsWith("/api/") &&
            !url.pathname.startsWith("/_next/"),
        handler: "NetworkOnly",
        method: "GET",
    },
];

const withPWA = require("@ducanh2912/next-pwa").default({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
    dynamicStartUrl: false,
    extendDefaultRuntimeCaching: false,
    workboxOptions: {
        runtimeCaching,
    },
});

module.exports = withPWA(withNextIntl(nextConfig));

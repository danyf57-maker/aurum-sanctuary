/** @type {import('next').NextConfig} */
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
        ],
    },
};

const withPWA = require("@ducanh2912/next-pwa").default({
    dest: "public",
    disable: false, // process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
});

module.exports = withPWA(nextConfig);

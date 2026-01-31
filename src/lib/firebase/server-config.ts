import 'server-only';

// Runtime tripwire - fail fast if imported in browser
if (typeof window !== 'undefined') {
    throw new Error('🚨 firebase-admin imported in browser context');
}

import { initializeApp, getApps, getApp, App, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore as getAdminFirestore, Firestore } from "firebase-admin/firestore";

// Server-only constants
export const ALMA_EMAIL = 'alma.lawson@aurum.inc';

// This is a workaround for Vercel when serializing service account credentials
// We lazily parse this to prevent top-level crashes if the env var is missing
// Supports both base64-encoded (recommended for prod) and direct JSON (dev fallback)
function getServiceAccount(): ServiceAccount {
    try {
        // Try base64 first (recommended for production - avoids quote/newline issues)
        const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_B64;
        if (b64) {
            const json = Buffer.from(b64, 'base64').toString('utf8');
            return JSON.parse(json);
        }

        // Fallback to direct JSON string (dev compatibility)
        const directJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (directJson) {
            return JSON.parse(directJson);
        }

        console.warn("Missing FIREBASE_SERVICE_ACCOUNT_KEY. Returning mock for build.");
        return {
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mock-project',
            clientEmail: 'mock@example.com',
            privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD0\n-----END PRIVATE KEY-----\n',
        };
    } catch (e) {
        console.warn("Failed to parse Firebase service account credentials. Returning mock.");
        return {
            projectId: 'mock-project',
            clientEmail: 'mock@example.com',
            privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD0\n-----END PRIVATE KEY-----\n',
        };
    }
}

function getAdminApp(): App {
    try {
        if (getApps().some(app => app.name === 'admin')) {
            return getApp('admin');
        }
        return initializeApp({
            credential: cert(getServiceAccount())
        }, 'admin');
    } catch (e) {
        console.warn("Returing Mock App for build due to init failure:", e);
        return { name: 'admin-mock', options: {} } as App;
    }
}

function getDb(): Firestore {
    return getAdminFirestore(getAdminApp());
}


let db: Firestore;
try {
    db = getDb();
} catch (e) {
    console.warn("Failed to initialize Admin Firestore (likely build mode without keys):", e);
    // Return a mock object or casted empty object to allow build to proceed
    // This will clearly fail if used at runtime, but allows static generation imports
    db = {} as Firestore;
}

export { getAdminApp, db };

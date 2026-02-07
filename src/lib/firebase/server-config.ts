import 'server-only';

// Runtime tripwire - fail fast if imported in browser
if (typeof window !== 'undefined') {
    throw new Error('🚨 firebase-admin imported in browser context');
}

import { initializeApp, getApps, getApp, App, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore as getAdminFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth as getAdminAuth, Auth } from "firebase-admin/auth";

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

        // Try to use explicit service account credentials (for local dev)
        // If not available, let Firebase use Application Default Credentials (for Firebase App Hosting)
        const hasExplicitCredentials = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT_KEY_B64;

        if (hasExplicitCredentials) {
            return initializeApp({
                credential: cert(getServiceAccount())
            }, 'admin');
        } else {
            // Firebase App Hosting provides credentials automatically via ADC
            console.log("Using Application Default Credentials (Firebase App Hosting)");
            return initializeApp({}, 'admin');
        }
    } catch (e) {
        console.warn("Returing Mock App for build due to init failure:", e);
        return { name: 'admin-mock', options: {} } as App;
    }
}

function getDb(): Firestore {
    return getAdminFirestore(getAdminApp());
}

/**
 * Robust Proxy Mock for Firestore/Auth
 * Prevents "undefined is not a function" errors when Firebase is not initialized.
 */
function createMock(name: string) {
    return new Proxy({}, {
        get: (target, prop) => {
            if (prop === 'collection' || prop === 'doc' || prop === 'collectionGroup') {
                return () => createMock('Firestore');
            }
            if (prop === 'add' || prop === 'set' || prop === 'update' || prop === 'delete' || prop === 'get') {
                return () => Promise.resolve({ id: 'mock-id', exists: false, data: () => ({}) });
            }
            if (prop === 'name') return 'admin-mock';
            if (prop === 'createSessionCookie') return () => Promise.resolve('mock-session-cookie');
            if (prop === 'verifyIdToken') return () => Promise.resolve({ uid: 'mock-uid' });
            if (prop === 'verifySessionCookie') return () => Promise.resolve({ uid: 'mock-uid' });
            return undefined;
        }
    }) as any;
}

let db: Firestore;
let auth: Auth;

try {
    const app = getAdminApp();
    if (app.name === 'admin-mock') {
        db = createMock('Firestore');
        auth = createMock('Auth');
    } else {
        db = getAdminFirestore(app);
        auth = getAdminAuth(app);
    }
} catch (e) {
    console.warn("Failed to initialize Admin Services (likely build mode without keys):", e);
    db = createMock('Firestore');
    auth = createMock('Auth');
}

export { getAdminApp, db, auth, db as firestore };

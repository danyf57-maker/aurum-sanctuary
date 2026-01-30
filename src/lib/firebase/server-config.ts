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

        throw new Error('Neither FIREBASE_SERVICE_ACCOUNT_KEY_B64 nor FIREBASE_SERVICE_ACCOUNT_KEY is set');
    } catch (e) {
        console.warn("Failed to parse Firebase service account credentials");
        throw e;
    }
}

function getAdminApp(): App {
    if (getApps().some(app => app.name === 'admin')) {
        return getApp('admin');
    }
    return initializeApp({
        credential: cert(getServiceAccount())
    }, 'admin');
}

function getDb(): Firestore {
    return getAdminFirestore(getAdminApp());
}

const db: Firestore = getDb();

export { getAdminApp, db };

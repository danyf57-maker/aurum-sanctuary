/**
 * Firebase Admin SDK
 * 
 * Server-side Firebase initialization for API Routes and Server Components.
 * Used for: Admin operations, Firestore writes, user management
 * 
 * IMPORTANT: Never import this in client components.
 * Use web-client.ts for client-side operations.
 */

import 'server-only';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
let auth: Auth;
let firestore: Firestore;

/**
 * Initialize Firebase Admin SDK
 * 
 * Uses service account key from environment variable.
 * Supports both JSON string and base64-encoded JSON.
 */
function initializeFirebaseAdmin() {
    if (getApps().length > 0) {
        // Already initialized
        return getApps()[0];
    }

    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
        throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable');
    }

    let serviceAccount: any;

    try {
        // Try parsing as JSON string
        serviceAccount = JSON.parse(serviceAccountKey);
    } catch {
        try {
            // Try decoding from base64
            const decoded = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
            serviceAccount = JSON.parse(decoded);
        } catch {
            throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY format. Must be JSON or base64-encoded JSON.');
        }
    }

    return initializeApp({
        credential: cert(serviceAccount),
    });
}

// Initialize on first import, but handle missing env vars gracefully to prevent build/start crashes
try {
    app = initializeFirebaseAdmin();
    auth = getAuth(app);
    firestore = getFirestore(app);

    // Configure Firestore settings
    firestore.settings({
        ignoreUndefinedProperties: true, // Ignore undefined values in writes
    });
} catch (error) {
    console.warn("Firebase Admin failed to initialize (likely missing env vars). Server features will break at runtime.", error);
    // @ts-ignore
    app = null;
    // @ts-ignore
    auth = null;
    // @ts-ignore
    firestore = null;
}

export { app, auth, firestore };

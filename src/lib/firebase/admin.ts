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
        return getApps()[0];
    }

    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    let serviceAccount: any;

    if (!serviceAccountKey) {
        console.warn('Missing FIREBASE_SERVICE_ACCOUNT_KEY env var. Returning Mock App for build.');
        return { name: '[DEFAULT]-mock', options: {} } as App;
    }

    try {
        serviceAccount = JSON.parse(serviceAccountKey);
    } catch {
        try {
            const decoded = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
            serviceAccount = JSON.parse(decoded);
        } catch {
            throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY format.');
        }
    }

    return initializeApp({
        credential: cert(serviceAccount),
    });
}

// Initialize on first import, but handle missing env vars gracefully to prevent build/start crashes
// Initialize on first import, but handle missing env vars gracefully to prevent build/start crashes
try {
    app = initializeFirebaseAdmin();
    auth = getAuth(app);
    firestore = getFirestore(app);

    // Configure Firestore settings
    if (firestore && typeof firestore.settings === 'function') {
        firestore.settings({
            ignoreUndefinedProperties: true, // Ignore undefined values in writes
        });
    }
} catch (error) {
    console.warn("Firebase Admin failed to initialize (likely missing env vars). Using PROXY MOCKS for build.", error);

    // Create a robust mock that accepts any call without crashing
    const createMock = (name: string) => new Proxy({}, {
        get: (target, prop) => {
            if (prop === 'then') return undefined; // Promise safety
            if (prop === 'settings') return () => { }; // Specific fix for usage above
            if (prop === 'getOrInitService') return () => ({}); // Fix for firebase-admin internal calls
            if (prop === 'INTERNAL') return {}; // Common internal SDK check
            if (prop === 'options') return {}; // App options
            if (prop === 'name') return '[DEFAULT]-mock';
            return (...args: any[]) => {
                console.warn(`Mock ${name}.${String(prop)} called. Ignoring.`);
                return undefined;
            };
        }
    });

    // @ts-ignore
    app = createMock('App');
    // @ts-ignore
    auth = createMock('Auth');
    // @ts-ignore
    firestore = createMock('Firestore');
}

export { app, auth, firestore };

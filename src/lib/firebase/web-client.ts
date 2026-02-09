/**
 * Firebase Web Client SDK
 * 
 * Client-side Firebase initialization for browser/React components.
 * Used for: Auth, Firestore client operations
 * 
 * IMPORTANT: Never import this in Server Components or API Routes.
 * Use admin.ts for server-side operations.
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';
import { logger } from '@/lib/logger/safe';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const hasRequiredConfig = Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
);
const isBrowser = typeof window !== 'undefined';
const isFirebaseWebClientEnabled = isBrowser && hasRequiredConfig;

// Initialize Firebase (singleton pattern)
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let functions: Functions;

if (isFirebaseWebClientEnabled) {
    // Client-side only
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    firestore = getFirestore(app);
    functions = getFunctions(app, 'us-central1'); // Region is important
} else {
    // Export typed placeholders to avoid import-time crashes in auth-disabled mode.
    app = {} as FirebaseApp;
    auth = {} as Auth;
    firestore = {} as Firestore;
    functions = {} as Functions;
}

if (isBrowser && !hasRequiredConfig) {
    logger.warnSafe('Firebase web client disabled: missing NEXT_PUBLIC_FIREBASE_* config');
}

export { app, auth, firestore, functions, isFirebaseWebClientEnabled };

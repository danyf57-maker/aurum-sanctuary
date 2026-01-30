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

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate required config
const requiredConfigKeys = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
] as const;

for (const key of requiredConfigKeys) {
    if (!firebaseConfig[key]) {
        throw new Error(`Missing Firebase config: NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`);
    }
}

// Initialize Firebase (singleton pattern)
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

if (typeof window !== 'undefined') {
    // Client-side only
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    firestore = getFirestore(app);
}

export { app, auth, firestore };

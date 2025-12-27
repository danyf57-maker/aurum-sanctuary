"use client";

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp;
if (typeof window !== 'undefined') {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} else {
    // On the server, we need a different approach.
    // However, this config is client-side only.
    // So we can create a placeholder or ensure it's not used server-side.
    app = {} as FirebaseApp;
}


// It's safe to use empty objects on the server
const auth: Auth = typeof window !== 'undefined' ? getAuth(app!) : ({} as Auth);
const db: Firestore = typeof window !== 'undefined' ? getFirestore(app!) : ({} as Firestore);

export { app, auth, db };

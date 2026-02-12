/**
 * Centralized Firebase Admin initialization
 * Import this file in all Cloud Functions to avoid duplicate initialization errors
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin once
if (!admin.apps.length) {
    admin.initializeApp();
}

export const firestore = admin.firestore();
export { admin };

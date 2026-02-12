/**
 * Cloud Function: onUserCreate
 * 
 * Auth Trigger: onCreate user
 * 
 * 1. Creates the user document in Firestore (users/{uid})
 *    - This is SERVER-SIDE creation to enforce Admin-Blind architecture.
 *    - The root user doc is READ-ONLY for the client.
 * 2. Initializes default settings (users/{uid}/settings/preferences)
 * 3. Initializes legal acceptance state (users/{uid}/settings/legal)
 * 4. Initializes DerivedMemoryLite (users/{uid}/derivedMemory/lite)
 */

import * as functions from 'firebase-functions';
import { admin, firestore } from './admin';

/**
 * onCreate auth trigger
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
    const uid = user.uid;
    const email = user.email;
    const displayName = user.displayName;
    const photoURL = user.photoURL;

    try {
        const batch = firestore.batch();
        const timestamp = admin.firestore.FieldValue.serverTimestamp();

        // 1. Create Root User Document (Read-Only for Client)
        const userRef = firestore.doc(`users/${uid}`);
        batch.set(userRef, {
            uid,
            email,
            displayName,
            photoURL,
            createdAt: timestamp,
            stripeCustomerId: null,
            subscriptionStatus: 'free',
            entryCount: 0,
        });

        // 2. Initialize Preferences
        const prefsRef = firestore.doc(`users/${uid}/settings/preferences`);
        batch.set(prefsRef, {
            theme: 'system',
            language: 'fr',
            timezone: 'Europe/Paris', // Default, should be updated by client later
        });

        // 3. Initialize Legal Settings (Writable by Client)
        const legalRef = firestore.doc(`users/${uid}/settings/legal`);
        batch.set(legalRef, {
            termsAccepted: false,
            termsAcceptedAt: null,
            updatedAt: timestamp,
        });

        // 4. Initialize DerivedMemoryLite
        const memoryRef = firestore.doc(`users/${uid}/derivedMemory/lite`);
        batch.set(memoryRef, {
            totalEntries: 0,
            avgWordsPerEntry: 0,
            lastEntryAt: null,
            labels: [],
            updatedAt: timestamp,
        });

        await batch.commit();

        console.log(`✅ User document structure initialized for: ${uid}`);
    } catch (error) {
        console.error(`❌ Failed to initialize user structure for: ${uid}`, error);
        // We throw to alert Firebase that the function failed, 
        // though Auth creation itself cannot be rolled back easily.
        throw error;
    }
});

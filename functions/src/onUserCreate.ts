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

function readTrialDays(): number {
    const raw = process.env.APP_TRIAL_DAYS || process.env.STRIPE_TRIAL_DAYS || '7';
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed < 0) return 7;
    return parsed;
}

function sanitizeFirstName(value?: string | null): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    return trimmed.replace(/\s+/g, ' ').slice(0, 40);
}

function extractFirstName(displayName?: string | null): string | null {
    const cleaned = sanitizeFirstName(displayName);
    if (!cleaned) return null;
    const [firstPart] = cleaned.split(' ');
    return firstPart || null;
}

/**
 * onCreate auth trigger
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
    const uid = user.uid;
    const email = user.email;
    const displayName = user.displayName;
    const photoURL = user.photoURL;
    const firstName = extractFirstName(displayName);

    try {
        const batch = firestore.batch();
        const timestamp = admin.firestore.FieldValue.serverTimestamp();
        const now = new Date();
        const trialDays = readTrialDays();
        const trialEndsAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

        // 1. Create Root User Document (Read-Only for Client)
        const userRef = firestore.doc(`users/${uid}`);
        batch.set(userRef, {
            uid,
            email,
            firstName,
            displayName,
            photoURL,
            createdAt: timestamp,
            stripeCustomerId: null,
            subscriptionStatus: 'trialing',
            trialStartedAt: admin.firestore.Timestamp.fromDate(now),
            subscriptionTrialEndsAt: admin.firestore.Timestamp.fromDate(trialEndsAt),
            trialConsumedAt: timestamp,
            billingPhase: 'trial_started',
            trialOrigin: 'app_no_card',
            entryCount: 0,
        }, { merge: true });

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

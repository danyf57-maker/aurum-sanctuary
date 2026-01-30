/**
 * Cloud Function: onEntryCreate
 * 
 * Firestore Trigger: onCreate users/{uid}/entries/{entryId}
 * 
 * Updates DerivedMemoryLite stats when a new entry is created.
 * This keeps the stats current for Mirror Chat without full processing.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
    admin.initializeApp();
}

const firestore = admin.firestore();

/**
 * Count words in text
 */
function countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * onCreate trigger for entries subcollection
 * 
 * Updates derivedMemory/lite stats:
 * - totalEntries
 * - avgWordsPerEntry
 * - lastEntryAt
 */
export const onEntryCreate = functions.firestore
    .document('users/{uid}/entries/{entryId}')
    .onCreate(async (snap, context) => {
        const uid = context.params.uid;
        const entryData = snap.data();

        try {
            // Get current derivedMemory/lite
            const derivedMemoryRef = firestore.doc(`users/${uid}/derivedMemory/lite`);
            const derivedMemorySnap = await derivedMemoryRef.get();

            if (!derivedMemorySnap.exists) {
                // Initialize if doesn't exist (shouldn't happen, but defensive)
                await derivedMemoryRef.set({
                    totalEntries: 1,
                    avgWordsPerEntry: 0, // Can't calculate without decrypting
                    lastEntryAt: entryData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
                    labels: [],
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                return;
            }

            const currentData = derivedMemorySnap.data()!;
            const newTotalEntries = (currentData.totalEntries || 0) + 1;

            // Update stats (note: avgWordsPerEntry requires decryption, done in Epic 5)
            await derivedMemoryRef.update({
                totalEntries: newTotalEntries,
                lastEntryAt: entryData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log(`✅ DerivedMemoryLite updated for user: ${uid} (totalEntries: ${newTotalEntries})`);
        } catch (error) {
            console.error(`❌ Failed to update DerivedMemoryLite for user: ${uid}`, error);
            // Don't throw - this is non-critical
        }
    });

/**
 * Cloud Function: updateDerivedMemory
 * 
 * Triggered when a new journal entry is created.
 * Updates DerivedMemoryLite with stats (totalEntries, avgWordsPerEntry, lastEntryAt).
 * 
 * Note: Entry content is encrypted client-side. We can't decrypt it server-side
 * without KMS. For V1, we only update stats. Pattern extraction happens client-side.
 */

import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin
initializeApp();
const firestore = getFirestore();

/**
 * Update DerivedMemoryLite when a new entry is created
 */
export const updateDerivedMemory = onDocumentCreated(
    'users/{uid}/entries/{entryId}',
    async (event) => {
        const { uid } = event.params;
        const entry = event.data?.data();

        if (!entry) {
            console.error('No entry data found');
            return;
        }

        try {
            // Reference to derivedMemory/lite document
            const liteRef = firestore.doc(`users/${uid}/derivedMemory/lite`);

            // Update stats (we can't decrypt entry, so we only update counts)
            await liteRef.update({
                totalEntries: FieldValue.increment(1),
                lastEntryAt: entry.createdAt || FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            });

            console.log(`Updated DerivedMemoryLite for user ${uid}`);
        } catch (error) {
            console.error('Error updating DerivedMemoryLite:', error);

            // If document doesn't exist, create it
            if ((error as any).code === 5) { // NOT_FOUND
                try {
                    await firestore.doc(`users/${uid}/derivedMemory/lite`).set({
                        totalEntries: 1,
                        avgWordsPerEntry: 0,
                        lastEntryAt: entry.createdAt || FieldValue.serverTimestamp(),
                        labels: [],
                        updatedAt: FieldValue.serverTimestamp(),
                    });
                    console.log(`Created DerivedMemoryLite for user ${uid}`);
                } catch (createError) {
                    console.error('Error creating DerivedMemoryLite:', createError);
                    throw createError;
                }
            } else {
                throw error;
            }
        }
    }
);

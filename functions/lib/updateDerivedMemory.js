"use strict";
/**
 * Cloud Function: updateDerivedMemory
 *
 * Triggered when a new journal entry is created.
 * Updates DerivedMemoryLite with stats (totalEntries, avgWordsPerEntry, lastEntryAt).
 *
 * Note: Entry content is encrypted client-side. We can't decrypt it server-side
 * without KMS. For V1, we only update stats. Pattern extraction happens client-side.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDerivedMemory = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const firestore_2 = require("firebase-admin/firestore");
const app_1 = require("firebase-admin/app");
// Initialize Firebase Admin
(0, app_1.initializeApp)();
const firestore = (0, firestore_2.getFirestore)();
/**
 * Update DerivedMemoryLite when a new entry is created
 */
exports.updateDerivedMemory = (0, firestore_1.onDocumentCreated)('users/{uid}/entries/{entryId}', async (event) => {
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
            totalEntries: firestore_2.FieldValue.increment(1),
            lastEntryAt: entry.createdAt || firestore_2.FieldValue.serverTimestamp(),
            updatedAt: firestore_2.FieldValue.serverTimestamp(),
        });
        console.log(`Updated DerivedMemoryLite for user ${uid}`);
    }
    catch (error) {
        console.error('Error updating DerivedMemoryLite:', error);
        // If document doesn't exist, create it
        if (error.code === 5) { // NOT_FOUND
            try {
                await firestore.doc(`users/${uid}/derivedMemory/lite`).set({
                    totalEntries: 1,
                    avgWordsPerEntry: 0,
                    lastEntryAt: entry.createdAt || firestore_2.FieldValue.serverTimestamp(),
                    labels: [],
                    updatedAt: firestore_2.FieldValue.serverTimestamp(),
                });
                console.log(`Created DerivedMemoryLite for user ${uid}`);
            }
            catch (createError) {
                console.error('Error creating DerivedMemoryLite:', createError);
                throw createError;
            }
        }
        else {
            throw error;
        }
    }
});
//# sourceMappingURL=updateDerivedMemory.js.map
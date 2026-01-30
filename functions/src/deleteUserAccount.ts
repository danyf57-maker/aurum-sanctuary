/**
 * Deletes a user's account and all associated data.
 * 
 * Logic:
 * 1. Verify authentication.
 * 2. Recursively delete Firestore subcollections (entries, insights, derivedMemory).
 * 3. Delete user document.
 * 4. Cancel Stripe subscription (if any).
 * 5. Delete Firebase Auth account.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Helper function to delete a collection recursively
async function deleteCollection(collectionPath: string, batchSize: number) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(db: FirebaseFirestore.Firestore, query: FirebaseFirestore.Query, resolve: (value?: unknown) => void) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
        // When there are no documents left, we are done
        resolve();
        return;
    }

    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
    });
}

export const deleteUserAccount = functions.https.onCall(async (data, context) => {
    // 1. Verify Authentication
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'The user must be authenticated to delete their account.'
        );
    }

    const uid = context.auth.uid;
    console.log(`Starting account deletion for user: ${uid}`);

    try {
        // 2. Delete Firestore Data
        // We need to clean up subcollections manually as Firestore doesn't cascade delete

        // Delete 'entries' subcollection
        await deleteCollection(`users/${uid}/entries`, 100);
        console.log(`Deleted entries for user: ${uid}`);

        // Delete 'insights' subcollection
        await deleteCollection(`users/${uid}/insights`, 100);
        console.log(`Deleted insights for user: ${uid}`);

        // Delete 'derivedMemory' subcollection (if it exists as a collection) 
        // Usually it's a single doc in a collection or subcollection, based on schema
        await deleteCollection(`users/${uid}/derivedMemory`, 100);

        // delete settings subcollection
        await deleteCollection(`users/${uid}/settings`, 100);

        // Delete the user document itself
        await db.doc(`users/${uid}`).delete();
        console.log(`Deleted user document: ${uid}`);

        // 3. Cancel Stripe Subscription (Placeholder for now)
        // In a real implementation with Stripe, we would retrieve the stripeCustomerId from the user doc (before deleting it)
        // and call stripe.subscriptions.cancel() if active.
        // For now, logging this step.
        console.log(`Check for Stripe subscription cancellation for user: ${uid}`);

        // 4. Delete Firebase Auth Account
        await admin.auth().deleteUser(uid);
        console.log(`Deleted Firebase Auth account: ${uid}`);

        return { success: true, message: 'Account deleted successfully' };

    } catch (error) {
        console.error(`Error deleting account for user ${uid}:`, error);
        throw new functions.https.HttpsError(
            'internal',
            'An error occurred while deleting the account.',
            error
        );
    }
});

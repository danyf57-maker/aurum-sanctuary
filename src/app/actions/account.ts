
"use server";

import { db } from "@/lib/firebase/server-config";
import { auth as adminAuth } from "firebase-admin";

// Helper function to get all documents from a collection for a user
async function getUserCollection(userId: string, collectionName: string) {
    const snapshot = await db.collection(collectionName).where('userId', '==', userId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}


export async function exportUserData(userId: string): Promise<{ data: any | null, error: string | null }> {
    if (!userId) {
        return { data: null, error: "ID utilisateur non fourni." };
    }

    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userProfile = userDoc.exists ? userDoc.data() : {};

        const journalEntries = await getUserCollection(userId, 'entries');

        const exportData = {
            userProfile,
            journalEntries,
        };

        return { data: exportData, error: null };

    } catch (error: any) {
        console.error("Error exporting user data:", error);
        return { data: null, error: "Une erreur est survenue lors de l'exportation de vos données." };
    }
}


export async function deleteUserAccount(userId: string): Promise<{ success: boolean, error: string | null }> {
    if (!userId) {
        return { success: false, error: "ID utilisateur non fourni." };
    }
    
    const batch = db.batch();

    try {
        // 1. Delete journal entries
        const entriesSnapshot = await db.collection('entries').where('userId', '==', userId).get();
        entriesSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        // 2. Delete public posts if any (for Alma user, though it's a good general practice)
        const postsSnapshot = await db.collection('publicPosts').where('userId', '==', userId).get();
        postsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        // 3. Delete user profile document
        const userDocRef = db.collection('users').doc(userId);
        batch.delete(userDocRef);

        // Commit all Firestore deletions
        await batch.commit();
        
        // 4. Delete user from Firebase Authentication
        await adminAuth().deleteUser(userId);

        // Revalidation is not needed as user will be logged out and redirected.

        return { success: true, error: null };

    } catch (error: any) {
        console.error("Error deleting user account:", error);
        // This could be a Firestore or an Auth error.
        return { success: false, error: "Une erreur est survenue lors de la suppression de votre compte." };
    }
}

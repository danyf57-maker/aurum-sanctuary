
"use server";

import { db } from "@/lib/firebase/server-config";
import { auth as adminAuth } from "firebase-admin";
import { checkRateLimit } from '@/lib/ratelimit';
import { logAuditEvent } from '@/lib/audit';

// Helper function to get all documents from a collection for a user
async function getUserCollection(userId: string, collectionName: string) {
    const snapshot = await db.collection(collectionName).where('userId', '==', userId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}


export async function exportUserData(userId: string): Promise<{ data: any | null, error: string | null }> {
    if (!userId) {
        return { data: null, error: "ID utilisateur non fourni." };
    }

    // Rate limiting
    const rateLimit = await checkRateLimit(userId, 'exportUserData');
    if (!rateLimit.allowed) {
        await logAuditEvent(userId, 'RATE_LIMIT_EXCEEDED', { action: 'exportUserData' });
        const resetDate = new Date(rateLimit.resetAt).toLocaleDateString('fr-FR');
        return { data: null, error: `Limite d'exports atteinte. Réessayez après le ${resetDate}.` };
    }

    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userProfile = userDoc.exists ? userDoc.data() : {};

        const journalEntries = await getUserCollection(userId, 'entries');

        const exportData = {
            userProfile,
            journalEntries,
        };

        // Audit logging
        await logAuditEvent(userId, 'DATA_EXPORTED');

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
    
    // Rate limiting
    const rateLimit = await checkRateLimit(userId, 'deleteUserAccount');
    if (!rateLimit.allowed) {
        await logAuditEvent(userId, 'RATE_LIMIT_EXCEEDED', { action: 'deleteUserAccount' });
         const resetDate = new Date(rateLimit.resetAt).toLocaleDateString('fr-FR');
        return { success: false, error: `Trop de tentatives de suppression. Réessayez après le ${resetDate}.` };
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
        
        // 3. Delete rate limits doc
        const rateLimitRef = db.collection('rateLimits').doc(userId);
        batch.delete(rateLimitRef);

        // 4. Delete user profile document
        const userDocRef = db.collection('users').doc(userId);
        batch.delete(userDocRef);

        // Commit all Firestore deletions
        await batch.commit();
        
        // 5. Delete user from Firebase Authentication
        await adminAuth().deleteUser(userId);

        // Audit logging
        await logAuditEvent(userId, 'ACCOUNT_DELETED');

        return { success: true, error: null };

    } catch (error: any) {
        console.error("Error deleting user account:", error);
        return { success: false, error: "Une erreur est survenue lors de la suppression de votre compte." };
    }
}

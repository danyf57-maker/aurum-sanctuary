'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { firestore as db } from '@/lib/firebase/web-client';
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { useEncryption } from './useEncryption';
import { encryptEntry, decryptEntry, EncryptedData } from '@/lib/crypto/encryption';
import { useToast } from './use-toast';

export interface JournalEntry {
    id: string;
    content: string; // Decrypted content for UI
    createdAt: Date;
    updatedAt: Date;
}

export function useJournal() {
    const { user } = useAuth();
    const { key } = useEncryption();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [entries, setEntries] = useState<JournalEntry[]>([]);

    /**
     * Create a new encrypted entry
     */
    const createEntry = async (content: string) => {
        if (!user || !key) {
            throw new Error("User not authenticated or encryption key missing");
        }

        try {
            setLoading(true);

            // 1. Encrypt
            const encryptedData = await encryptEntry(content, key);

            // 2. Upload to Firestore
            // Path: users/{uid}/entries
            const entriesRef = collection(db, 'users', user.uid, 'entries');

            await addDoc(entriesRef, {
                encryptedContent: encryptedData.ciphertext,
                iv: encryptedData.iv,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            // 3. Optimistic update or refetch?
            // For V1, we'll just succeed. Parent can refetch if needed.

            return true;
        } catch (error) {
            console.error("Failed to create entry:", error);
            toast({
                title: "Erreur de sauvegarde",
                description: "Impossible d'enregistrer l'entrée.",
                variant: "destructive"
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Fetch and decrypt all entries
     */
    const fetchEntries = async () => {
        if (!user || !key) return;

        try {
            setLoading(true);
            const entriesRef = collection(db, 'users', user.uid, 'entries');
            // Check indexes later if needed. For now simple orderBy.
            const q = query(entriesRef, orderBy('createdAt', 'desc'));

            const snapshot = await getDocs(q);

            const decryptedEntries: JournalEntry[] = await Promise.all(
                snapshot.docs.map(async (doc) => {
                    const data = doc.data();

                    try {
                        // Decrypt content
                        const encryptedData: EncryptedData = {
                            ciphertext: data.encryptedContent,
                            iv: data.iv,
                        };
                        const content = await decryptEntry(encryptedData, key);

                        return {
                            id: doc.id,
                            content,
                            createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
                            updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
                        };
                    } catch (e) {
                        console.error(`Failed to decrypt entry ${doc.id}`, e);
                        return {
                            id: doc.id,
                            content: "⚠️ Contenu illisible (Erreur de déchiffrement)",
                            createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
                            updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
                        };
                    }
                })
            );

            setEntries(decryptedEntries);
        } catch (error) {
            console.error("Failed to fetch entries:", error);
            toast({
                title: "Erreur de chargement",
                description: "Impossible de récupérer vos entrées.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return {
        createEntry,
        fetchEntries,
        entries,
        loading
    };
}

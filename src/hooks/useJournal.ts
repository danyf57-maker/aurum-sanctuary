'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { firestore as db } from '@/lib/firebase/web-client';
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { useToast } from './use-toast';
import { logger } from '@/lib/logger/safe';
import { useEncryption } from './useEncryption';
import type { EncryptedData } from '@/lib/crypto/encryption';

export interface JournalEntry {
    id: string;
    content: string; // Decrypted content for UI
    createdAt: Date;
    updatedAt: Date;
}

export function useJournal() {
    const { user } = useAuth();
    const { isReady: encryptionReady, encrypt, decrypt } = useEncryption();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [entries, setEntries] = useState<JournalEntry[]>([]);

    /**
     * Create a new entry (AES-256-GCM encrypted)
     */
    const createEntry = async (content: string) => {
        if (!user) {
            throw new Error("User not authenticated");
        }

        if (!encryptionReady) {
            throw new Error("Encryption not ready");
        }

        try {
            setLoading(true);

            // Encrypt content before uploading
            const encryptedData = await encrypt(content);

            const entriesRef = collection(db, 'users', user.uid, 'entries');

            await addDoc(entriesRef, {
                encryptedContent: encryptedData.ciphertext,
                iv: encryptedData.iv,
                version: encryptedData.version,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            return true;
        } catch (error) {
            logger.errorSafe("Failed to create entry", error);
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
     * Fetch all entries (decrypts automatically, backward compatible with plaintext)
     */
    const fetchEntries = async () => {
        if (!user) return;

        if (!encryptionReady) {
            logger.warnSafe("Encryption not ready, skipping fetch");
            return;
        }

        try {
            setLoading(true);
            const entriesRef = collection(db, 'users', user.uid, 'entries');
            const q = query(entriesRef, orderBy('createdAt', 'desc'));

            const snapshot = await getDocs(q);

            // Decrypt entries in parallel
            const entriesPromises = snapshot.docs.map(async (doc) => {
                const data = doc.data();

                let content: string;

                // Check if entry is encrypted
                if (data.encryptedContent && data.iv) {
                    try {
                        const encryptedData: EncryptedData = {
                            ciphertext: data.encryptedContent,
                            iv: data.iv,
                            version: data.version || 1,
                        };
                        content = await decrypt(encryptedData);
                    } catch (decryptError) {
                        logger.errorSafe("Failed to decrypt entry", decryptError);
                        content = '[Erreur de déchiffrement]';
                    }
                } else {
                    // Legacy plaintext entry
                    content = data.content || '[No content]';
                }

                return {
                    id: doc.id,
                    content,
                    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
                    updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
                };
            });

            const entries = await Promise.all(entriesPromises);
            setEntries(entries);
        } catch (error) {
            logger.errorSafe("Failed to fetch entries", error);
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

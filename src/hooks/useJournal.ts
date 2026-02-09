'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { firestore as db } from '@/lib/firebase/web-client';
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { useToast } from './use-toast';
import { logger } from '@/lib/logger/safe';

export interface JournalEntry {
    id: string;
    content: string; // Decrypted content for UI
    createdAt: Date;
    updatedAt: Date;
}

export function useJournal() {
    const { user } = useAuth();
    // TABULA RASA: Pas de chiffrement
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [entries, setEntries] = useState<JournalEntry[]>([]);

    /**
     * Create a new entry (TABULA RASA: plaintext mode)
     */
    const createEntry = async (content: string) => {
        if (!user) {
            throw new Error("User not authenticated");
        }

        try {
            setLoading(true);

            // Upload to Firestore (plaintext)
            const entriesRef = collection(db, 'users', user.uid, 'entries');

            await addDoc(entriesRef, {
                content, // ← PLAINTEXT (temporaire)
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
     * Fetch all entries (TABULA RASA: plaintext mode)
     */
    const fetchEntries = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const entriesRef = collection(db, 'users', user.uid, 'entries');
            const q = query(entriesRef, orderBy('createdAt', 'desc'));

            const snapshot = await getDocs(q);

            const entries: JournalEntry[] = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    content: data.content || '[No content]', // ← PLAINTEXT
                    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
                    updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
                };
            });

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

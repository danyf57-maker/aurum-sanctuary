'use client';

import { useState, useEffect } from 'react';
import { generateKey, exportKey, importKey } from '@/lib/crypto/encryption';
import { useToast } from './use-toast';

const STORAGE_KEY = 'aurum_encryption_key_v1';

export function useEncryption() {
    const [key, setKey] = useState<CryptoKey | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const loadKey = async () => {
            try {
                const storedKey = localStorage.getItem(STORAGE_KEY);

                if (storedKey) {
                    // Import existing key
                    const importedKey = await importKey(storedKey);
                    setKey(importedKey);
                    // console.log('Encryption key loaded from storage');
                } else {
                    // Generate new key
                    const newKey = await generateKey();
                    const exportedKey = await exportKey(newKey);
                    localStorage.setItem(STORAGE_KEY, exportedKey);
                    setKey(newKey);
                    // Encryption key generated and saved

                    toast({
                        title: "Clé de chiffrement générée",
                        description: "Une nouvelle clé privée a été créée sur cet appareil.",
                    });
                }
            } catch (error) {
                console.error('Failed to load/generate encryption key:', error);
                toast({
                    title: "Erreur de chiffrement",
                    description: "Impossible d'initialiser la sécurité. Vos entrées ne peuvent pas être protégées.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        // Only run on client
        if (typeof window !== 'undefined') {
            loadKey();
        }
    }, [toast]);

    /**
     * For debugging/development: Clear local key
     * WARNING: This loses access to all data encrypted with this key
     */
    const rotateKey = async () => {
        // In a real app, this would need re-encryption of all data
        if (!confirm("Attention : Générer une nouvelle clé rendra vos anciennes entrées illisibles pour toujours sur cet appareil. Continuer (Dev only) ?")) {
            return;
        }
        try {
            const newKey = await generateKey();
            const exportedKey = await exportKey(newKey);
            localStorage.setItem(STORAGE_KEY, exportedKey);
            setKey(newKey);
            toast({ title: "Clé changée (Dev)" });
        } catch (e) {
            console.error(e);
        }
    };

    return { key, loading, rotateKey };
}

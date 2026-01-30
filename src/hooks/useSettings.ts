'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/web-client';
import { useAuth } from '@/providers/auth-provider';
import { logger } from '@/lib/logger/safe';
import { useToast } from '@/hooks/use-toast';

export interface UserPreferences {
    notificationsEnabled: boolean;
    theme: 'light' | 'dark' | 'system';
    language: 'en' | 'fr';
    timezone: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
    notificationsEnabled: true,
    theme: 'system',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

export function useSettings() {
    const { user } = useAuth();
    const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const prefsRef = doc(firestore, 'users', user.uid, 'settings', 'preferences');

        const unsubscribe = onSnapshot(prefsRef, (docSnap) => {
            if (docSnap.exists()) {
                setPreferences({ ...DEFAULT_PREFERENCES, ...docSnap.data() } as UserPreferences);
            } else {
                // Initialize default preferences if they don't exist
                setDoc(prefsRef, {
                    ...DEFAULT_PREFERENCES,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                }, { merge: true }).catch(err => {
                    logger.errorSafe('Failed to initialize preferences', err);
                });
            }
            setLoading(false);
        }, (error) => {
            logger.errorSafe('Error listening to preferences', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
        if (!user) return;

        try {
            const prefsRef = doc(firestore, 'users', user.uid, 'settings', 'preferences');

            // Optimistic update
            setPreferences(prev => ({ ...prev, ...newPrefs }));

            await setDoc(prefsRef, {
                ...newPrefs,
                updatedAt: serverTimestamp(),
            }, { merge: true });

            logger.infoSafe('Preferences updated', { userId: user.uid, updatedFields: Object.keys(newPrefs) });
        } catch (error) {
            logger.errorSafe('Failed to update preferences', error);
            toast({
                title: "Error",
                description: "Failed to save settings. Please try again.",
                variant: "destructive",
            });
            // Revert optimistic update (simple reload or fetch would be better, but for now this is okay as snapshot listener will likely correct it if it failed on server only, though if local write fails we might need revert)
        }
    };

    return {
        preferences,
        loading,
        updatePreferences,
    };
}

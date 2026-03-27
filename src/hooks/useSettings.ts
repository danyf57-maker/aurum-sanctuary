'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/web-client';
import { useAuth } from '@/providers/auth-provider';
import { logger } from '@/lib/logger/safe';
import { useToast } from '@/hooks/use-toast';
import type { Locale } from '@/lib/locale';

export interface UserPreferences {
    notificationsEnabled: boolean;
    writingReminderEnabled: boolean;
    writingReminderTime: string;
    writingReminderDays: number[];
    writingReminderTone: 'gentle' | 'clarity' | 'pressure_release' | 'routine';
    theme: 'light' | 'dark' | 'system';
    language: 'en' | 'fr';
    timezone: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
    notificationsEnabled: true,
    writingReminderEnabled: false,
    writingReminderTime: '20:30',
    writingReminderDays: [1, 2, 3, 4, 5],
    writingReminderTone: 'gentle',
    theme: 'system',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

function buildDefaultPreferences(locale: Locale): UserPreferences {
    return {
        ...DEFAULT_PREFERENCES,
        language: locale,
    };
}

export function useSettings(defaultLocale: Locale = 'en') {
    const { user } = useAuth();
    const [preferences, setPreferences] = useState<UserPreferences>(() => buildDefaultPreferences(defaultLocale));
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!user) {
            setPreferences(buildDefaultPreferences(defaultLocale));
            setLoading(false);
            return;
        }

        const defaultPreferences = buildDefaultPreferences(defaultLocale);
        const prefsRef = doc(firestore, 'users', user.uid, 'settings', 'preferences');

        const unsubscribe = onSnapshot(prefsRef, (docSnap) => {
            if (docSnap.exists()) {
                setPreferences({ ...defaultPreferences, ...docSnap.data() } as UserPreferences);
            } else {
                // Initialize default preferences if they don't exist
                setDoc(prefsRef, {
                    ...defaultPreferences,
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
    }, [defaultLocale, user]);

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
                title: preferences.language === "fr" ? "Erreur" : "Error",
                description: preferences.language === "fr"
                    ? "Impossible d'enregistrer les paramètres. Réessayez."
                    : "Failed to save settings. Please try again.",
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

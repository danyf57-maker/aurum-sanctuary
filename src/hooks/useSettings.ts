'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/web-client';
import { useAuth } from '@/providers/auth-provider';
import { logger } from '@/lib/logger/safe';
import { useToast } from '@/hooks/use-toast';

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

const THEME_STORAGE_KEY = 'aurum-theme';

function readStoredTheme(): UserPreferences['theme'] {
    if (typeof window === 'undefined') return 'system';
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
}

function resolveSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: UserPreferences['theme']) {
    if (typeof document === 'undefined') return;
    const effectiveTheme = theme === 'system' ? resolveSystemTheme() : theme;
    const root = document.documentElement;
    root.classList.toggle('dark', effectiveTheme === 'dark');
    root.style.colorScheme = effectiveTheme;
}

export function useSettings() {
    const { user } = useAuth();
    const [preferences, setPreferences] = useState<UserPreferences>({
        ...DEFAULT_PREFERENCES,
        theme: readStoredTheme(),
    });
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        applyTheme(preferences.theme);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(THEME_STORAGE_KEY, preferences.theme);
        }
    }, [preferences.theme]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (readStoredTheme() === 'system') {
                applyTheme('system');
            }
        };

        media.addEventListener('change', handleChange);
        return () => media.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
        if (!user) {
            setPreferences((prev) => ({ ...prev, theme: readStoredTheme() }));
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

/**
 * Hook for fetching DerivedMemoryLite from Firestore
 * 
 * Provides cached access to user's DerivedMemoryLite for Mirror Chat context.
 */

'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/web-client';
import { DerivedMemoryLite, DerivedMemoryLiteSchema, INITIAL_DERIVED_MEMORY_LITE } from '@/lib/schemas/derivedMemory';
import { useAuth } from '@/providers/auth-provider';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface UseDerivedMemoryLiteResult {
    data: DerivedMemoryLite | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * Fetch DerivedMemoryLite from Firestore with caching
 * 
 * @returns DerivedMemoryLite data, loading state, error, and refetch function
 */
export function useDerivedMemoryLite(): UseDerivedMemoryLiteResult {
    const { user } = useAuth();
    const [data, setData] = useState<DerivedMemoryLite | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [lastFetch, setLastFetch] = useState<number>(0);

    const fetchData = async () => {
        if (!user) {
            setData(null);
            setLoading(false);
            return;
        }

        // Check cache
        const now = Date.now();
        if (data && now - lastFetch < CACHE_DURATION) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const docRef = doc(firestore, 'users', user.uid, 'derivedMemory', 'lite');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                // Validate with Zod schema
                const rawData = docSnap.data();
                const validated = DerivedMemoryLiteSchema.parse(rawData);
                setData(validated);
            } else {
                // Use initial placeholder if document doesn't exist
                setData(INITIAL_DERIVED_MEMORY_LITE);
            }

            setLastFetch(now);
        } catch (err) {
            console.error('Error fetching DerivedMemoryLite:', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch DerivedMemoryLite'));
            // Fallback to initial data on error
            setData(INITIAL_DERIVED_MEMORY_LITE);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user?.uid]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
    };
}

'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/web-client';
import { useAuth } from '@/providers/auth-provider';
import { useSubscription } from '@/hooks/useSubscription';
import { FREE_ENTRY_LIMIT } from '@/lib/billing/config';

export function useFreeEntryLimit() {
  const { user } = useAuth();
  const { isPremium, loading: subscriptionLoading } = useSubscription();
  const [entriesUsed, setEntriesUsed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEntriesUsed(0);
      setLoading(false);
      return;
    }

    const userRef = doc(firestore, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      const data = snapshot.data();
      setEntriesUsed(typeof data?.entryCount === 'number' ? data.entryCount : 0);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const remaining = Math.max(0, FREE_ENTRY_LIMIT - entriesUsed);
  const isLimitReached = !isPremium && entriesUsed >= FREE_ENTRY_LIMIT;

  return {
    entriesUsed,
    entriesLimit: FREE_ENTRY_LIMIT,
    remaining,
    isPremium,
    isLimitReached,
    loading: loading || subscriptionLoading,
  };
}

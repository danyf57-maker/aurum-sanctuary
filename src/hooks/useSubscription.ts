/**
 * useSubscription Hook
 * 
 * Fetches and manages user subscription status from Firestore.
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/web-client';

export interface SubscriptionStatus {
    status: 'active' | 'past_due' | 'canceled' | 'trialing' | null;
    stripeCustomerId?: string;
    subscriptionId?: string;
    subscriptionPriceId?: string;
    subscriptionCurrentPeriodEnd?: Date;
}

export function useSubscription() {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<SubscriptionStatus>({
        status: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setSubscription({ status: null });
            setLoading(false);
            return;
        }

        const userRef = doc(firestore, 'users', user.uid);

        const unsubscribe = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setSubscription({
                    status: data.subscriptionStatus || null,
                    stripeCustomerId: data.stripeCustomerId,
                    subscriptionId: data.subscriptionId,
                    subscriptionPriceId: data.subscriptionPriceId,
                    subscriptionCurrentPeriodEnd: data.subscriptionCurrentPeriodEnd?.toDate(),
                });
            } else {
                setSubscription({ status: null });
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const isPremium = subscription.status === 'active' || subscription.status === 'trialing';
    const isPastDue = subscription.status === 'past_due';
    const isCanceled = subscription.status === 'canceled';

    return {
        subscription,
        loading,
        isPremium,
        isPastDue,
        isCanceled,
    };
}

/**
 * useSubscription Hook
 * 
 * Fetches and manages user subscription status from Firestore.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/web-client';
import { ANNUAL_UPGRADE_ELIGIBILITY_DAYS } from '@/lib/billing/config';

export interface SubscriptionStatus {
    status: 'active' | 'past_due' | 'canceled' | 'trialing' | null;
    stripeCustomerId?: string;
    subscriptionId?: string;
    subscriptionPriceId?: string;
    subscriptionCurrentPeriodEnd?: Date;
    subscriptionTrialEndsAt?: Date;
    subscriptionStartedAt?: Date;
    trialConsumedAt?: Date;
    billingPhase?: string;
}

export function useSubscription() {
    const { user } = useAuth();
    const reconcileRequestedRef = useRef(false);
    const [subscription, setSubscription] = useState<SubscriptionStatus>({
        status: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setSubscription({ status: null });
            setLoading(false);
            reconcileRequestedRef.current = false;
            return;
        }

        const userRef = doc(firestore, 'users', user.uid);

        const unsubscribe = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                const trialEndsAt = data.subscriptionTrialEndsAt?.toDate?.() || data.subscriptionCurrentPeriodEnd?.toDate?.() || null;

                // Keep Firestore state consistent for no-card app trials once they expire.
                if (
                    data.subscriptionStatus === 'trialing' &&
                    !data.subscriptionId &&
                    trialEndsAt instanceof Date &&
                    trialEndsAt.getTime() <= Date.now() &&
                    !reconcileRequestedRef.current
                ) {
                    reconcileRequestedRef.current = true;
                    void user.getIdToken()
                        .then(async (token) => {
                            const res = await fetch('/api/billing/reconcile-trial', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`,
                                },
                            });
                            if (!res.ok) {
                                reconcileRequestedRef.current = false;
                            }
                        })
                        .catch(() => {
                            reconcileRequestedRef.current = false;
                        });
                } else if (data.subscriptionStatus !== 'trialing') {
                    reconcileRequestedRef.current = false;
                }

                setSubscription({
                    status: data.subscriptionStatus || null,
                    stripeCustomerId: data.stripeCustomerId,
                    subscriptionId: data.subscriptionId,
                    subscriptionPriceId: data.subscriptionPriceId,
                    subscriptionCurrentPeriodEnd: data.subscriptionCurrentPeriodEnd?.toDate(),
                    subscriptionTrialEndsAt: data.subscriptionTrialEndsAt?.toDate(),
                    subscriptionStartedAt: data.subscriptionStartedAt?.toDate(),
                    trialConsumedAt: data.trialConsumedAt?.toDate(),
                    billingPhase: data.billingPhase || undefined,
                });
            } else {
                setSubscription({ status: null });
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const trialEndsAt = subscription.subscriptionTrialEndsAt || subscription.subscriptionCurrentPeriodEnd || null;
    const isTrialCurrentlyActive =
        subscription.status === 'trialing' &&
        !!subscription.subscriptionId &&
        !!trialEndsAt &&
        trialEndsAt.getTime() > Date.now();
    const isPremium = subscription.status === 'active' || isTrialCurrentlyActive;
    const isPastDue = subscription.status === 'past_due';
    const isCanceled = subscription.status === 'canceled';
    const isTrialing = isTrialCurrentlyActive;
    const isTrialEndingSoon = !!trialEndsAt && trialEndsAt.getTime() - Date.now() <= 3 * 24 * 60 * 60 * 1000;
    const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || '';
    const yearlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM || '';
    const isMonthlyPlan = !!subscription.subscriptionPriceId && subscription.subscriptionPriceId === monthlyPriceId;
    const isYearlyPlan = !!subscription.subscriptionPriceId && subscription.subscriptionPriceId === yearlyPriceId;
    const subscriptionStartedAt = subscription.subscriptionStartedAt || subscription.trialConsumedAt || null;
    const daysActive = subscriptionStartedAt
        ? Math.floor((Date.now() - subscriptionStartedAt.getTime()) / (24 * 60 * 60 * 1000))
        : null;
    const annualUpgradeEligibleAt = subscriptionStartedAt
        ? new Date(subscriptionStartedAt.getTime() + ANNUAL_UPGRADE_ELIGIBILITY_DAYS * 24 * 60 * 60 * 1000)
        : null;
    const isAnnualUpgradeEligible =
        subscription.status === 'active' &&
        isMonthlyPlan &&
        !!annualUpgradeEligibleAt &&
        annualUpgradeEligibleAt.getTime() <= Date.now();

    return {
        subscription,
        loading,
        isPremium,
        isPastDue,
        isCanceled,
        isTrialing,
        trialEndsAt,
        isTrialEndingSoon,
        isMonthlyPlan,
        isYearlyPlan,
        subscriptionStartedAt,
        daysActive,
        annualUpgradeEligibleAt,
        isAnnualUpgradeEligible,
    };
}

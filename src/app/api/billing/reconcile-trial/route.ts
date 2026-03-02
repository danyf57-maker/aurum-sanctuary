import { NextRequest, NextResponse } from 'next/server';
import { auth, firestore as db } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger/safe';

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && value && 'toDate' in value) {
    const parsed = (value as { toDate?: () => Date }).toDate?.();
    return parsed instanceof Date ? parsed : null;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decoded = await auth.verifyIdToken(token);
    const userId = decoded.uid;

    const userRef = db.doc(`users/${userId}`);
    const userSnap = await userRef.get();
    const data = (userSnap.data() || {}) as {
      subscriptionStatus?: string;
      subscriptionId?: string;
      subscriptionTrialEndsAt?: Date | { toDate?: () => Date };
    };

    if (!userSnap.exists) {
      return NextResponse.json({ reconciled: false, reason: 'user_not_found' }, { status: 404 });
    }

    if (data.subscriptionStatus !== 'trialing') {
      return NextResponse.json({ reconciled: false, reason: 'not_trialing' });
    }

    // Stripe-managed trials are reconciled by Stripe webhooks.
    if (data.subscriptionId) {
      return NextResponse.json({ reconciled: false, reason: 'stripe_managed_trial' });
    }

    const trialEndsAt = toDate(data.subscriptionTrialEndsAt);
    if (!trialEndsAt || trialEndsAt.getTime() > Date.now()) {
      return NextResponse.json({ reconciled: false, reason: 'trial_not_expired' });
    }

    await userRef.set({
      subscriptionStatus: 'free',
      billingPhase: 'trial_expired',
      trialExpiredAt: new Date(),
      updatedAt: new Date(),
    }, { merge: true });

    return NextResponse.json({ reconciled: true, status: 'free' });
  } catch (error) {
    logger.errorSafe('Failed to reconcile trial', error);
    return NextResponse.json({ error: 'Failed to reconcile trial' }, { status: 500 });
  }
}


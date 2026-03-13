import { firestore as db } from '@/lib/firebase/admin';
import { PAYMENTS_PAUSED } from '@/lib/billing/config';
import { getFreeAurumConversationState, getFreeEntryState } from '@/lib/billing/free-limits';

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing']);

type UserBillingSnapshot = {
  subscriptionStatus?: string;
  subscriptionId?: string;
  subscriptionTrialEndsAt?: Date | { toDate?: () => Date };
  subscriptionCurrentPeriodEnd?: Date | { toDate?: () => Date };
  aurumAccessExpiresAt?: Date | { toDate?: () => Date };
  entryCount?: number;
};

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && value && 'toDate' in value) {
    const parsed = (value as { toDate?: () => Date }).toDate?.();
    return parsed instanceof Date ? parsed : null;
  }
  return null;
}

export async function getAurumAccessState(userId: string): Promise<{
  hasAccess: boolean;
  hasSubscription: boolean;
  hasOneShotWindow: boolean;
  oneShotExpiresAt: Date | null;
}> {
  if (PAYMENTS_PAUSED) {
    return {
      hasAccess: true,
      hasSubscription: false,
      hasOneShotWindow: false,
      oneShotExpiresAt: null,
    };
  }

  const userRef = db.collection('users').doc(userId);
  const userSnap = await userRef.get();
  const userData = (userSnap.data() || {}) as UserBillingSnapshot;

  return resolveAurumAccessState(userData);
}

export function resolveAurumAccessState(userData: UserBillingSnapshot): {
  hasAccess: boolean;
  hasSubscription: boolean;
  hasOneShotWindow: boolean;
  oneShotExpiresAt: Date | null;
} {
  if (PAYMENTS_PAUSED) {
    return {
      hasAccess: true,
      hasSubscription: false,
      hasOneShotWindow: false,
      oneShotExpiresAt: null,
    };
  }

  const status = userData.subscriptionStatus || '';
  const trialEndsAt = toDate(userData.subscriptionTrialEndsAt) || toDate(userData.subscriptionCurrentPeriodEnd);
  const hasStripeSubscription = typeof userData.subscriptionId === 'string' && userData.subscriptionId.length > 0;
  const hasActiveTrial =
    status === 'trialing' &&
    hasStripeSubscription &&
    !!trialEndsAt &&
    trialEndsAt.getTime() > Date.now();
  const hasSubscription = status === 'active' || hasActiveTrial;
  const oneShotExpiresAt = toDate(userData.aurumAccessExpiresAt);
  const hasOneShotWindow = !!oneShotExpiresAt && oneShotExpiresAt.getTime() > Date.now();

  return {
    hasAccess: hasSubscription || hasOneShotWindow,
    hasSubscription,
    hasOneShotWindow,
    oneShotExpiresAt,
  };
}

export { getFreeAurumConversationState, getFreeEntryState };

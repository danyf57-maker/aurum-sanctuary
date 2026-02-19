import { firestore as db } from '@/lib/firebase/admin';
import { PAYMENTS_PAUSED } from '@/lib/billing/config';

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing']);

type UserBillingSnapshot = {
  subscriptionStatus?: string;
  aurumAccessExpiresAt?: Date | { toDate?: () => Date };
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

  const hasSubscription = ACTIVE_SUBSCRIPTION_STATUSES.has(userData.subscriptionStatus || '');
  const oneShotExpiresAt = toDate(userData.aurumAccessExpiresAt);
  const hasOneShotWindow = !!oneShotExpiresAt && oneShotExpiresAt.getTime() > Date.now();

  return {
    hasAccess: hasSubscription || hasOneShotWindow,
    hasSubscription,
    hasOneShotWindow,
    oneShotExpiresAt,
  };
}

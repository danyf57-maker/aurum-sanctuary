import { NextRequest, NextResponse } from 'next/server';
import { auth, firestore as db } from '@/lib/firebase/admin';
import { getStripe } from '@/lib/stripe/server';
import { logger } from '@/lib/logger/safe';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { ANNUAL_UPGRADE_ELIGIBILITY_DAYS } from '@/lib/billing/config';
import { resolveLocaleFromAcceptLanguage } from '@/lib/locale';

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];

    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      logger.errorSafe('Token verification failed for annual upgrade portal', error);
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    const userId = decodedToken.uid;

    const upgradeRateLimit = await rateLimit(RateLimitPresets.auth(`annual-upgrade:${userId}`));
    if (!upgradeRateLimit.success) {
      return NextResponse.json({ error: 'Too many upgrade attempts. Please try again in a minute.' }, { status: 429 });
    }

    const yearlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM;
    const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!yearlyPriceId || !monthlyPriceId || !appUrl) {
      logger.errorSafe('Annual upgrade portal misconfigured');
      return NextResponse.json({ error: 'Stripe configuration error' }, { status: 500 });
    }

    const userRef = db.doc(`users/${userId}`);
    const userSnap = await userRef.get();
    const userData = userSnap.data() || {};

    const subscriptionStatus = String(userData.subscriptionStatus || '');
    const subscriptionId = typeof userData.subscriptionId === 'string' ? userData.subscriptionId : '';
    const stripeCustomerId = typeof userData.stripeCustomerId === 'string' ? userData.stripeCustomerId : '';
    const subscriptionPriceId = typeof userData.subscriptionPriceId === 'string' ? userData.subscriptionPriceId : '';
    const subscriptionStartedAt = toDate(userData.subscriptionStartedAt) || toDate(userData.trialConsumedAt);
    const eligibleAt = subscriptionStartedAt
      ? new Date(subscriptionStartedAt.getTime() + ANNUAL_UPGRADE_ELIGIBILITY_DAYS * 24 * 60 * 60 * 1000)
      : null;

    if (subscriptionStatus !== 'active' || !subscriptionId || !stripeCustomerId) {
      return NextResponse.json({ error: 'No eligible active subscription found' }, { status: 409 });
    }

    if (subscriptionPriceId !== monthlyPriceId) {
      return NextResponse.json({ error: 'Only monthly subscribers can use this flow' }, { status: 409 });
    }

    if (!eligibleAt || eligibleAt.getTime() > Date.now()) {
      return NextResponse.json({ error: 'Annual offer not available yet' }, { status: 409 });
    }

    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const subscriptionItem = subscription.items.data[0];

    if (!subscriptionItem?.id) {
      return NextResponse.json({ error: 'Subscription item not found' }, { status: 400 });
    }

    const returnUrl = `${appUrl}/settings?billing=annual-offer`;
    const locale = resolveLocaleFromAcceptLanguage(req.headers.get('accept-language'));

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: returnUrl,
        locale,
        flow_data: {
          type: 'subscription_update_confirm',
          after_completion: {
            type: 'redirect',
            redirect: { return_url: `${appUrl}/settings?billing=annual-upgrade-success` },
          },
          subscription_update_confirm: {
            subscription: subscription.id,
            items: [
              {
                id: subscriptionItem.id,
                price: yearlyPriceId,
                quantity: subscriptionItem.quantity ?? 1,
              },
            ],
          },
        },
      });

      return NextResponse.json({ url: session.url, mode: 'subscription_update_confirm' });
    } catch (error) {
      logger.warnSafe('Annual upgrade deep link unavailable, falling back to billing portal', {
        subscriptionId,
      });

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: returnUrl,
        locale,
      });

      return NextResponse.json({ url: portalSession.url, mode: 'portal_homepage' });
    }
  } catch (error) {
    logger.errorSafe('Error creating annual upgrade portal session', error);
    return NextResponse.json({ error: 'Failed to create annual upgrade session' }, { status: 500 });
  }
}

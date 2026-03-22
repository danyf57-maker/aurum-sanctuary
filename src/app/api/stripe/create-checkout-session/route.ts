/**
 * Stripe Checkout Session API Route
 * 
 * Creates a Stripe Checkout Session for subscription payments.
 * Requires authentication via Firebase ID token.
 * 
 * @route POST /api/stripe/create-checkout-session
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/server';
import { auth, firestore as db } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger/safe';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { STRIPE_TRIAL_DAYS } from '@/lib/billing/config';

export async function POST(req: NextRequest) {
    try {
        const stripe = getStripe();

        // 1. Verify authentication
        const authHeader = req.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized - Missing or invalid authorization header' },
                { status: 401 }
            );
        }

        const token = authHeader.split('Bearer ')[1];

        let decodedToken;
        try {
            decodedToken = await auth.verifyIdToken(token);
        } catch (error) {
            logger.errorSafe('Token verification failed', error);
            return NextResponse.json(
                { error: 'Unauthorized - Invalid token' },
                { status: 401 }
            );
        }

        const userId = decodedToken.uid;
        const email = decodedToken.email;

        if (!email) {
            return NextResponse.json(
                { error: 'User email not found' },
                { status: 400 }
            );
        }

        // 1b. Rate limit checkout-session creation to reduce abuse/fraud attempts
        const checkoutRateLimit = await rateLimit(RateLimitPresets.auth(`checkout:${userId}`));
        if (!checkoutRateLimit.success) {
            return NextResponse.json(
                { error: 'Too many checkout attempts. Please try again in a minute.' },
                { status: 429 }
            );
        }

        const body = await req.json().catch(() => ({}));
        const requestedPriceId = typeof body?.priceId === 'string' ? body.priceId.trim() : '';

        // 2. Validate environment variables
        const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO;
        const yearlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM;
        const allowedPriceIds = [
            process.env.STRIPE_PRICE_ID, // legacy single-price fallback
            monthlyPriceId,
            yearlyPriceId,
        ].filter((value): value is string => !!value && !value.includes('xxx'));

        if (allowedPriceIds.length === 0) {
            logger.errorSafe('No Stripe price IDs configured');
            return NextResponse.json(
                { error: 'Stripe configuration error' },
                { status: 500 }
            );
        }

        const selectedPriceId = requestedPriceId || allowedPriceIds[0];
        if (!allowedPriceIds.includes(selectedPriceId)) {
            return NextResponse.json(
                { error: 'Invalid price ID' },
                { status: 400 }
            );
        }

        if (!process.env.NEXT_PUBLIC_APP_URL) {
            logger.errorSafe('NEXT_PUBLIC_APP_URL not configured');
            return NextResponse.json(
                { error: 'App configuration error' },
                { status: 500 }
            );
        }

        // 3. Read billing state before creating checkout
        const userRef = db.doc(`users/${userId}`);
        const userSnap = await userRef.get();
        const userData = (userSnap.data() || {}) as {
            subscriptionStatus?: string;
            subscriptionId?: string;
            trialConsumedAt?: Date;
            trialOrigin?: string;
        };

        const hasStripeSubscription = typeof userData.subscriptionId === 'string' && userData.subscriptionId.length > 0;
        const stripeManagedStatuses = new Set(['active', 'trialing', 'past_due']);
        if (hasStripeSubscription && stripeManagedStatuses.has(userData.subscriptionStatus || '')) {
            return NextResponse.json(
                { error: 'Subscription already active' },
                { status: 409 }
            );
        }

        const legacyNoCardTrial =
            userData.trialOrigin === 'app_no_card' &&
            !hasStripeSubscription;
        const hasConsumedTrial = !!userData.trialConsumedAt && !legacyNoCardTrial;
        const shouldApplyTrial = STRIPE_TRIAL_DAYS > 0 && !hasConsumedTrial;

        // 4. Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer_email: email,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: selectedPriceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/sanctuary/write?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/sanctuary/write`,
            metadata: {
                userId,
                firebaseUid: userId,
            },
            subscription_data: {
                metadata: {
                    firebaseUid: userId,
                },
                ...(shouldApplyTrial ? { trial_period_days: STRIPE_TRIAL_DAYS } : {}),
            },
            allow_promotion_codes: true, // Allow discount codes
            billing_address_collection: 'auto',
        });

        await userRef.set({
            billingPhase: 'checkout_started',
            trialConfiguredDays: shouldApplyTrial ? STRIPE_TRIAL_DAYS : 0,
            updatedAt: new Date(),
        }, { merge: true });

        logger.infoSafe('Checkout session created', {
            userId,
            checkoutSessionId: session.id,
            priceId: selectedPriceId,
            trialApplied: shouldApplyTrial,
            trialDays: shouldApplyTrial ? STRIPE_TRIAL_DAYS : 0,
            legacyNoCardTrial,
        });

        return NextResponse.json({
            sessionId: session.id,
            url: session.url,
            trialApplied: shouldApplyTrial,
            trialDays: shouldApplyTrial ? STRIPE_TRIAL_DAYS : 0,
            priceId: selectedPriceId,
        });

    } catch (error: any) {
        logger.errorSafe('Error creating checkout session', error);

        // Handle Stripe-specific errors
        if (error.type === 'StripeCardError') {
            return NextResponse.json(
                { error: 'Card error: ' + error.message },
                { status: 400 }
            );
        }

        if (error.type === 'StripeInvalidRequestError') {
            return NextResponse.json(
                { error: 'Invalid request: ' + error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}

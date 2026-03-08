/**
 * Stripe Webhook Handler
 * 
 * Handles Stripe webhook events to sync subscription status to Firestore.
 * Verifies webhook signature for security.
 * 
 * @route POST /api/stripe/webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/server';
import { firestore as db } from '@/lib/firebase/admin';
import Stripe from 'stripe';
import { trackServerEvent } from '@/lib/analytics/server';
import { logger } from '@/lib/logger/safe';
import { STRIPE_TRIAL_REMINDER_DAYS } from '@/lib/billing/config';
import { getActiveEmailAttribution, EMAIL_ATTRIBUTION_WINDOW_HOURS } from '@/lib/onboarding/email-attribution';

// Disable body parsing - Stripe needs raw body for signature verification
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function fromUnix(value?: number | null): Date | null {
    if (!value || value <= 0) return null;
    return new Date(value * 1000);
}

function normalizeBillingPhase(status: string): string {
    if (status === 'trialing') return 'trial';
    if (status === 'active') return 'paid';
    if (status === 'past_due' || status === 'unpaid' || status === 'incomplete') return 'payment_issue';
    if (status === 'canceled' || status === 'incomplete_expired') return 'canceled';
    return 'checkout_started';
}

async function notifyTrialWillEnd(params: {
    userId: string;
    subscription: Stripe.Subscription;
}) {
    const { userId, subscription } = params;
    const trialEndsAt = fromUnix(subscription.trial_end);
    const now = new Date();

    await db.doc(`users/${userId}`).set({
        trialWillEndNotifiedAt: now,
        subscriptionTrialEndsAt: trialEndsAt,
        billingPhase: 'trial_ending',
        updatedAt: now,
    }, { merge: true });

    const notifId = `trial_will_end_${subscription.id}_${subscription.trial_end || 'none'}`;
    await db.doc(`users/${userId}/notifications/${notifId}`).set({
        type: 'other',
        read: false,
        message: `Votre periode d'essai se termine dans environ ${STRIPE_TRIAL_REMINDER_DAYS} jours. Pensez a verifier votre moyen de paiement pour eviter une interruption.`,
        createdAt: now,
        category: 'billing',
        subscriptionId: subscription.id,
        trialEndsAt,
    }, { merge: true });
}

async function buildEmailAttributionParams(userId: string) {
    const attribution = await getActiveEmailAttribution(userId);
    if (!attribution) return {};

    return {
        attributed_email_id: attribution.emailId,
        attributed_email_clicked_at: attribution.clickedAt.toISOString(),
        attribution_window_hours: EMAIL_ATTRIBUTION_WINDOW_HOURS,
    };
}

export async function POST(req: NextRequest) {
    const stripe = getStripe();
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
        logger.warnSafe('No Stripe signature found');
        return NextResponse.json(
            { error: 'No signature' },
            { status: 400 }
        );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        logger.errorSafe('STRIPE_WEBHOOK_SECRET not configured');
        return NextResponse.json(
            { error: 'Webhook secret not configured' },
            { status: 500 }
        );
    }

    let event: Stripe.Event;

    // Verify webhook signature
    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err: any) {
        logger.errorSafe('Webhook signature verification failed', err);
        return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 400 }
        );
    }

    logger.infoSafe('Received webhook event', { eventType: event.type });

    // Idempotency guard: Stripe can resend events, process each ID once.
    try {
        await db.collection('stripeWebhookEvents').doc(event.id).create({
            type: event.type,
            createdAt: new Date(),
        });
    } catch (error: any) {
        const code = error?.code ?? error?.status;
        if (code === 6 || code === 'already-exists' || /already exists/i.test(String(error?.message || ''))) {
            console.log(`ℹ️  Duplicate webhook event ignored: ${event.id}`);
            return NextResponse.json({ received: true, duplicate: true });
        }
        throw error;
    }

    // Handle events
    try {
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata.firebaseUid;

                if (!userId) {
                    logger.warnSafe('Missing firebaseUid in subscription metadata');
                    return NextResponse.json(
                        { error: 'Missing user ID in metadata' },
                        { status: 400 }
                    );
                }

                // Update user subscription status in Firestore
                await db.doc(`users/${userId}`).update({
                    subscriptionStatus: subscription.status,
                    stripeCustomerId: subscription.customer as string,
                    subscriptionId: subscription.id,
                    subscriptionPriceId: subscription.items.data[0]?.price.id,
                    subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    subscriptionTrialEndsAt: fromUnix(subscription.trial_end),
                    trialConsumedAt: subscription.status === 'trialing' ? new Date() : undefined,
                    billingPhase: normalizeBillingPhase(subscription.status),
                    updatedAt: new Date(),
                });

                if (subscription.status === 'active' || subscription.status === 'trialing') {
                    await db.doc(`users/${userId}/onboarding/state`).set({
                        stoppedAt: new Date().toISOString(),
                        stoppedReason: 'subscription_started',
                        updatedAt: new Date().toISOString(),
                    }, { merge: true });
                }

                if (subscription.status === 'trialing') {
                    await trackServerEvent('trial_activated', {
                        userId,
                        path: '/api/stripe/webhook',
                        params: {
                            subscriptionId: subscription.id,
                            trialEndsAt: fromUnix(subscription.trial_end)?.toISOString() || null,
                            ...(await buildEmailAttributionParams(userId)),
                        },
                    });
                }

                logger.infoSafe('Subscription updated', {
                    subscriptionStatus: subscription.status,
                    userId,
                });
                break;
            }

            case 'customer.subscription.trial_will_end': {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata.firebaseUid;

                if (!userId) {
                    logger.warnSafe('Missing firebaseUid in trial_will_end metadata');
                    return NextResponse.json(
                        { error: 'Missing user ID in metadata' },
                        { status: 400 }
                    );
                }

                await notifyTrialWillEnd({ userId, subscription });
                logger.infoSafe('Trial ending reminder created', { userId });
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata.firebaseUid;

                if (!userId) {
                    logger.warnSafe('Missing firebaseUid in subscription metadata');
                    return NextResponse.json(
                        { error: 'Missing user ID in metadata' },
                        { status: 400 }
                    );
                }

                // Mark subscription as canceled
                await db.doc(`users/${userId}`).update({
                    subscriptionStatus: 'canceled',
                    subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    subscriptionTrialEndsAt: fromUnix(subscription.trial_end),
                    billingPhase: 'canceled',
                    updatedAt: new Date(),
                });

                logger.infoSafe('Subscription canceled', { userId });
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                logger.infoSafe('Payment succeeded', { invoiceId: invoice.id });

                // Optionally: Log payment event to Firestore
                if (invoice.subscription) {
                    const subscription = await stripe.subscriptions.retrieve(
                        invoice.subscription as string
                    );
                    const userId = subscription.metadata.firebaseUid;

                    if (userId) {
                        await db.doc(`users/${userId}`).set({
                            subscriptionStatus: 'active',
                            billingPhase: 'paid',
                            updatedAt: new Date(),
                        }, { merge: true });

                        await trackServerEvent('subscription_started', {
                            userId,
                            path: '/api/stripe/webhook',
                            params: {
                                subscriptionId: subscription.id,
                                invoiceId: invoice.id,
                                amount: invoice.amount_paid,
                                currency: invoice.currency,
                                ...(await buildEmailAttributionParams(userId)),
                            },
                        });

                        await db.collection(`users/${userId}/payments`).add({
                            invoiceId: invoice.id,
                            amount: invoice.amount_paid,
                            currency: invoice.currency,
                            status: 'succeeded',
                            createdAt: new Date(),
                        });

                        await trackServerEvent('purchase', {
                            userId,
                            params: {
                                amount: invoice.amount_paid,
                                currency: invoice.currency,
                                invoiceId: invoice.id,
                                ...(await buildEmailAttributionParams(userId)),
                            },
                            path: '/pricing',
                        });
                    }
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                logger.warnSafe('Payment failed', { invoiceId: invoice.id });

                if (invoice.subscription) {
                    const subscription = await stripe.subscriptions.retrieve(
                        invoice.subscription as string
                    );
                    const userId = subscription.metadata.firebaseUid;

                    if (userId) {
                        // Update subscription status to past_due
                        await db.doc(`users/${userId}`).update({
                            subscriptionStatus: 'past_due',
                            billingPhase: 'payment_issue',
                            updatedAt: new Date(),
                        });

                        // Log failed payment
                        await db.collection(`users/${userId}/payments`).add({
                            invoiceId: invoice.id,
                            amount: invoice.amount_due,
                            currency: invoice.currency,
                            status: 'failed',
                            createdAt: new Date(),
                        });

                        logger.warnSafe('Subscription marked as past_due', { userId });
                    }
                }
                break;
            }

            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                logger.infoSafe('Checkout session completed', { checkoutSessionId: session.id });
                const userId = session.metadata?.firebaseUid || null;
                await trackServerEvent('checkout_start', {
                    userId,
                    params: {
                        checkoutSessionId: session.id,
                        amountTotal: session.amount_total,
                        currency: session.currency,
                    },
                    path: '/pricing',
                });

                // The subscription.created event will handle the Firestore update
                // This is just for logging
                break;
            }

            default:
                logger.infoSafe('Unhandled webhook event type', { eventType: event.type });
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        logger.errorSafe('Error processing webhook', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

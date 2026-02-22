/**
 * Stripe Webhook Handler
 * 
 * Handles Stripe webhook events to sync subscription status to Firestore.
 * Verifies webhook signature for security.
 * 
 * @route POST /api/stripe/webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { firestore as db } from '@/lib/firebase/admin';
import Stripe from 'stripe';
import { trackServerEvent } from '@/lib/analytics/server';

// Disable body parsing - Stripe needs raw body for signature verification
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
        console.error('❌ No Stripe signature found');
        return NextResponse.json(
            { error: 'No signature' },
            { status: 400 }
        );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
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
        console.error('❌ Webhook signature verification failed:', err.message);
        return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 400 }
        );
    }

    console.log(`📨 Received webhook event: ${event.type}`);

    // Handle events
    try {
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata.firebaseUid;

                if (!userId) {
                    console.error('❌ No firebaseUid in subscription metadata');
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
                    updatedAt: new Date(),
                });

                if (subscription.status === 'active' || subscription.status === 'trialing') {
                    await db.doc(`users/${userId}/onboarding/state`).set({
                        stoppedAt: new Date().toISOString(),
                        stoppedReason: 'subscription_started',
                        updatedAt: new Date().toISOString(),
                    }, { merge: true });
                }

                console.log(`✅ Subscription ${subscription.status} for user ${userId}`);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata.firebaseUid;

                if (!userId) {
                    console.error('❌ No firebaseUid in subscription metadata');
                    return NextResponse.json(
                        { error: 'Missing user ID in metadata' },
                        { status: 400 }
                    );
                }

                // Mark subscription as canceled
                await db.doc(`users/${userId}`).update({
                    subscriptionStatus: 'canceled',
                    subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    updatedAt: new Date(),
                });

                console.log(`✅ Subscription canceled for user ${userId}`);
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                console.log(`✅ Payment succeeded: ${invoice.id}`);

                // Optionally: Log payment event to Firestore
                if (invoice.subscription) {
                    const subscription = await stripe.subscriptions.retrieve(
                        invoice.subscription as string
                    );
                    const userId = subscription.metadata.firebaseUid;

                    if (userId) {
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
                            },
                            path: '/pricing',
                        });
                    }
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                console.log(`⚠️  Payment failed: ${invoice.id}`);

                if (invoice.subscription) {
                    const subscription = await stripe.subscriptions.retrieve(
                        invoice.subscription as string
                    );
                    const userId = subscription.metadata.firebaseUid;

                    if (userId) {
                        // Update subscription status to past_due
                        await db.doc(`users/${userId}`).update({
                            subscriptionStatus: 'past_due',
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

                        console.log(`⚠️  Subscription marked as past_due for user ${userId}`);
                    }
                }
                break;
            }

            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                console.log(`✅ Checkout session completed: ${session.id}`);
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
                console.log(`ℹ️  Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('❌ Error processing webhook:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

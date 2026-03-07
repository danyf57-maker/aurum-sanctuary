/**
 * Stripe Server SDK
 * 
 * Server-side Stripe initialization for API routes and Cloud Functions.
 * Uses secret key from environment variables.
 * 
 * @module lib/stripe/server
 */

import Stripe from 'stripe';

/**
 * Configured Stripe instance for server-side operations
 * 
 * @example
 * import { getStripe } from '@/lib/stripe/server';
 * 
 * const stripe = getStripe();
 * const products = await stripe.products.list();
 */
export function getStripe(): Stripe {
    const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();

    if (!stripeKey) {
        throw new Error('STRIPE_SECRET_KEY is not configured at runtime.');
    }

    return new Stripe(stripeKey, {
        apiVersion: '2024-06-20',
        typescript: true,
        appInfo: {
            name: 'Aurum Sanctuary',
            version: '1.0.0',
        },
    });
}

/**
 * Helper function to get or create a Stripe customer
 * 
 * @param email - User's email address
 * @param userId - Firebase user ID
 * @returns Stripe Customer object
 */
export async function getOrCreateCustomer(
    email: string,
    userId: string
): Promise<Stripe.Customer> {
    const stripe = getStripe();

    // Search for existing customer by email
    const existingCustomers = await stripe.customers.list({
        email,
        limit: 1,
    });

    if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0];
    }

    // Create new customer
    return await stripe.customers.create({
        email,
        metadata: {
            firebaseUid: userId,
        },
    });
}

/**
 * Helper function to get subscription status
 * 
 * @param customerId - Stripe customer ID
 * @returns Subscription status or null if no active subscription
 */
export async function getSubscriptionStatus(
    customerId: string
): Promise<Stripe.Subscription.Status | null> {
    const stripe = getStripe();

    const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
    });

    if (subscriptions.data.length === 0) {
        return null;
    }

    return subscriptions.data[0].status;
}

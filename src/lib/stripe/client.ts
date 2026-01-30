/**
 * Stripe Client SDK
 * 
 * Client-side Stripe.js initialization for checkout flows.
 * Uses publishable key from environment variables.
 * 
 * @module lib/stripe/client
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error(
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. Please add it to your .env.local file.'
    );
}

let stripePromise: Promise<Stripe | null>;

/**
 * Get Stripe.js instance (singleton pattern)
 * 
 * Loads Stripe.js asynchronously and caches the promise.
 * Safe to call multiple times - will only load once.
 * 
 * @returns Promise that resolves to Stripe instance
 * 
 * @example
 * import { getStripe } from '@/lib/stripe/client';
 * 
 * const stripe = await getStripe();
 * await stripe?.redirectToCheckout({ sessionId });
 */
export const getStripe = (): Promise<Stripe | null> => {
    if (!stripePromise) {
        stripePromise = loadStripe(
            process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
        );
    }
    return stripePromise;
};

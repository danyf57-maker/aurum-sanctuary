/**
 * Stripe Checkout Session API Route
 * 
 * Creates a Stripe Checkout Session for subscription payments.
 * Requires authentication via Firebase ID token.
 * 
 * @route POST /api/stripe/create-checkout-session
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { auth } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
    try {
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
            console.error('Token verification failed:', error);
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

        // 2. Validate environment variables
        if (!process.env.STRIPE_PRICE_ID) {
            console.error('STRIPE_PRICE_ID not configured');
            return NextResponse.json(
                { error: 'Stripe configuration error' },
                { status: 500 }
            );
        }

        if (!process.env.NEXT_PUBLIC_APP_URL) {
            console.error('NEXT_PUBLIC_APP_URL not configured');
            return NextResponse.json(
                { error: 'App configuration error' },
                { status: 500 }
            );
        }

        // 3. Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer_email: email,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/insights`,
            metadata: {
                userId,
                firebaseUid: userId,
            },
            allow_promotion_codes: true, // Allow discount codes
            billing_address_collection: 'auto',
        });

        console.log(`✅ Checkout session created for user ${userId}: ${session.id}`);

        return NextResponse.json({
            sessionId: session.id,
            url: session.url,
        });

    } catch (error: any) {
        console.error('Error creating checkout session:', error);

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

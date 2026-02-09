
'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth as adminAuth } from 'firebase-admin';
import { db } from '@/lib/firebase/admin';
import Stripe from 'stripe';
import { logger } from '@/lib/logger/safe';

// Les ID de prix sont maintenant chargés depuis les variables d'environnement.
// Assurez-vous qu'elles sont définies dans votre fichier .env
const PRICE_ID_PRO = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO;
const PRICE_ID_PREMIUM = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM;

// Use mock key for build time, real key for runtime
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

/**
 * Check if Stripe is properly configured for production use
 */
function assertStripeConfigured() {
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_mock') {
        throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.');
    }
}

async function getUserIdFromToken(): Promise<string | null> {
    const authorization = headers().get('Authorization');
    if (authorization?.startsWith('Bearer ')) {
        const idToken = authorization.split('Bearer ')[1];
        try {
            const decodedToken = await adminAuth().verifyIdToken(idToken);
            return decodedToken.uid;
        } catch (error) {
            logger.errorSafe("Error verifying ID token", error);
            return null;
        }
    }
    return null;
}

async function getOrCreateStripeCustomer(userId: string, email: string | undefined): Promise<string> {
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    const userData = userSnap.data();

    if (userData?.stripeCustomerId) {
        return userData.stripeCustomerId;
    }

    const customer = await stripe.customers.create({
        email: email,
        metadata: {
            firebaseUID: userId,
        },
    });

    await userRef.set({ stripeCustomerId: customer.id }, { merge: true });
    return customer.id;
}


export async function createCheckoutSession(formData: FormData) {
    assertStripeConfigured();
    const priceId = formData.get('priceId') as string;
    
    // Vérification que les ID de prix sont bien configurés
    if (!PRICE_ID_PRO || !PRICE_ID_PREMIUM || PRICE_ID_PRO.includes('xxx') || PRICE_ID_PREMIUM.includes('xxx')) {
        throw new Error("Les ID de prix Stripe ne sont pas correctement configurés dans les variables d'environnement. Veuillez vérifier votre fichier .env.");
    }
    
    if (!priceId || ![PRICE_ID_PRO, PRICE_ID_PREMIUM].includes(priceId)) {
        throw new Error("ID de plan invalide.");
    }
    
    const userId = await getUserIdFromToken();

    if (!userId) {
         throw new Error("Utilisateur non authentifié. L'en-tête d'autorisation est manquant ou invalide.");
    }
    
    // We need to fetch the user's email from Firebase Auth, not just the action
    const userRecord = await adminAuth().getUser(userId);
    const userEmail = userRecord.email;

    const stripeCustomerId = await getOrCreateStripeCustomer(userId, userEmail);
    const host = headers().get('origin') || 'http://localhost:9002';

    const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer: stripeCustomerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${host}/dashboard?success=true`,
        cancel_url: `${host}/pricing?canceled=true`,
    });

    if (checkoutSession.url) {
        redirect(checkoutSession.url);
    } else {
        throw new Error("Impossible de créer la session de paiement Stripe.");
    }
}

export async function createPortalSession() {
    assertStripeConfigured();
    const userId = await getUserIdFromToken();
    
    if (!userId) {
         throw new Error("Utilisateur non authentifié. L'en-tête d'autorisation est manquant ou invalide.");
    }
    
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    const userData = userSnap.data();
    
    if (!userData?.stripeCustomerId) {
        // Before throwing, let's try to create it in case the user exists but the customer ID was never set.
        const userRecord = await adminAuth().getUser(userId);
        const stripeCustomerId = await getOrCreateStripeCustomer(userId, userRecord.email);
        
        if (!stripeCustomerId) {
          throw new Error("Client Stripe non trouvé et impossible de le créer pour cet utilisateur.");
        }
        
         const host = headers().get('origin') || 'http://localhost:9002';
         const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `${host}/account/profile`,
         });

        if (portalSession.url) redirect(portalSession.url);
        else throw new Error("Impossible de créer la session du portail client Stripe.");
        return;
    }

    const host = headers().get('origin') || 'http://localhost:9002';

    const portalSession = await stripe.billingPortal.sessions.create({
        customer: userData.stripeCustomerId,
        return_url: `${host}/account/profile`,
    });

    if (portalSession.url) {
        redirect(portalSession.url);
    } else {
         throw new Error("Impossible de créer la session du portail client Stripe.");
    }
}

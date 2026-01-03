
'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth as adminAuth } from 'firebase-admin';
import { db } from '@/lib/firebase/server-config';
import Stripe from 'stripe';

// REMPLACEZ-LES PAR VOS VRAIS PRICE ID STRIPE
const PRICE_ID_PRO = "price_xxxxxxxxxxxxxxxxx"; 
const PRICE_ID_PREMIUM = "price_yyyyyyyyyyyyyyyyy";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('La variable d\'environnement STRIPE_SECRET_KEY n\'est pas définie.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

async function getUserIdFromToken(): Promise<string | null> {
    const authorization = headers().get('Authorization');
    if (authorization?.startsWith('Bearer ')) {
        const idToken = authorization.split('Bearer ')[1];
        try {
            const decodedToken = await adminAuth().verifyIdToken(idToken);
            return decodedToken.uid;
        } catch (error) {
            console.error("Error verifying ID token:", error);
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
    const priceId = formData.get('priceId') as string;
    
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


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

async function getUserId(): Promise<string> {
    const authorization = headers().get('Authorization');
    if (authorization?.startsWith('Bearer ')) {
        const idToken = authorization.split('Bearer ')[1];
        try {
            const decodedToken = await adminAuth().verifyIdToken(idToken);
            return decodedToken.uid;
        } catch (error) {
            console.error("Error verifying ID token:", error);
            throw new Error("Utilisateur non authentifié.");
        }
    }
    throw new Error("En-tête d'autorisation manquant ou mal formé.");
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

    await userRef.update({ stripeCustomerId: customer.id });
    return customer.id;
}


export async function createCheckoutSession(formData: FormData) {
    const priceId = formData.get('priceId') as string;
    
    if (!priceId || ![PRICE_ID_PRO, PRICE_ID_PREMIUM].includes(priceId)) {
        throw new Error("ID de plan invalide.");
    }
    
    const authorization = headers().get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
         throw new Error("Non authentifié");
    }
    const idToken = authorization.split('Bearer ')[1];
    const decodedToken = await adminAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;

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
     const authorization = headers().get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
         throw new Error("Non authentifié");
    }
    const idToken = authorization.split('Bearer ')[1];
    const decodedToken = await adminAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;
    
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    const userData = userSnap.data();
    
    if (!userData?.stripeCustomerId) {
        throw new Error("Client Stripe non trouvé pour cet utilisateur.");
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

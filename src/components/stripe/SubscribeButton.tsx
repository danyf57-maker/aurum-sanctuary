/**
 * Subscribe Button Component
 * 
 * Button that redirects to Stripe Checkout for subscription.
 * Handles authentication and loading states.
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { getStripe } from '@/lib/stripe/client';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SubscribeButtonProps {
    className?: string;
    children?: React.ReactNode;
}

export function SubscribeButton({
    className,
    children = 'S’abonner'
}: SubscribeButtonProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubscribe = async () => {
        if (!user) {
            setError('Veuillez vous connecter pour vous abonner.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Get Firebase ID token
            const token = await user.getIdToken();

            // Create checkout session
            const response = await fetch('/api/stripe/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Impossible de créer la session de paiement.');
            }

            const { url } = await response.json();

            if (!url) {
                throw new Error('Aucune URL de paiement reçue.');
            }

            // Redirect to Stripe Checkout
            window.location.href = url;

        } catch (err: any) {
            console.error('Error creating checkout session:', err);
            setError(err.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <Button
                onClick={handleSubscribe}
                disabled={loading || !user}
                className={className}
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Chargement...
                    </>
                ) : (
                    children
                )}
            </Button>

            {error && (
                <p className="text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

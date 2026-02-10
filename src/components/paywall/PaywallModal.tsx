/**
 * Paywall Modal Component
 * 
 * Non-anxious, value-first paywall for free users.
 * Shows benefits of subscribing and redirects to Stripe Checkout.
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { getStripe } from '@/lib/stripe/client';
import { Button } from '@/components/ui/button';
import { Compass, X, Loader2 } from 'lucide-react';

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubscribe = async () => {
        if (!user) {
            setError('Please sign in to subscribe');
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
                throw new Error(errorData.error || 'Failed to create checkout session');
            }

            const { url } = await response.json();

            if (!url) {
                throw new Error('No checkout URL received');
            }

            // Redirect to Stripe Checkout
            window.location.href = url;

        } catch (err: any) {
            console.error('Error creating checkout session:', err);
            setError(err.message || 'Something went wrong');
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#F5F5DC] rounded-lg max-w-md w-full p-8 relative shadow-xl">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[#8B4513] hover:opacity-70 transition-opacity"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                        <Compass className="w-8 h-8 text-[#D4AF37]" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-serif text-[#8B4513] text-center mb-4">
                    Your weekly insight is ready
                </h2>

                {/* Benefits */}
                <div className="space-y-4 mb-6">
                    <p className="text-[#8B4513] text-center opacity-80">
                        Subscribe to:
                    </p>
                    <ul className="space-y-3 text-[#8B4513]">
                        <li className="flex items-start">
                            <span className="mr-3 text-[#D4AF37] font-bold">✓</span>
                            <span>See your full insight</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-3 text-[#D4AF37] font-bold">✓</span>
                            <span>Access all past insights</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-3 text-[#D4AF37] font-bold">✓</span>
                            <span>Continue building your emotional clarity map</span>
                        </li>
                    </ul>
                </div>

                {/* Reassurance */}
                <p className="text-sm text-[#8B4513] opacity-70 text-center mb-6 italic">
                    No pressure. Your writing is always safe and private.
                </p>

                {/* Error message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <Button
                        onClick={handleSubscribe}
                        disabled={loading}
                        className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white font-medium py-6 text-base"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            'Subscribe Now'
                        )}
                    </Button>
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        className="w-full text-[#8B4513] hover:bg-[#8B4513]/5"
                        disabled={loading}
                    >
                        Maybe Later
                    </Button>
                </div>
            </div>
        </div>
    );
}

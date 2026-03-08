/**
 * Paywall Modal Component
 *
 * Non-anxious, value-first paywall for free users.
 * Shows benefits of subscribing and redirects to Stripe Checkout.
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Compass, X, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TrialExplainerCard } from '@/components/marketing/trial-explainer-card';

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
    const { user } = useAuth();
    const t = useTranslations('paywall');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubscribe = async () => {
        if (!user) {
            setError(t('signinRequired'));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = await user.getIdToken();
            const response = await fetch('/api/stripe/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || t('checkoutError'));
            }

            const { url } = await response.json();
            if (!url) {
                throw new Error(t('checkoutNoUrl'));
            }

            window.location.href = url;
        } catch (err: any) {
            console.error('Error creating checkout session:', err);
            setError(err.message || t('unknownError'));
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-3 sm:p-4">
            <div className="relative mx-auto my-4 w-full max-w-2xl rounded-lg bg-[#F5F5DC] p-5 shadow-xl sm:my-8 sm:p-8">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-[#8B4513] transition-opacity hover:opacity-70"
                    aria-label={t('close')}
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="mb-6 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D4AF37]/10">
                        <Compass className="h-8 w-8 text-[#D4AF37]" />
                    </div>
                </div>

                <h2 className="mb-4 text-center font-serif text-2xl leading-tight text-[#8B4513] sm:text-3xl">
                    {t('title')}
                </h2>

                <div className="mb-6 space-y-4">
                    <p className="text-center text-[#8B4513] opacity-80">{t('intro')}</p>
                    <ul className="space-y-3 text-[#8B4513]">
                        <li className="flex items-start">
                            <span className="mr-3 font-bold text-[#D4AF37]">✓</span>
                            <span>{t('benefit1')}</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-3 font-bold text-[#D4AF37]">✓</span>
                            <span>{t('benefit2')}</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-3 font-bold text-[#D4AF37]">✓</span>
                            <span>{t('benefit3')}</span>
                        </li>
                    </ul>
                </div>

                <div className="mb-6 min-w-0 overflow-hidden">
                    <TrialExplainerCard namespace="paywall" compact />
                </div>

                <p className="mb-6 text-center text-sm italic text-[#8B4513] opacity-70">
                    {t('reassurance')}
                </p>

                {error && (
                    <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={handleSubscribe}
                        disabled={loading}
                        className="w-full bg-[#D4AF37] py-6 text-base font-medium text-white hover:bg-[#D4AF37]/90"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('loading')}
                            </>
                        ) : (
                            t('subscribe')
                        )}
                    </Button>
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        className="w-full text-[#8B4513] hover:bg-[#8B4513]/5"
                        disabled={loading}
                    >
                        {t('later')}
                    </Button>
                </div>
            </div>
        </div>
    );
}

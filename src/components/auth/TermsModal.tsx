/**
 * Terms Acceptance Modal
 * 
 * Displayed when a user is logged in but hasn't accepted the terms yet.
 * Forces acceptance before proceeding.
 */

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

export function TermsModal() {
    const { user, termsAccepted, acceptTerms, loading } = useAuth();
    const [accepted, setAccepted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const pathname = usePathname();

    // Don't show if:
    // 1. Loading auth
    // 2. Not logged in
    // 3. Terms already accepted
    // 4. On the landing page (to avoid scaring visitors)
    if (loading || !user || termsAccepted === true || pathname === '/') return null;

    const handleAccept = async () => {
        if (!accepted) return;
        setSubmitting(true);
        try {
            await acceptTerms();
        } catch (error) {
            console.error('Failed to accept terms', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AlertDialog open={termsAccepted === false}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-serif">Terms Update</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-4 pt-2 text-base">
                        <p>
                            To continue using Aurum Sanctuary, you must accept our updated terms of use and privacy policy.
                        </p>
                        <p className="text-sm">
                            We updated our encryption protocols and legal notices to better protect your mental health data.
                        </p>

                        <div className="flex flex-col space-y-2 pt-2">
                            <Link
                                href="/terms"
                                target="_blank"
                                className="text-primary hover:underline text-sm font-medium"
                            >
                                Read Terms of Use
                            </Link>
                            <Link
                                href="/privacy"
                                target="_blank"
                                className="text-primary hover:underline text-sm font-medium"
                            >
                                Read Privacy Policy
                            </Link>
                        </div>

                        <div className="flex items-start space-x-2 pt-4">
                            <Checkbox
                                id="modal-terms"
                                checked={accepted}
                                onCheckedChange={(checked) => setAccepted(checked === true)}
                            />
                            <label
                                htmlFor="modal-terms"
                                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                I have read and accept the terms of use and privacy policy.
                            </label>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <Button
                        className="w-full"
                        disabled={!accepted || submitting}
                        onClick={handleAccept}
                    >
                        {submitting ? "Accepting..." : "Accept and continue"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

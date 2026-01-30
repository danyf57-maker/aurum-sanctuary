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

export function TermsModal() {
    const { user, termsAccepted, acceptTerms, loading } = useAuth();
    const [accepted, setAccepted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Don't show if not logged in, if still loading auth, or if terms already accepted
    if (loading || !user || termsAccepted === true) return null;

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
                    <AlertDialogTitle className="text-2xl font-serif">Mise à jour des Conditions</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-4 pt-2 text-base">
                        <p>
                            Pour continuer à utiliser Aurum Sanctuary, vous devez accepter nos nouvelles conditions d'utilisation et notre politique de confidentialité.
                        </p>
                        <p className="text-sm">
                            Nous avons mis à jour nos protocoles de chiffrement et nos mentions légales pour mieux protéger vos données de santé mentale.
                        </p>

                        <div className="flex flex-col space-y-2 pt-2">
                            <Link
                                href="/terms"
                                target="_blank"
                                className="text-primary hover:underline text-sm font-medium"
                            >
                                Lire les Conditions d'Utilisation
                            </Link>
                            <Link
                                href="/privacy"
                                target="_blank"
                                className="text-primary hover:underline text-sm font-medium"
                            >
                                Lire la Politique de Confidentialité
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
                                J'ai lu et j'accepte les conditions d'utilisation et la politique de confidentialité.
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
                        {submitting ? "Acceptation en cours..." : "Accepter et Continuer"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

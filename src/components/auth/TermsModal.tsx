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
import { useLocale } from '@/hooks/use-locale';
import { localizeHref } from '@/lib/i18n/path';
import { stripLocalePrefix } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export function TermsModal() {
    const { user, termsAccepted, acceptTerms, loading } = useAuth();
    const [accepted, setAccepted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const pathname = usePathname();
    const locale = useLocale();
    const t = useTranslations('termsModal');
    const to = (href: string) => localizeHref(href, locale);
    const normalizedPath = stripLocalePrefix(pathname || '/');

    // Don't show if:
    // 1. Loading auth
    // 2. Not logged in
    // 3. Terms already accepted
    // 4. On the landing page (to avoid scaring visitors)
    if (loading || !user || termsAccepted === true || normalizedPath === '/') return null;

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
                    <AlertDialogTitle className="text-2xl font-serif">
                        {t("title")}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-4 pt-2 text-base">
                        <p>{t("intro")}</p>
                        <p className="text-sm">
                            {t("detail")}
                        </p>

                        <div className="flex flex-col space-y-2 pt-2">
                            <Link
                                href={to('/terms')}
                                target="_blank"
                                className="text-primary hover:underline text-sm font-medium"
                            >
                                {t("readTerms")}
                            </Link>
                            <Link
                                href={to('/privacy')}
                                target="_blank"
                                className="text-primary hover:underline text-sm font-medium"
                            >
                                {t("readPrivacy")}
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
                                {t("checkbox")}
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
                        {submitting ? t("accepting") : t("accept")}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

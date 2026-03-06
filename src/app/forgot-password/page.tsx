/**
 * Forgot Password Page
 * 
 * Password reset email request.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useLocalizedHref } from '@/hooks/use-localized-href';
import { useTranslations } from 'next-intl';

export default function ForgotPasswordPage() {
    const { resetPassword } = useAuth();
    const to = useLocalizedHref();
    const t = useTranslations('forgotPassword');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string }>({});
    const [success, setSuccess] = useState(false);

    const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        setSuccess(false);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;

        const result = z.object({ email: z.string().email() }).safeParse({ email });
        if (!result.success) {
            setErrors({ email: t('invalidEmail') });
            setLoading(false);
            return;
        }

        try {
            await resetPassword(email);
            setSuccess(true);
        } catch (error) {
            // Error toast shown by AuthProvider
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                    <CardDescription>{t('description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="space-y-4">
                            <div className="rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                <p className="font-medium">{t('successTitle')}</p>
                                <p className="mt-1 text-sm">{t('successMessage')}</p>
                            </div>
                            <Button asChild className="w-full">
                                <Link href={to('/login')}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    {t('backToSignIn')}
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder={t('emailPlaceholder')}
                                    required
                                    disabled={loading}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email}</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? t('sending') : t('submit')}
                            </Button>
                        </form>
                    )}
                </CardContent>
                {!success && (
                    <CardFooter className="flex justify-center">
                        <Link
                            href={to('/login')}
                            className="flex items-center text-sm text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="mr-1 h-3 w-3" />
                            {t('backToSignIn')}
                        </Link>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}

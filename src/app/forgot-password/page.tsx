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

const forgotPasswordSchema = z.object({
    email: z.string().email('Email invalide'),
});

export default function ForgotPasswordPage() {
    const { resetPassword } = useAuth();
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

        // Validate
        const result = forgotPasswordSchema.safeParse({ email });
        if (!result.success) {
            const fieldErrors: { email?: string } = {};
            result.error.errors.forEach((err) => {
                if (err.path[0] === 'email') fieldErrors.email = err.message;
            });
            setErrors(fieldErrors);
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
                    <CardTitle>Mot de passe oublié</CardTitle>
                    <CardDescription>
                        Entrez votre email pour recevoir un lien de réinitialisation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="space-y-4">
                            <div className="rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                <p className="font-medium">Email envoyé !</p>
                                <p className="mt-1 text-sm">
                                    Vérifiez votre boîte de réception et suivez les instructions pour réinitialiser votre mot de passe.
                                </p>
                            </div>
                            <Button asChild className="w-full">
                                <Link href="/login">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Retour à la connexion
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
                                    placeholder="vous@exemple.com"
                                    required
                                    disabled={loading}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email}</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
                            </Button>
                        </form>
                    )}
                </CardContent>
                {!success && (
                    <CardFooter className="flex justify-center">
                        <Link
                            href="/login"
                            className="flex items-center text-sm text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="mr-1 h-3 w-3" />
                            Retour à la connexion
                        </Link>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
